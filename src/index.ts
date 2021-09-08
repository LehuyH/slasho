import Discord from "discord.js";
import glob from "glob";
import consola from "consola";
export interface Config extends Discord.ClientOptions {
  token: string;
  devGuild: string;
  commandsDir?: string;
  eventsDir?: string;
  commands?: Command<Discord.CommandInteraction>[];
  events?: Event<keyof ClientEvents>[];
  intents: (Discord.IntentsString | number)[];
}

export type CommandType = "slash";
export type EventType = keyof ClientEvents | string;

export type EventCollection = Discord.Collection<EventType, Event<EventType>[]>;
export interface CommandContext<InteractionType> {
  slashoApp: App<any>;
  client: Discord.Client;
  interaction: InteractionType;
  author: Discord.GuildMember;
}

export interface ClientEvents extends Discord.ClientEvents {
  commandError: [
    ctx: CommandContext<Discord.CommandInteraction>,
    error: Error,
    command: Command<Discord.CommandInteraction>
  ];
  validationError: [
    ctx: CommandContext<Discord.CommandInteraction>,
    command: Command<Discord.CommandInteraction>
  ];
  eventError: [ctx: EventContext<keyof ClientEvents>, error: Error];
  [index: string]: any;
}
export interface EventContext<K extends keyof ClientEvents> {
  slashoApp: App<any>;
  client: Discord.Client;
  event: ClientEvents[K];
}

export interface Event<K extends keyof ClientEvents> {
  id?: string;
  event: K;
  execute: ({ slashoApp, client, event }: EventContext<K>) => void;
}

export interface Command<InteractionType> {
  type: CommandType;
  name: string;
  description?: string;
  global?: boolean;
  options?: Discord.ApplicationCommandOptionData[];
  init?: (ctx: CommandContext<InteractionType>) => void;
  validate?: (ctx: CommandContext<InteractionType>) => boolean;
  middleware?: string[];
  execute: (ctx: CommandContext<InteractionType>) => void;
  complete?: (ctx: CommandContext<InteractionType>) => void;
  error?: (ctx: CommandContext<InteractionType>) => void;
}

export class App<StateType> {
  config: Config;

  state: StateType;

  client: Discord.Client;

  events = new Discord.Collection() as EventCollection;

  commands = {
    slash: new Discord.Collection(),
    text: new Discord.Collection(),
  };

  constructor(config: Config, state: StateType, autoLaunch = false) {
    // Default directory
    if (!config.commandsDir) config.commandsDir = "./commands";
    if (!config.eventsDir) config.eventsDir = "./events";

    // No shared directories
    if (config.commandsDir === config.eventsDir)
      throw new Error(
        "You must use separate directories for commands and events"
      );

    config.intents = config.intents.map((intent) => {
      if (typeof intent === "number") return intent;
      return Discord.Intents.FLAGS[intent];
    });

    this.config = config;
    this.state = state;
    this.client = new Discord.Client(this.config);

    if (autoLaunch) this.launch();
  }

  /** Initialize bot internals and login to the bot.
   * Call .dev() or .production() after launching to sync slash commands! */
  async launch(): Promise<this> {
    const vm = this;
    this.loadCommands();
    this.loadEvents();

    consola.info("Connecting to Discord...");
    await vm.client.login(this.config.token);
    await new Promise((resolve) => {
      vm.client.once("ready", (readyClient) => {
        consola.info("Mounting events...");
        vm.mountEvents();
        consola.ready("Bot is Ready!");
        vm.triggerEvent("ready", readyClient);
        resolve(true);
      });
    });

    return vm;
  }

  /** Load a Slasho Command into the bot. Will NOT deploy the command*/
  loadCommand(command: Command<Discord.CommandInteraction>): this {
    if (!command.type) {
      command.type = "slash";
      consola.warn(
        `Command "${command.name}" doesn't have a type specified. Command will be handled as Slash by default`
      );
    }
    // Name already in use! Warn user
    if (this.commands[command.type].get(command.name))
      consola.warn(
        `Multiple commands with the name "${command.name}". Command names should be unique! Overwriting...`
      );
    this.commands[command.type].set(command.name, command);

    return this;
  }

  /** Load a Slasho event listener*/
  loadEvent(eventData: Event<any>): this {
    const eventsRegistered = this.events.get(eventData.event);

    // Create a default array if it doesn't exist'
    if (!eventsRegistered) this.events.set(eventData.event, []);

    // Create a default array if it doesn't exist'
    if (!eventsRegistered) this.events.set(eventData.event, []);
    this.events.get(eventData.event)?.push(eventData);

    return this;
  }

  /** Destroy ALL listeners on a Slasho event. Passing an ID will only remove the listener with the id*/
  unloadEvent(eventName: keyof ClientEvents | string, id?: string): this {
    if (!id) {
      this.events.delete(eventName);
      return this;
    }

    const eventsRegistered = this.events.get(eventName);

    //Event does not exist
    if (!eventsRegistered) return this;

    const indexOfEvent = eventsRegistered.findIndex((e) => e.id === id);
    if (indexOfEvent === -1) return this;

    eventsRegistered.splice(indexOfEvent, 1);
    this.events.set(eventName, eventsRegistered);

    return this;
  }

  /** Used internally to import commands from config.commandsDir */
  loadCommands(): this {
    const vm = this;
    const commandsDir = glob.sync(`${vm.config.commandsDir}/**/*.js`);
    if (commandsDir.length === 0 && !this.config.commands)
      throw new Error(
        `Please specify an array of commands or a (non empty) commandsDir in the configuration`
      );

    //Load from directory
    commandsDir.forEach((commandPath) => {
      const importedCommand =
        require(commandPath) as () => void | Command<Discord.Interaction>;
      const defaultCmdName = commandPath.split("/").reverse()[0].split(".")[0];

      // Create a new command if user only provided a function
      const command = (
        typeof importedCommand === "function"
          ? {
              name: defaultCmdName,
              execute: importedCommand as () => void,
              type: "slash",
            }
          : importedCommand
      ) as Command<Discord.CommandInteraction>;

      if (!command.name) command.name = defaultCmdName;

      this.loadCommand(command);
    });

    //Load from config
    this.config.commands?.forEach((command) => {
      vm.loadCommand(command);
    });
    return vm;
  }

  /** Used internally to import commands from config.eventsDir */
  loadEvents(): this {
    const eventsDir = glob.sync(`${this.config.eventsDir}/**/*.js`);
    const vm = this;

    //Load from directory
    eventsDir.forEach((eventPath) => {
      const eventFunction = require(eventPath) as Event<any>;
      vm.loadEvent(eventFunction);
    });

    //Load from config
    this.config.events?.forEach((eventFunction) => {
      vm.loadEvent(eventFunction);
    });

    return this;
  }

  /** Used internally to register events from discord */
  mountEvents(): this {
    const vm = this;
    this.client.on("interactionCreate", (interaction) => {
      if (!interaction.isCommand()) return;

      //Change name if it is a dev command
      const name = interaction.commandName.startsWith("dev-")
        ? interaction.commandName.replace("dev-", "")
        : interaction.commandName;

      // Get command data from command name
      const command = this.commands.slash.get(
        name
      ) as Command<Discord.CommandInteraction>;
      this.executeCommand(interaction, command);
    });
    this.client.on("rateLimit", (info) => {
      consola.info(
        `You are being rate limited - ${info.method.toUpperCase()} ${
          info.path
        } Waiting ${info.timeout}ms`
      );
    });

    // This loops and bind events, it isn't actually a map
    this.events.map((eventHandlers, eventName) => {
      // We do not want to register non-discord.js events
      if (typeof eventName === "string" && customEvents.includes(eventName))
        return eventName;

      vm.client.on(eventName as any, (event) => {
        vm.triggerEvent(eventName, event);
      });

      return eventName;
    });

    return vm;
  }

  /** Used internally to trigger registered events handlers. */
  triggerEvent(eventName: keyof ClientEvents | string, event: any): this {
    const eventHandlers = this.events.get(eventName);
    const vm = this;
    if (!eventHandlers) return vm;

    eventHandlers.forEach((eventHandler) => {
      const ctx = {
        slashoApp: vm,
        client: vm.client,
        event,
      };
      try {
        eventHandler.execute(ctx);
      } catch (err) {
        consola.error(err);
        vm.triggerEvent("eventError", [ctx, err]);
      }
    });

    return vm;
  }

  /** Handle an incoming command interaction */
  async executeCommand(
    interaction: Discord.CommandInteraction,
    command: Command<Discord.CommandInteraction>
  ): Promise<this> {
    if (!command) {
      consola.warn(`No command for interaction "${interaction.command?.name}"`);
      return this;
    }

    const ctx = {
      slashoApp: this,
      client: this.client,
      interaction,
      author: interaction.member,
    } as CommandContext<Discord.CommandInteraction>;

    if (command.init) await command.init(ctx);
    const validated = command.validate ? await command.validate(ctx) : true;
    if (!validated) {
      this.triggerEvent("validationError", [ctx, command]);
      return this;
    }

    try {
      await command.execute(ctx);
    } catch (err) {
      consola.error(err);
      this.triggerEvent("commandError", [ctx, err, command]);
    }
    return this;
  }

  /** Deploys loaded commands to the config.devGuild */
  async dev(): Promise<this> {
    consola.info("Deploying Slash Commands to DevGuild...");

    const devGuild = await this.client.guilds.fetch(this.config.devGuild);
    if (!devGuild) {
      consola.warn(
        `DevGuild with id "${this.config.devGuild}" was not found. Deploy cancelled"`
      );
      return this;
    }

    // Deploy commands to DevGuild
    await devGuild.commands.set(
      this.commands.slash.map((c) => {
        const command = c as Command<Discord.CommandInteraction>;

        if (!command.description) {
          command.description = `The ${command.name} command`;
          consola.warn(`The "${command.name}" command has no description!`);
        }

        return {
          name: `dev-${command.name}`,
          description: command.description,
          options: command.options,
        };
      }) as Discord.ApplicationCommandData[]
    );

    consola.success(
      `${
        (await devGuild.commands.fetch()).size
      } Command(s) deployed on DevGuild NOTE: Dev commands are prefixed with dev-`
    );
    return this;
  }

  /** Deploys loaded commands to ALL guilds */
  async production(): Promise<this> {
    if (!this.client.application) {
      consola.error("Could not deploy globally: no application was loaded");
      return this;
    }
    consola.info("Deploying Slash Commands Globally...");

    //Clear commands in devGuild
    const devGuild = await this.client.guilds.fetch(this.config.devGuild);
    if (devGuild) {
      await devGuild.commands.set([]);
    }

    await this.client.application.commands.set(
      this.commands.slash
        .map((c) => {
          const command = c as Command<Discord.CommandInteraction>;

          if (!command.description) {
            command.description = `The ${command.name} command`;
            consola.warn(`The "${command.name}" command has no description!`);
          }

          return {
            name: command.name,
            description: command.description,
            global: command.global !== false,
            options: command.options,
          };
        })
        .filter((c) => c.global) as Discord.ApplicationCommandData[]
    );

    consola.success(
      `${
        (await this.client.application.commands.fetch()).size
      } Commands deployed Globally NOTE: Commands take a bit to propagate fully`
    );
    return this;
  }
}

const customEvents = ["commandError", "validationError", "eventError"];

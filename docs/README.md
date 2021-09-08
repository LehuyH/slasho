<p align="center"><img align="center" style="width:320px" src="https://raw.githubusercontent.com/LehuyH/slasho/main/.github/slasho_logo.png" /></p>

>  ⚠️  **Slasho is under heavy development**: Expect changes to the  underlying API as we build things out!

<div class="center">
<b>Slasho is a minimal framework for making Discord bots. It's for bot developers who want a clean environment with the core functionality they need to dive straight into building their bots.</b>

Welcome to the Official Slasho Documentation! Here we'll cover the basics, examples, and common patterns on how to build your very first slasho bot. 
</div>

## Getting Started

### Installation

Use the package manager [npm](https://www.npmjs.com/) to install slasho.

```bash
npm install discord-slasho
```

### Creating a Bot
> All examples are written in TypeScript! Please note that if you are using JavaScript, the examples are very similar (usually a matter of dropping the type annotations).

Firstly, you need to setup a discord bot application. You can do so [here](https://discord.com/developers/applications). We assume that you have already configured the application and have obtained the ``token`` for the bot.

### Adding your bot to a development server
It's best practice to test your bot and slash commands in a dedicated testing server. Add your bot into a development server and copy the ``server id``. Slasho will use this server as it's homebase during development!

### Creating a new SlashoApp
Go ahead and create a new file named ``index.ts``. 
Import the ``Slasho.App`` class and initialize it by passing configuration in the first parameter. 
It uses the same options as a discord.js client with a couple new options for Slasho.

The second parameter is a **default state**. You can think of this as something that can be accessed by any command or event. For now, we will pass in an empty object.

```ts
import * as Slasho from 'discord-slasho'

const bot = new Slasho.App<any>({
    token:"YOUR_TOKEN",
    devGuild:"DEV_GUILD_ID",
    //This tells discord what events you want to receive. GUILDS is required here!
    intents:["GUILDS"],
    //This is where our commands will go :)
    commands:[]
},{})
//That empty object is simply the default state. State is accessible across all events/commands
```

### Writing your first command
Let's begin with a classic example, we will create a simple command that will simply reply when it's used.

On top of where you created a new ``Slasho.App``, add the following:
```ts
import { CommandInteraction } from "discord.js";

const pingCommand = {
  //Command metadata
  type: "slash",
  name: "ping",
  description: "ping pong!",

  //Main execution function, this is where you should put command logic
  execute({ interaction }) {
    interaction.reply(` 🏓 ${interaction.options.getUser("user").username}`);
  },
} as Slasho.Command<CommandInteraction>;
```
Now, let's add it into the bot configuration below.

```ts
commands:[pingCommand]
```
Awesome, that was easy! That's seriously all it takes to build commands with Slasho. Feel free to add a couple other commands if you want to :)

### Getting your bot online
To get your bot online, you need to run the ``launch`` function. At the bottom of your file, add the following
```ts
bot.launch()
```
### Launching your bot
Simply run ``.launch()``
```ts
//Login to discord and binds events
bot.launch()
```

Now, build your bot using ``tsc`` or another tool

> You can skip this build step if you are using javascript

Run the built javascript file, hopefully if all goes well, you should see this in the console


```bash
i Connecting to Discord..
i Mounting events..    
ready Bot is Ready!  
```
If you are stuck on "Connecting to Discord", stop the script and run it after a while (Discord ratelimits connections)
You should now see that the bot is online, nice! But have you noticed how there's no commands?

By default, none of your commands are pushed to discord. You need to deploy commands __before__ you can use them.

### Deploying Commands
To deploy commands onto the testing server, simply run the ``.dev()``
```ts
bot.launch().then(()=>{
    //Deploys loaded commands to the config.devGuild
    bot.dev()
})
```
Now, when you build and run the script, you should see something like this
```bash
i Connecting to Discord..
i Mounting events..
ready Bot is Ready!
i Deploying Slash Commands to DevGuild..
√ 1 Command(s) deployed on DevGuild NOTE: Dev commands are prefixed with dev-
```
Keep in mind that last note, dev commands are prefixed with dev-. So the ping command we just created will become ``/dev-ping`` in testing

Try it out! It should be available on the bot now!

Nice! It only took use a couple of lines to get slash commands working with Slasho.

### Writing Events
Events, like commands, can be loaded using config.eventDir or an array of event objects in config. Slasho handles the execution of all base discord.js events, and you can also create and call custom events on the fly. More information can be found the dedicated page for events.
```ts
import { Event, ClientEvents } from "discord-slasho";

export default {
  //Event name, can be any discord.js event or a custom defined one
  event: "ready",
  //Set activity when bot is loaded
  execute({ client }) {
    client.user.setActivity("Built with Slashoooo!!");
  },
} as Event<keyof ClientEvents>;

```

### Deploying Commands
In order to use the commands, you need to deploy them. Slasho provides utility functions to deploy any loaded functions. These must be called **after** launching!
```ts
//Deploy commands to dev guild
bot.dev()

//Deploy commands globally
bot.production()
```

🥳 That's all you need to get a modern discord bot up and running! Simple isn't it?
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Make sure to lint 😉

Please make sure to update tests as appropriate.


## License
[MIT](https://choosealicense.com/licenses/mit/)
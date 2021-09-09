<p align="center"><img alt="Slasho" align="center" style="width:320px" src="https://raw.githubusercontent.com/LehuyH/slasho/main/.github/slasho_logo.png" /></p>

>  ⚠️  **Slasho is under heavy development**: Expect changes to the underlying API as we build things out! Please also note that the docs are a WIP

<div class="center">
<b>Slasho is a minimal framework for making Discord bots. It's for bot developers who want a clean environment with the core functionality they need to dive straight into building their bots.</b>

Welcome to the Official Slasho Documentation! Here we'll cover the basics, examples, and common patterns on how to build your very first slasho bot. 
</div>

## Getting Started

### Installation

Use the package manager [npm](https://www.npmjs.com/package/discord-slasho) to install slasho.

```bash
npm install discord-slasho
```

### Creating a Bot
> All examples are written in TypeScript! Please note that if you are using JavaScript, the examples are very similar (usually a matter of dropping the type annotations).

Firstly, you need to set up a discord bot application. You can do so [here](https://discord.com/developers/applications). We assume that you have already configured the application and have obtained the ``token`` for the bot.

### Adding Your Bot To a Development Server
It's best practice to test your bot and slash commands in a dedicated testing server. Add your bot into a development server and copy the ``server-id``. Slasho will use this server as its home base during development!

### Creating a New Slasho.App
Go ahead and create a new file named ``index.ts``. 
Import the ``Slasho.App`` class and initialize it by passing configuration in the first parameter. 
It uses the same options as a discord.js client with a couple of new options for Slasho.

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
//That empty object is simply the default state. The state is accessible across all events/commands
```

### Writing Your First Command
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
  async execute({ interaction }) {
    interaction.reply(` 🏓 ${interaction.member.user.username}`);
  },
} as Slasho.Command<CommandInteraction>;
```
Now, let's add it to the bot configuration below.

```ts
commands:[pingCommand]
```
Awesome, that was easy! That's seriously all it takes to build commands with Slasho. Feel free to add a couple of other commands if you want to :)
### Launching Your Bot
Simply run ``.launch()``
```ts
//Login to discord and binds events
bot.launch()
```

Now, build your bot using ``tsc`` or another tool

> You can skip this build step if you are using javascript

Run the built javascript file, hopefully, if all goes well, you should see this in the console


```bash
i Connecting to Discord..
i Mounting events..    
ready Bot is Ready!  
```
If you are stuck on "Connecting to Discord", stop the script and run it after a while (Discord ratelimits connections)
You should now see that the bot is online, nice! But have you noticed how there are no commands?

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

<img alt="Slash commands working!" align="center" src="https://raw.githubusercontent.com/LehuyH/slasho/main/.github/slashcommand.png" />

Nice! It only took you a couple of lines to get slash commands working with Slasho.

### Adding Options to Commands
Let's configure our ping command to collect some options from the user. Underneath the ping command's description, add the following
```ts
options:[
    {
      name:"user",
      description: "The user to ping",
      type:"USER",
      required:true
    }
],
```
Now, let's update the main execution function so that it pings the user that was inputted
```ts
async execute({ interaction }) {
    interaction.reply(` 🏓 <@${await interaction.options.getUser('user').id}>`);
}
```
Rebuild and run your script. The bot should redeploy the changes into the ``/dev-ping`` command. Try it out!

<img alt="Adding an option to our ping command" align="center" src="https://raw.githubusercontent.com/LehuyH/slasho/main/.github/options.png" />
<img alt="It works!" align="center" src="https://raw.githubusercontent.com/LehuyH/slasho/main/.github/optionsreply.png" />

### Writing Your First Event
Sometimes, you might want to run some code outside of normal commands. This is where **events** come in. Slasho provides an easy way to work with discord events. Let's create a new event handler right now!

> Some events will not be triggered if the corresponding discord intent in config.INTENT is not specified

Let's create a new event handler that will change the bot's status when the bot goes online. On top of your bot configuration, add the following
```ts
const onReady = {
  //Event name, can be any discord.js event or a custom defined one
  event: "ready",
  //Set activity when bot is loaded
  execute({ client }) {
    client.user.setActivity("Built with Slashoooo!!");
  },
} as Slasho.Event<keyof Slasho.ClientEvents>;
```

Again, let's add it to the bot configuration below.
```ts
events:[onReady]
```

Now, when you build and run the script, the bot should have a custom status when it's online.

<img alt="OnReady event working!" align="center" src="https://raw.githubusercontent.com/LehuyH/slasho/main/.github/status.png" />

Slasho handles the triggering of events, all you need to do is provide the code you want to run :)


### Deploying Commands Globally
So far, the ping command is only available on your development server. Slasho provides utilities that can deploy commands globally. Modify the code that deploys commands to the dev server to the following
```ts
bot.launch().then(()=>{
    //Deploys to ALL servers
    bot.production()
})
```
Build the script and run it again. This time you should see a different message in the console window
```bash
i Connecting to Discord..
i Mounting events..
ready Bot is Ready!
i Deploying Slash Commands Globally..
√ 1 Commands deployed Globally NOTE: Commands take a bit to propagate fully
```
Nice! Please note that you have to wait (at most an hour) before you can use global commands. After discord publishes the command you should be able to use the command without the dev prefix using ``/ping``.

### Conclusion
🥳 That's all you need to get a modern discord bot up and running! Simple isn't it?
Hopefully, you find that Slasho provides a simple way to build up discord bots!

In this guide you
* Built a modern bot with slash commands
* Learned how to accept slash commands options
* Learned how to test and deploy slash commands

As you continue to build bigger bots, an issue you might face is that having a lot of commands and events can make code pretty messy! Luckily, you can use Slasho's **file-based** commands/events

Simply create a folder for events and commands and define them in the configuration.

```ts
//Instead of commands, define a command directory
commandsDir:__dirname + "/commands",
```
Now in a folder named ``commands``, I can create a file called ``ping.js``
```js
/* commands/ping.js*/
module.exports = {
    //Command metadata
    type: "slash",
    name: "ping",
    description: "ping pong!",
    options:[
      {
        name:"user",
        description: "The user to ping",
        type:"USER",
        required:true
      }
    ],
  
    //Main execution function, this is where you should put command logic
    async execute({ interaction }) {
      interaction.reply(` 🏓 <@${await interaction.options.getUser('user').id}> LMAO`);
    },
} 
```

Rebuild and run the script and now you should be able to run the command the same way as usual. Now if you want to create a new command, all you need to do is create a new file in that folder and run ``.dev()`` or ``.production()``

It's the same process with events too!

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Make sure to lint 😉

Please make sure to update tests as appropriate.


## License
[MIT](https://choosealicense.com/licenses/mit/)
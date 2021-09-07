# Slasho

Slasho is a minimal framework for making Discord bots. It's for bot developers who want a clean, minimal environment with the core functionality they need to dive straight into building their bots.
>  ⚠️  **Slasho is under heavy development**: Expect changes to the  underlying API as we build things out!
## Features
* Uses modern Discord APIs (discord.js v13)
* Optional file-system based command and event handling system
* Introduces command lifecycle utilities like init and validate'
* Utility to handle deployment of slash commands in both development and production
* Shared state across commands 



## Installation

Use the package manager [npm](https://www.npmjs.com/) to install slasho.

```bash
npm install slasho
```

## The Basics
📚 _For full documentation, please visit (docs coming soon)_

### Setting up the enviroment
In the future, we will provide a scaffolding tool / templates. 
If you are using TS please make sure to build the bot using ``tsc`` or something similar __before__ running the bot

### Creating a new SlashoApp
import the Slasho.App class and initialize it by passing configuration in the first parameter. 
It uses the same options as discord.js with a couple new options for Slasho
```ts
import * as Slasho from 'slasho'

const bot = new Slasho.App<any>({
    token:"YOUR_TOKEN",
    devGuild:"DEV_GUILD_ID",
    intents:["GUILDS"],
    commandsDir:"./commands"
},{})
//That empty object is simply the default state. State is accessible across all events/commands
```
By passing a commandsDir, Slasho will automatically create slash commands based off of the files in that directory

### Writing Commands
Here's a very basic example of what a command in Slasho looks like
```ts
/* ./commands/ping.ts */
import { CommandInteraction } from "discord.js";
import { Command } from "slasho";

export default {
  //Command metadata
  type: "slash",
  name: "ping",
  description: "ping pong!",
  //Options that you want discord to collect
  options: [
    {
      name: "user",
      description: "User to ping pong!",
      type: "USER",
      required: true,
    },
  ],
  //Main execution function, see Command Life Cycle in docs for more info
  execute({ interaction }) {
    interaction.reply(` 🏓 ${interaction.options.getUser("user").username}`);
  },
} as Command<CommandInteraction>;
```
Alternatively, you can pass commands as an array in configarution directly
```ts
{
  token: "YOUR_TOKEN",
  devGuild: "DEV_GUILD_ID",
  intents: ["GUILDS"],
  commands: [
    //commands
  ],
}
```
### Writing Events
Events are very similar to commands and can be loaded via config.eventDir or an array of events in config.
Slasho handles the execution of all base discord.js events, you can create and call your own custom events on the fly as well. Check the docs for more info on that.
```ts
import { Event, ClientEvents } from "slasho";

export default {
  //Event name, can be any discord.js event or a custom defined one
  event: "ready",
  //Set activity when bot is loaded
  execute({ client }) {
    client.user.setActivity("Built with Slashoooo!!");
  },
} as Event<keyof ClientEvents>;

```
### Launching your bot
Simply run ``.launch()``
```ts
//Login to discord and binds events
bot.launch()
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
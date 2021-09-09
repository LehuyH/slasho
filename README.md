<p align="center"><img align="center" style="width:320px" src="https://raw.githubusercontent.com/LehuyH/slasho/main/.github/slasho_logo.png" /></p>
<br />
<p align="center">
  <a href="https://github.com/LehuyH/slasho/blob/main/LICENSE">
    <img alt="GitHub license"src="https://badgen.net/github/license/lehuyh/slasho"/>
  </a>
  <a href="https://github.com/LehuyH/slasho/">
    <img alt="Release Tag"src="https://badgen.net/github/tag/lehuyh/slasho"/>
  </a>
  <a href="https://lehuyh.github.io/slasho/#/">
    <img alt="Github Pages" src="https://badgen.net/badge/Documentation/GitHub%20Pages/green">
  </a>
</p>

Slasho is a minimal framework for making Discord bots. It's for bot developers who want a clean environment with the core functionality they need to dive straight into building their bots.

>  ⚠️  **Slasho is under heavy development**: Expect changes to the  underlying API as we build things out!


<b><a href="https://lehuyh.github.io/slasho/#/?id=getting-started" target="_blank">📌 Getting Started Guide</a></b>

## Features
* Uses modern Discord APIs (discord.js v13)
* Optional file-system based command and event handling system
* Introduces command lifecycle utilities like init and validate'
* Utility to handle deployment of slash commands in both development and production
* Shared state across commands 


**When using discord.js, developers run into a number of problems**
* A lot of boilerplate. It's not hard to write discord.js, but it can be difficult to maintain.
* Slash command testing. Developers have to setup new workflows to test slash commands.
* Lack of command/event handling utilities
* No command lifecycle utilities to setup, validate, and deploy commands


**Slasho** is here to fix all of these problems!  


## Features
* Uses modern Discord APIs and supports slash commands out of the box
* No learning curve. Slasho builds on top of discord.js and works well with existing logic
* Single-file commands/events, just create new files to extend the bot's functionality
* Introduces command lifecycle utilities like init and validate
* Slash command deployment for development and production cases
* Shared state across commands 

## Installation

Use the package manager [npm](https://www.npmjs.com/package/discord-slasho) to install slasho.

```bash
npm install discord-slasho
```

## How it works
Here's a very basic example of what a command in Slasho looks like
```ts
/* ./commands/ping.ts */
import { CommandInteraction } from "discord.js";
import { Command } from "discord-slasho";

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
**📚 Please check out [the docs](https://lehuyh.github.io/slasho/#/) for more information.**

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Make sure to lint 😉

Please make sure to update tests as appropriate.


## License
[MIT](https://choosealicense.com/licenses/mit/)

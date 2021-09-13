# Commands
Slasho uses commands and transforms them to discord slash commands when deployed. You can fine-tune the behavior of your commands by using the techniques shown below.

## Command Life Cycle
### Overview
In Slasho, you can provide hooks that will be run at different times inside a command. When a slash command is ran, Slasho will attempt to execute these hooks in the order specified below.

**init -> validate -> execute -> complete**

If an error occurs during the life cycle, slasho will execute the ``error`` hook first, followed by the ``complete`` hook. Slasho will not run any further hooks during an error.

### The init hook
This method will be run first, it must execute **without throwing an error**. Use this hook if you need to set up some stuff _before_ any actual logic gets executed

### The validate hook
This method will be executed after the ``init`` hook and must return a **boolean value (true/false)**. The command will continue if ``validate`` is true, if it is not then the command will not be executed and a ``validationError`` event will be triggered. Use this hook if you want to restrict a command to a certain condition

### The execute hook
The main logic of a command should be in the ``execute`` hook. This hook will usually contain the bulk of the code for a command.

### The error hook
If any of the hooks in a command (except an error hook) throws an error, Slasho will run this ``error`` hook. Use this hook if you want to implement any command-specific error handlers.

### The complete hook
When provided, the ``complete`` will run once the command life cycle has finished. This includes when the life cycle exits on an ``error`` or ``validate`` hook. Use this hook if you need to clean up anything in the background once a command has finished.

## Command Context
During all parts of the command life cycle, you have access to the **Command Context** which is an ``object`` that is passed as a parameter to the methods

| Property| Type | Description |
|---------|------|-------------|
|``slashoApp``|Slasho.App| The instance of the current Slasho App|
|``client``|Discord.Client| The instance of the current Discord.js client the bot is using|
|``interaction``|Discord.CommandInteraction| The interaction that triggered the command|
|``author``|Discord.GuildMember| The guild member that triggered the command|

### Writing Commands
Commands are an ``object`` with a type of ``Slasho.Command<CommandInteraction>``
Here's a full example of how to write a command
```ts
{
  //Command metadata
  type: "slash",
  name: "shutdown",
  description: "shutdown the bot",
  options:[
    {
      name:"lastwords",
      description: "Bot's last words",
      type:"STRING",
      required:true
    }
  ],
  init(){
    //Setup stuff
  },
  validate({author}){
    //Example of a validation function
    if(author.id === "OWNER_ID") return true

    return false
  },
  async execute(context) {
    //Example of some command logic
    await context.interaction.reply("goodbye " + context.interaction.options.getString("lastwords"))
    context.client.destroy()
  },
  error(){
    //If there was something wrong during the command, this method would have been executed
  },
  completed({slashoApp}){
    console.log("State before client shutdown \n" + JSON.stringify(slashoApp.state))
  }
}as Slasho.Command<CommandInteraction>
```

| Property| Type | Description | Required |
|---------|------|-------------|----------|
|``type``|"slash"| The type of command (only slash is supported)|Yes
|``name``|string| The name of the command|Yes
|``description``|string| The interaction that triggered the command|Yes
|``global``|boolean| If false, the command will NOT be deployed when deploying globally| No (default=true)
|``options``|Discord.ApplicationCommandOptionData[]| An array of options that you want the command to collect|No
|``init``|(ctx: CommandContext) => void;|[Init Hook](#The-init-hook)|No
|``validate``|(ctx: CommandContext) => boolean;|[Validate Hook](#The-validate-hook)|No
|``execute``|(ctx: CommandContext) => void;|[Execute Hook](#The-execute-hook)|No
|``error``|(ctx: CommandContext) => void;|[Error Hook](#The-error-hook)|No
|``complete``|(ctx: CommandContext) => void;|[Complete Hook](#The-complete-hook)|No


## Deploying Commands
Because of Discord's limits, Slasho does not publish commands that you create to discord automatically. Instead, Slasho provides utilities to help deploy commands in both development and production.

### Development

```ts
//Bot is an instance of the Slasho.App Class
bot.dev()
```  

This will publish commands onto your ``devGuild`` that was provided in configuration. Command names are prefixed with ``dev-`` so a ``/ping`` command would become ``/dev-ping``

### Production

```ts
//Bot is an instance of the Slasho.App Class
bot.production()
```  

This will publish commands onto your bot's application itself and it will be accessible globally.

> Discord takes up to an hour to fully publish global commands. You might have to wait a bit for commands to update
# Events
Slasho can be used to listen and handle discord.js events .

### Default Events
Slasho supports the events on this [list](https://discord-ts.js.org/docs/general/events/) as well as `commandError`, `validationError`, and `eventError`.

### Custom Events
You can also create your own events by using the ``triggerEvent`` method on your Slasho App.
```ts
app.triggerEvent("eventName", payload);
```

### Writing Events
Events are an ``object`` with a type of ``Slasho.Event``
Here's a full example of how to write an evnet
```ts
{
  //Event metadata
  event: "messageDelete",
  async execute(context) {
    //Example of some event logic
    context.event.channel.send(`${context.event.author} said "${context.event}" but then deleted it`)
  }
} as Slasho.Event<keyof Slasho.ClientEvents>;
```

### Event Context
The event context is an ``object`` that is passed as a parameter to the execute method of the event.

| Property| Type | Description |
|---------|------|-------------|
|``slashoApp``|Slasho.App| The instance of the current Slasho App|
|``client``|Discord.Client| The instance of the current Discord.js client the bot is using|
|``event``|any| The event data, varies on the type of event|

### Loading Events
Slasho will load all events in the events folder (if specified) as well as any events passed in the app's configuration "events" array.
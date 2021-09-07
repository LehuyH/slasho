const Slasho = require('../dist/').default

const dummyConfig = {
    token: "test",
    intents: ["GUILDS"],
    commandDir:"/random"
}


let bot = new Slasho.App(dummyConfig,false)

describe('Slasho Initializer', () => {

    it('should initialize using provided parameters', () => {
        expect(bot.config).toBe(dummyConfig)
    })

    it('should error when trying to load a non existing command dir', () => {
        delete bot.config.commandsDir
        expect(bot.loadCommands).toThrow()
    })

    it('should load commands if command dir exists', () => {
        bot.config.commandsDir = require("path").join(__dirname, "/commands")
        expect(bot.loadCommands().commands.slash.size).toBe(1)
    })

    it('should load commands dynamically', () => {
        expect(bot.loadCommand({
            name:"testcmd",
            type:"slash",
            execute: ()=> "test"
        }).commands.slash.size).toBe(2)
    })

    it('should load events if events dir exists', () => {
        bot.config.eventsDir = require("path").join(__dirname, "/events")
        expect(bot.loadEvents().events.get('ready').length).toBe(1)
    })

    it('should load events dynamically', () => {
        expect(bot.loadEvent({
            event:"ready",
            id:"myid",
            execute: ()=> "test"
        }).events.get('ready').length).toBe(2)
    })

    it('should delete a single event handler', () => {
       expect(bot.unloadEvent('ready','myid').events.get('ready').length).toBe(1)
    })
    
    it('should delete all event handlers for ready events', () => {
        expect(bot.unloadEvent('ready').events.get('ready')).toBeUndefined()
     })

})
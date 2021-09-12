const Slasho = require('../dist/')

const dummyConfig = {
    token: "test",
    intents: ["GUILDS"],
    commandDir:"/random"
}




describe('Slasho Initializer', () => {
    const bot = new Slasho.App(dummyConfig,{})
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

describe('Slasho Command Execution', () => {
    const bot = new Slasho.App(dummyConfig,{
        testAll:0,
        testErr:0,
        testFailValidate:0
    })
    bot.loadCommand({
        name:"testall",
        type:"slash",
        init: ({slashoApp})=>{
            slashoApp.state.testAll++
        },
        validate: ({slashoApp})=>{
            slashoApp.state.testAll++
            return true
        },
        execute: ({slashoApp})=>{
            slashoApp.state.testAll++
        },
        complete: ({slashoApp})=>{
            slashoApp.state.testAll++
        },
        error: ({slashoApp})=>{
            slashoApp.state.testAll++
        }
    })
    bot.loadCommand({
        name:"testerror",
        type:"slash",
        init: ({slashoApp})=>{
            slashoApp.state.testErr++
        },
        validate: ()=>{
            throw new Error("Error")
        },
        error: ({slashoApp})=>{
            slashoApp.state.testErr++
        },
        complete: ({slashoApp})=>{
            slashoApp.state.testErr++
        }
    })

    bot.loadCommand({
        name:"testfailvalidate",
        type:"slash",
        init: ({slashoApp})=>{
            slashoApp.state.testFailValidate++
        },
        validate: ({slashoApp})=>{
            slashoApp.state.testFailValidate++
            return false
        },
        execute: ({slashoApp})=>{
            slashoApp.state.testFailValidate++
        },
        complete: ({slashoApp})=>{
            slashoApp.state.testFailValidate++
        },
        error: ({slashoApp})=>{
            slashoApp.state.testFailValidate++
        }
    })
    it('should run all command hooks when executed',async () => {
        await bot.executeCommand({member:null,name:null},bot.commands.slash.get('testall'))
        expect(bot.state.testAll).toBe(4)
    })

    it('should skip execution hook when validate is false',async () => {
        await bot.executeCommand({member:null,name:null},bot.commands.slash.get('testfailvalidate'))
        expect(bot.state.testFailValidate).toBe(3)
    })

    it('should run error hook when a hook fails',async () => {
        await bot.executeCommand({member:null,name:null},bot.commands.slash.get('testerror'))
        expect(bot.state.testErr).toBe(3)
    })
})
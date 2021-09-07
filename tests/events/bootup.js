module.exports = {
    event:"ready",
    execute({client}){
        client.user.setActivity("I'm ready!"); 
    }
}
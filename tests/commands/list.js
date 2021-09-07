module.exports = {
    type:"slash",
    description:"Add someeone to the list!",
    options:[
        {
            name:"name",
            description:"Who you want to BAM",
            type:"USER",
            required:true,
        }
    ],
    async execute ({interaction,slashoApp}){
        if(!slashoApp.state.thelist) slashoApp.state.thelist = []

        slashoApp.state.thelist.push(interaction.options.get('name').value.username)
        interaction.reply(":clipboard: " + interaction.options.get('name').value.username + "\n The list: " + slashoApp.state.thelist)

    }
}
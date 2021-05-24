import { Client, Collection, Message } from 'discord.js'
import path from 'path'
import fs from 'fs'

interface BaconClient extends Client {
  commands: Collection<String, any>
}

const Reload = {
  name: 'reload',
  description: 'Reloads a command',
  args: true,
  execute (message: Message, args: string[]) {
    const commandName = args[0].toLowerCase()
    const command = (message.client as BaconClient).commands.get(commandName) ||
            (message.client as BaconClient).commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (!command) {
      return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`)
    }

    const commandFolders = fs.readdirSync(path.resolve(__dirname, '..'))
    const folderName = commandFolders.find((folder: any) => fs.readdirSync(path.resolve(__dirname, `../${folder}`)).includes(`${command.name}.js`))

    delete require.cache[require.resolve(`../${folderName}/${command.name}.js`)]

    try {
      var newCommand: any
      newCommand = require(`../${folderName}/${command.name}.js`);
      (message.client as BaconClient).commands.set(newCommand.name, newCommand)
      message.channel.send(`Command \`${newCommand.name}\` was reloaded!`)
    } catch (error) {
      console.error(error)
      message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``)
    }
  }
}

export default Reload
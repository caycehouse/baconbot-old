import { Client, Collection, CommandInteraction } from 'discord.js'
import path from 'path'
import fs from 'fs'

interface BaconClient extends Client {
  commands: Collection<String, any>
}

const Reload = {
  name: 'reload',
  description: 'Reloads a command',
  options: [{
    name: 'command',
    type: 'STRING',
    description: 'The command to reload',
    required: true,
  }],
  execute (interaction: CommandInteraction) {
    const commandName = String(interaction.options[0].value)
    const command = (interaction.client as BaconClient).commands.get(commandName) ||
            (interaction.client as BaconClient).commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (!command) {
      return interaction.reply(`There is no command with name or alias \`${commandName}\`.`, { ephemeral: true })
    }

    const commandFolders = fs.readdirSync(path.resolve(__dirname, '..'))
    const folderName = commandFolders.find((folder: any) => fs.readdirSync(path.resolve(__dirname, `../${folder}`)).includes(`${command.name}.js`))

    delete require.cache[require.resolve(`../${folderName}/${command.name}.js`)]

    try {
      const newCommand = require(`../${folderName}/${command.name}.js`).default;

      (interaction.client as BaconClient).commands.set(newCommand.name, newCommand)
      return interaction.reply(`Command \`${newCommand.name}\` was reloaded!`, { ephemeral: true })
    } catch (error) {
      console.error(error)
      return interaction.reply(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``, { ephemeral: true })
    }
  }
}

export default Reload
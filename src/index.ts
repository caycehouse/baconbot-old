import Discord, { Collection, Intents } from 'discord.js'
import config from './config'
import * as commands from './commands'

interface BaconClient extends Discord.Client {
  commands?: Discord.Collection<String, any>
}

const client: BaconClient = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] })

async function loadCommands (): Promise<void> {
  if (client.commands == null) client.commands = new Collection()

  try {
    const keys = Object.keys(commands)
    for (const key of keys) {
      client.commands?.set((commands as { [key: string]: any })[key].name, (commands as { [key: string]: any })[key])
    }

    console.info(`${client.commands?.array().length} commands loaded`)
  } catch (error) {
    console.error(`index#loadCommands >> ${(error.stack as string)}`)
  }

  const remote = client.guilds.cache.get('727984268793479301')

  await remote?.commands.set(client.commands.array())

  console.info(
    `${client.commands?.array().length} interactions loaded`
  )
}

client.on('interaction', interaction => {
  if (!interaction.isCommand()) return

  interaction.defer(false).catch((error) => {
    console.error(`An error occured while deferring interaction. >> ${(error.stack as string)}`)
  })

  const command = (interaction.client as BaconClient).commands?.get(interaction.commandName) ||
    (interaction.client as BaconClient).commands?.find(cmd => cmd.aliases.includes(interaction.commandName))

  try {
    command.execute(interaction)
  } catch (error) {
    console.error(error)
    interaction.editReply('there was an error trying to execute that command!').catch((error) => {
      console.error(`An error occured while editing reply to interaction. >> ${(error.stack as string)}`)
    })
  }
})

client.once('ready', () => {
  loadCommands().catch((error) => {
    console.error(`An error occured while loading commands. >> ${(error.stack as string)}`)
  })

  console.log('Ready!')
})

client.login(config.token).catch((error) => {
  console.error(`An error occured while logging in. >> ${(error.stack as string)}`)
})

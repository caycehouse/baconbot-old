import { Collection, Intents } from 'discord.js'
import config from './config'
import * as commands from './commands'
import { Bot } from './bot'
import axios from 'axios'
import { Credentials, Lambda } from 'aws-sdk'

const client = new Bot({
  intents: [Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES]
})

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

  // @ts-expect-error
  const remote = client.guilds.cache.get(config.guild)

  await remote?.commands.set(client.commands.array())

  console.info(
    `${client.commands?.array().length} interactions loaded`
  )
}

client.on('interaction', interaction => {
  if (!interaction.isCommand()) return

  interaction.defer().catch((error) => {
    console.error(`An error occured while deferring interaction. >> ${(error.stack as string)}`)
  })

  const command = client.commands?.get(interaction.commandName) ||
    client.commands?.find(cmd => cmd.aliases.includes(interaction.commandName))

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

const timeInMinutes = 30
setInterval(() => {
  axios.get(`https://mcapi.us/server/status?ip=${config.minecraftIP}`).then(function (response) {
    if (response.data.players.now === 0) {
      const credentials = new Credentials(config.awsAccessKeyId, config.awsSecretAccessKey)

      const lambda = new Lambda({ region: config.awsRegion, credentials })

      var params = {
        FunctionName: config.awsMCFunctionName,
        Payload: '{ "status": "Stopped" }'
      }
      lambda.invoke(params, function (err, data) {
        if (err) {
          console.log(err, err.stack)
        } else {
          console.log(data)
        }
      })
    }
  }).catch(function (error) {
    console.log(error)
  })
}, timeInMinutes * 60 * 1000)

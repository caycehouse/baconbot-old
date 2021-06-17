import { Collection, Intents } from 'discord.js'
import config from './config'
import * as commands from './commands'
import { Bot } from './bot'
import axios from 'axios'
import { Credentials, Lambda } from 'aws-sdk'
import { Server } from '@fabricio-191/valve-server-query'

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

var previousCountMc = 1;
setInterval(() => {
  axios.get(`https://api.mcsrvstat.us/2/${config.minecraftIP}`).then(function (response) {
    if (response.data.online === true && response.data.players.online === 0 && previousCountMc === 0) {
      const credentials = new Credentials(config.awsAccessKeyId, config.awsSecretAccessKey)

      const lambda = new Lambda({ region: config.awsRegion, credentials })

      var params = {
        FunctionName: config.awsMCFunctionName,
        Payload: '{ "status": "Stop" }'
      }
      lambda.invoke(params, function (err, data) {
        if (err) {
          console.log(err, err.stack)
        } else {
          console.log(data)
        }
      })
    } else if(response.data.online === false) {
      previousCountMc = 1;
    } else {
      previousCountMc = response.data.players.online;
    }
  }).catch(function (error) {
    console.log(error)
  })
}, 900000);

var previousCountVh = 0;
setInterval(async () => {
  Server.getInfo({
    ip: config.valheimIP,
    port: 2457,
  })
    .then((server: { players: { online: any } }) => {
      if (server.players.online === 0 && previousCountVh === 0) {
        const credentials = new Credentials(config.awsAccessKeyId, config.awsSecretAccessKey)

        const lambda = new Lambda({ region: config.awsRegion, credentials })

        var params = {
          FunctionName: config.awsValheimFunctionName,
          Payload: '{ "status": "Stop" }'
        }
        lambda.invoke(params, function (err, data) {
          if (err) {
            console.log(err, err.stack)
          } else {
            console.log(data)
          }
        })
      } else {
        previousCountVh = server.players.online;
      }
    })
    .catch(() => {
      previousCountVh = 1
    });  
}, 900000);
import Discord from 'discord.js'
import { Player, Track } from 'discord-player'
import path from 'path'
import config from './config'
import fs from 'fs'

interface BaconClient extends Discord.Client {
  player?: Player
  commands?: Discord.Collection<String, any>
  cooldowns?: Discord.Collection<String, any>
}

const client: BaconClient = new Discord.Client()
client.commands = new Discord.Collection()
client.cooldowns = new Discord.Collection()

const player = new Player(client, {
  ytdlDownloadOptions: {
    filter: 'audioonly',
    quality: 'highestaudio',
    requestOptions: {
      headers: {
        cookie: config.youtubeCookie
      }
    }
  }
})

// To easily access the player
client.player = player

// add the trackStart event so when a song will be played this message will be sent
client.player.on('trackStart', (message: Discord.Message, track: Track) => {
  message.channel.send(`Now playing ${track.title}...`).catch(() => {
    console.log('An error occured while sending now playing track message.')
  })
})

const commandFolders = fs.readdirSync(path.resolve(__dirname, './commands'))

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.resolve(__dirname, `./commands/${folder}`)).filter((file: string) => file.endsWith('.js'))
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`)
    client.commands.set(command.name, command)
  }
}

client.once('ready', () => {
  console.log('Ready!')
})

client.on('message', message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return

  const args = message.content.slice(config.prefix.length).trim().split(/ +/)
  const commandName = args.shift()!.toLowerCase()

  const command = (message.client as BaconClient).commands?.get(commandName) ||
    (message.client as BaconClient).commands?.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

  if (!command) return

  if (command.guildOnly && message.channel.type === 'dm') {
    return message.reply('I can\'t execute that command inside DMs!')
  }

  if (command.permissions) {
    const authorPerms = (message.channel as any).permissionsFor(message.author)
    if (!authorPerms || !authorPerms.has(command.permissions)) {
      return message.reply('You can not do this!')
    }
  }

  if (command.args && (args.length === 0)) {
    let reply = `You didn't provide any arguments, ${message.author}!`

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``
    }

    return message.channel.send(reply)
  }

  const { cooldowns } = client

  if (!cooldowns?.has(command.name)) {
    cooldowns?.set(command.name, new Discord.Collection())
  }

  const now = Date.now()
  const timestamps = cooldowns?.get(command.name)
  const cooldownAmount = (command.cooldown || 3) * 1000

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000
      return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
    }
  }

  timestamps.set(message.author.id, now)
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

  try {
    command.execute(message, args)
  } catch (error) {
    console.error(error)
    message.reply('there was an error trying to execute that command!')
  }
})

client.login(config.token)

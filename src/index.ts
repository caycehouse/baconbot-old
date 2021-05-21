import { Client, CommandoClient } from 'discord.js-commando'
import { Message } from 'discord.js'
import path from 'path'
import { Player, Track } from 'discord-player'
import config from './config'

interface BaconClient extends CommandoClient {
  player?: Player
}

const client: BaconClient = new Client({
  commandPrefix: config.prefix,
  owner: config.owner,
  invite: config.supportServerInvite
})

const player = new Player(client, {
  ytdlDownloadOptions: {
    filter: 'audioonly'
  }
})

// To easily access the player
client.player = player

// add the trackStart event so when a song will be played this message will be sent
client.player.on('trackStart', (message: Message, track: Track) => {
  message.channel.send(`Now playing ${track.title}...`).catch(() => {
    console.log('An error occured while sending now playing track message.')
  })
})

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['music', 'Music Commands']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, 'commands'))

client.once('ready', () => {
  if (client.user != null) {
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`)
    client.user.setActivity('with The Fryer').catch(() => {
      console.log('An error occured while setting activity')
    })
  }
})

client.on('error', console.error)

client.login(config.token).catch(() => {
  console.log('An error occured while logging in.')
})

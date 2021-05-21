import { Client } from 'discord.js-commando'
const { Player } = require("discord-player");
import path from 'path'
var { owner, prefix, supportServerInvite, token } = require(__dirname + '/../config.json');

interface CommandoClient {
  [player: string]: any
}

const client: CommandoClient = new Client({
  commandPrefix: prefix,
  owner: owner,
  invite: supportServerInvite
})

// Create a new Player (you don't need any API Key)
const player = new Player(client, {
  ytdlDownloadOptions: {
    filter: "audioonly"
}
});

// To easily access the player
client.player = player;

// add the trackStart event so when a song will be played this message will be sent
client.player.on("trackStart", (message: { channel: { send: (arg0: string) => any; }; }, track: { title: any; }) => message.channel.send(`Now playing ${track.title}...`))

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

client.login(token).catch(() => {
  console.log('An error occured while logging in.')
})

import Discord, { Collection, Intents } from 'discord.js'
import { Player, Track } from 'discord-player'
import { resolve } from 'path'
import config from './config'
import { readdirSync } from 'fs'
import Play from './commands/music/play'

interface BaconClient extends Discord.Client {
  player?: Player
  commands?: Discord.Collection<String, any>
}

const client: BaconClient = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

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

async function loadCommands() {
  if (!client.commands) client.commands = new Collection();

  try {
    const commandFolders = readdirSync(resolve(__dirname, './commands'))

    for (const folder of commandFolders) {
      const commandFiles = readdirSync(resolve(__dirname, './commands/', folder)).filter((file: string) => file.endsWith('.js'))
      for (const file of commandFiles) {
        const command = require(resolve(__dirname, './commands', folder, file)).default;

        client.commands?.set(command.name, command);
      }
    }

    console.info(`${client.commands?.array().length} commands loaded`);
  } catch (error) {
    console.error(`bot#loadCommands >> ${error.stack}`);
  }

  const remote = client.guilds.cache.get('727984268793479301')

  await remote?.commands.set(client.commands!.array());

  console.info(
    `${client.commands?.array().length} interactions loaded`
  );
}

client.on('interaction', async interaction => {
	if (!interaction.isCommand()) return;
	if (interaction.commandName === 'play') {
    Play.execute(interaction)
  }
});

client.once('ready', async () => {
  await loadCommands()

  console.log('Ready!')
})

client.login(config.token)

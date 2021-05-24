import Discord, { Collection, Intents } from 'discord.js'
import config from './config'
import * as commands from './commands'

interface BaconClient extends Discord.Client {
  commands?: Discord.Collection<String, any>
}

const client: BaconClient = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] })

async function loadCommands() {
  if (!client.commands) client.commands = new Collection();

  try {
    const keys = Object.keys(commands)
    for (const key of keys) {
      client.commands?.set((commands as { [key: string]: any })[key].name, (commands as { [key: string]: any })[key]);
    }

    console.info(`${client.commands?.array().length} commands loaded`);
  } catch (error) {
    console.error(`index#loadCommands >> ${error.stack}`);
  }

  const remote = client.guilds.cache.get('727984268793479301')

  await remote?.commands.set(client.commands!.array());

  console.info(
    `${client.commands?.array().length} interactions loaded`
  );
}

client.on('interaction', async interaction => {
  if (!interaction.isCommand()) return;

  const command = (interaction.client as BaconClient).commands?.get(interaction.commandName) ||
    (interaction.client as BaconClient).commands?.find(cmd => cmd.aliases && cmd.aliases.includes(interaction.commandName))

  try {
    command.execute(interaction)
  } catch (error) {
    console.error(error)
    interaction.reply('there was an error trying to execute that command!', { ephemeral: true })
  }
});

client.once('ready', async () => {
  await loadCommands()

  console.log('Ready!')
})

client.login(config.token)

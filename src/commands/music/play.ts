import { ClientUser, CommandInteraction, MessageEmbed } from 'discord.js'
import ytdl from 'ytdl-core-discord'

export const Play = {
  name: 'play',
  description: 'Plays the specified song',
  options: [{
    name: 'song',
    type: 'STRING',
    description: 'The song or URL to play from',
    required: true,
  }],
  async execute(interaction: CommandInteraction) {
    const song = String(interaction.options[0].value)

    const voice = interaction.member?.voice.channel
    if (voice === null) {
      return interaction.reply('Please enter a voice channel first!')
    }

    const perms = voice?.permissionsFor((interaction.client.user as ClientUser))
    if (perms?.has('CONNECT') === false || perms?.has('SPEAK') === false) {
      return interaction.reply('Unable to join the voice channel.')
    }

    try {
      const connection = await voice.join()

      await connection.play(await ytdl(song, { filter: 'audioonly' }), { type: 'opus' })
  
      return interaction.reply(`Now Playing ${song}`)
    } catch (error) {
      console.error(`Play#execute >> ${error.stack}`);
      return interaction.reply('An unexpected error has occured.')
    }
  }
}

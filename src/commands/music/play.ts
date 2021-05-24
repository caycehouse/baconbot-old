import { ClientUser, CommandInteraction, VoiceConnection } from 'discord.js'
import ytdl from 'ytdl-core-discord'
import ytsr, { Video } from 'ytsr'
import config from '../../config'

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
      return interaction.reply('Please enter a voice channel first!', { ephemeral: true })
    }

    const perms = voice?.permissionsFor((interaction.client.user as ClientUser))
    if (perms?.has('CONNECT') === false || perms?.has('SPEAK') === false) {
      return interaction.reply('Unable to join the voice channel.', { ephemeral: true })
    }

    var songURL: string
    if (ytdl.validateURL(song)) {
      songURL = song
    } else {
      const filters1 = await ytsr.getFilters(song);
      const filter1 = filters1.get('Type')?.get('Video');
      if (filter1 && filter1.url) {
        const searchResults = await ytsr(filter1.url);
        songURL = (searchResults.items[0] as Video).url
      } else {
        return interaction.reply('No results found.', { ephemeral: true })
      }
    }

    try {
      voice.join().then(async (connection: VoiceConnection) => {

        let stream = await ytdl(songURL, { filter: 'audioonly', quality: 'highestaudio' })

        let dispatcher = connection.play(stream, { type: 'opus' })

        dispatcher.on('end', () => voice.leave());
      }).catch((error: { stack: string }) => {
        console.error(`Play#execute >> ${error.stack}`)
        return interaction.reply('An unexpected error has occured.', { ephemeral: true })
      })

      return interaction.reply(`Now Playing ${songURL}`)
    } catch (error) {
      console.error(`Play#execute >> ${error.stack}`);
      return interaction.reply('An unexpected error has occured.', { ephemeral: true })
    }

  }
}

import { ClientUser, VoiceConnection } from 'discord.js'
import ytdl from 'ytdl-core-discord'
import ytsr, { Video } from 'ytsr'
import { Bot } from '../../bot'
import { BaconCommandInteraction } from '../../index.d'

async function playSong(connection: VoiceConnection, client: Bot, songURL: string) {
  const dispatcher = connection.play(await ytdl(songURL, { filter: 'audioonly', quality: 'highestaudio' }), { type: 'opus' })

  client.dispatcher = dispatcher

  dispatcher.on('finish', () => {
    const nextTrack = client.getQueue()
    if(nextTrack) {
      playSong(connection, client, nextTrack)
    } else {
      connection.channel.leave()
      client.dispatcher = null
    }
  })
}

export const Play = {
  name: 'play',
  description: 'Plays the specified song',
  options: [{
    name: 'song',
    type: 'STRING',
    description: 'The song or URL to play from',
    required: true
  }],
  async execute (interaction: BaconCommandInteraction) {
    const song = String(interaction.options[0].value)

    const voice = interaction.member?.voice.channel
    if (voice === null) {
      return await interaction.editReply('Please enter a voice channel first!')
    }

    const perms = voice?.permissionsFor((interaction.client.user as ClientUser))
    if (perms?.has('CONNECT') === false || perms?.has('SPEAK') === false) {
      return await interaction.editReply('Unable to join the voice channel.')
    }

    var songURL: string
    if (ytdl.validateURL(song)) {
      songURL = song
    } else {
      const filters1 = await ytsr.getFilters(song)
      const filter1 = filters1.get('Type')?.get('Video')
      try {
        const searchResults = await ytsr((filter1?.url as string))
        songURL = (searchResults.items[0] as Video).url
      } catch (error) {
        console.error(`Play#execute#1 >> ${(error.stack as string)}`)
        return await interaction.editReply('No results found.')
      }
    }

    try {
      voice.join().then(async (connection: VoiceConnection) => {
        const length = interaction.client.addQueue(songURL)
        if(!interaction.client.dispatcher) {
          const nextTrack = interaction.client.getQueue()
          if (nextTrack) {
            playSong(connection, interaction.client, nextTrack)
            return await interaction.editReply(`Now Playing ${songURL}`)
          }
        }
        return await interaction.editReply(`Queued ${songURL}`)
      }).catch(async (error: { stack: string }) => {
        console.error(`Play#execute#2 >> ${error.stack}`)
        return await interaction.editReply('An unexpected error has occured.')
      })
    } catch (error) {
      console.error(`Play#execute#3 >> ${(error.stack as string)}`)
      return await interaction.editReply('An unexpected error has occured.')
    }
  }
}

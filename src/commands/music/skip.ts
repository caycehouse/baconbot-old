import { Client, Message, MessageEmbed } from 'discord.js'
import { Player } from 'discord-player'

interface BaconClient extends Client {
  player: Player
}

const Skip = {
  name: 'skip',
  description: 'Skips the current song',
  async execute (message: Message) {
    const queue = (message.client as BaconClient).player.getQueue(message)

    const voice = message.member?.voice.channel
    if (voice === null) {
      return await message.channel.send('music/play:NO_VOICE_CHANNEL')
    }

    if (queue === null) {
      return await message.channel.send('music/play:NOT_PLAYING')
    }

    if (queue.tracks[0] === null) {
      return await message.channel.send('music/skip:NO_NEXT_SONG')
    }

    const members = voice?.members.filter((m) => !m.user.bot)

    const embed = new MessageEmbed()
      .setAuthor('music/skip:DESCRIPTION')
      .setThumbnail(queue.tracks[0].thumbnail)

    const m = await message.channel.send(embed)

    if ((members != null) && members.size > 1) {
      await m.react('👍')

      const mustVote = Math.floor(members.size / 2 + 1)

      embed.setDescription('music/skip:VOTE_CONTENT')
      await m.edit(embed)

      const filter = (reaction: any, user: any): boolean => {
        const member = message.guild?.members.cache.get(user.id)
        const voiceChannel = member?.voice.channel
        if (voiceChannel != null) {
          return voiceChannel.id === voice?.id
        }
        return false
      }

      const collector = await m.createReactionCollector(filter, {
        time: 25000
      })

      collector.on('collect', (reaction) => {
        const haveVoted = reaction?.count ?? 0 - 1
        if (haveVoted >= mustVote) {
          (message.client as BaconClient).player.skip(message)
          embed.setDescription('music/skip:SUCCESS')
          m.edit(embed).catch(error => {
            console.log('rejected', error)
          })
          collector.stop()
        } else {
          embed.setDescription('music/skip:VOTE_CONTENT')
          m.edit(embed).catch(error => {
            console.log('rejected', error)
          })
        }
      })

      collector.on('end', () => {
        message.channel.send('misc:TIMES_UP').catch(error => {
          console.log('rejected', error)
        })
      })
    } else {
      (message.client as BaconClient).player.skip(message)
      embed.setDescription('music/skip:SUCCESS')
      m.edit(embed).catch(error => {
        console.log('rejected', error)
      })
    }

    return null
  }
}

export default Skip
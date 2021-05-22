import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando'
import Discord from 'discord.js'
import { Player } from 'discord-player'

interface BaconClient extends CommandoClient {
  player: Player
}

export default class SkipCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'skip',
      group: 'music',
      memberName: 'skip',
      description: 'Skips the current song.'
    })
  }

  async run (message: CommandoMessage): Promise<null | CommandoMessage | CommandoMessage[]> {
    const queue = (this.client as BaconClient).player.getQueue(message)

    const voice = message.member?.voice.channel
    if (voice === null) {
      return await message.say('music/play:NO_VOICE_CHANNEL')
    }

    if (queue === null) {
      return await message.say('music/play:NOT_PLAYING')
    }

    if (queue.tracks[0] === null) {
      return await message.say('music/skip:NO_NEXT_SONG')
    }

    const members = voice?.members.filter((m) => !m.user.bot)

    const embed = new Discord.MessageEmbed()
      .setAuthor('music/skip:DESCRIPTION')
      .setThumbnail(queue.tracks[0].thumbnail)

    const m = await message.channel.send(embed)

    if ((members != null) && members.size > 1) {
      await m.react('👍')

      const mustVote = Math.floor(members.size / 2 + 1)

      embed.setDescription('music/skip:VOTE_CONTENT')
      await m.edit(embed)

      const filter = (reaction: any, user: any): boolean => {
        const member = message.guild.members.cache.get(user.id)
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
          (this.client as BaconClient).player.skip(message)
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
        message.say('misc:TIMES_UP').catch(error => {
          console.log('rejected', error)
        })
      })
    } else {
      (this.client as BaconClient).player.skip(message)
      embed.setDescription('music/skip:SUCCESS')
      m.edit(embed).catch(error => {
        console.log('rejected', error)
      })
    }

    return null
  }
}

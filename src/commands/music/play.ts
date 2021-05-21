import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando'
import Discord from 'discord.js'

interface BaconClient extends CommandoClient {
  [player: string]: any
}

export default class PlayCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'play',
      group: 'music',
      memberName: 'play',
      description: 'Plays the specified song either by search or URL.',
      args: [
        {
          key: 'song',
          prompt: 'What song would you like the bot to play?',
          type: 'string'
        }
      ]
    })
  }

  async run (message: CommandoMessage, { song }: { song: string }): Promise<null | CommandoMessage | CommandoMessage[]> {
    if (song === null) {
      const embed = new Discord.MessageEmbed()
        .setAuthor('Missing Song Name')

      return await message.say(embed)
    }

    const voice = message.member?.voice.channel
    if (voice === null) {
      const embed = new Discord.MessageEmbed()
        .setAuthor('No Voice Channel')

      return await message.say(embed)
    }

    if (this.client.user === null) {
      const embed = new Discord.MessageEmbed()
        .setAuthor('No Client User')

      return await message.say(embed)
    }

    // Check my permissions
    const perms = voice?.permissionsFor(this.client.user)
    if (perms?.has('CONNECT') === false || perms?.has('SPEAK') === false) {
      const embed = new Discord.MessageEmbed()
        .setAuthor('Unable to join a voice channel')

      return await message.say(embed)
    }

    return (this.client as BaconClient).player.play(message, song)
  }
}

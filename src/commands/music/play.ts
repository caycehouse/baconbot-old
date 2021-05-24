import { Client, ClientUser, Message, MessageEmbed } from 'discord.js'
import { Player } from 'discord-player'

interface BaconClient extends Client {
  player: Player
}

module.exports = {
  name: 'play',
  description: 'Plays the specified song',
  args: true,
  async execute (message: Message, args: string[]) {
    const song = args.join(' ')
    if (song === null) {
      const embed = new MessageEmbed()
        .setAuthor('Missing Song Name')

      return await message.channel.send(embed)
    }

    const voice = message.member?.voice.channel
    if (voice === null) {
      const embed = new MessageEmbed()
        .setAuthor('No Voice Channel')

      return await message.channel.send(embed)
    }

    // Check my permissions
    const perms = voice?.permissionsFor((message.client.user as ClientUser))
    if (perms?.has('CONNECT') === false || perms?.has('SPEAK') === false) {
      const embed = new MessageEmbed()
        .setAuthor('Unable to join a voice channel')

      return await message.channel.send(embed)
    }

    await (message.client as BaconClient).player.play(message, song, true).catch(async () => {
      const embed = new MessageEmbed()
        .setAuthor('An error occured while trying to play this song.')

      return await message.channel.send(embed)
    })

    return null
  }
}

import { Client, ClientUser, Message, MessageEmbed } from 'discord.js'
import { Player } from 'discord-player'

interface BaconClient extends Client {
  player: Player
}

const Play = {
  name: 'play',
  description: 'Plays the specified song',
  options: [{
    name: 'song',
    type: 'STRING',
    description: 'The song or URL to play from',
    required: true,
  }],
  async execute (interaction: any) {
    console.log(interaction.options)
    const song = interaction.options['value']
    if (song === null) {
      const embed = new MessageEmbed()
        .setAuthor('Missing Song Name')

      return await interaction.channel.send(embed)
    }

    const voice = interaction.member?.voice.channel
    if (voice === null) {
      const embed = new MessageEmbed()
        .setAuthor('No Voice Channel')

      return await interaction.channel.send(embed)
    }

    // Check my permissions
    const perms = voice?.permissionsFor((interaction.client.user as ClientUser))
    if (perms?.has('CONNECT') === false || perms?.has('SPEAK') === false) {
      const embed = new MessageEmbed()
        .setAuthor('Unable to join a voice channel')

      return await interaction.channel.send(embed)
    }

    await (interaction.client as BaconClient).player.play(interaction, song, true).catch(async (e) => {
      const embed = new MessageEmbed()
        .setAuthor('An error occured while trying to play this song.')

        console.log(e)

      return await interaction.channel.send(embed)
    })

    return null
  }
}

export default Play
import { BaconCommandInteraction } from '../../index.d'

export const Skip = {
  name: 'skip',
  description: 'Skips the current song',
  async execute(interaction: BaconCommandInteraction) {
    if (interaction.client.dispatcher) {
      interaction.client.dispatcher.end()
      return await interaction.editReply('Skipping the current track')
    } else {
      return await interaction.editReply('Nothing to skip!')
    }
  }
}

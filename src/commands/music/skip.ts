import { BaconCommandInteraction } from '../../index.d'

export const Skip = {
  name: 'skip',
  description: 'Skips the current song',
  async execute (interaction: BaconCommandInteraction) {
    interaction.client.dispatcher?.end()
    return await interaction.editReply('Skipping the current track')
  }
}

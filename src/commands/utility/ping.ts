import { CommandInteraction } from "discord.js"

export const Ping = {
  name: 'ping',
  description: 'Returns the Websocket heartbeat',
  async execute(interaction: CommandInteraction) {
      interaction.editReply(`Websocket heartbeat: ${interaction.client.ws.ping}ms.`)
  }
}

const { Command } = require('discord.js-commando')

module.exports = class PlayCommand extends Command {
  constructor(client: any) {
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

  async run(message: { error: (arg0: string) => any; member: { voice: { channel: any; }; }; }, { song }: any) {
    if (!song) {
      return message.error("music/play:MISSING_SONG_NAME");
    }

    const voice = message.member.voice.channel;
    if (!voice) {
      return message.error("music/play:NO_VOICE_CHANNEL");
    }

    // Check my permissions
    const perms = voice.permissionsFor(this.client.user);
    if (!perms.has("CONNECT") || !perms.has("SPEAK")) {
      return message.error("music/play:VOICE_CHANNEL_CONNECT");
    }

    await this.client.player.play(message, song);
  }
}

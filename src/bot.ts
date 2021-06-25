import { Client, ClientOptions, Collection } from 'discord.js'

export class Bot extends Client {
  commands: Collection<String, any> | null

  constructor (options: ClientOptions) {
    super(options)
    this.commands = null
  }
}

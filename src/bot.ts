import { Client, ClientOptions, Collection, StreamDispatcher } from 'discord.js'

export class Bot extends Client {
  commands: Collection<String, any> | null
  dispatcher: StreamDispatcher | null
  queue: string[]

  constructor (options: ClientOptions) {
    super(options)
    this.commands = null
    this.dispatcher = null
    this.queue = []
  }

  addQueue (url: string): number | undefined {
    return this.queue?.push(url)
  }

  getQueue (): string | undefined {
    return this.queue?.shift()
  }
}

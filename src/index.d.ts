import { Bot } from './bot'
import { CommandInteraction } from 'discord.js'

interface BaconCommandInteraction extends CommandInteraction {
    client: Bot
}
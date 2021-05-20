import { Client } from 'discord.js'
import { token } from '../config.json'

const client = new Client()

client.once('ready', () => {
  console.log('Ready!')
})

client.login(token).catch(() => {
  console.log('An error occured while logging in.')
})

const { SlashCommandBuilder } = require('@discordjs/builders')
const { Credentials, Lambda } = require('aws-sdk')
const { awsAccessKeyId, awsSecretAccessKey, awsRegion, awsMCFunctionName, awsVhFunctionName } = require('../config.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('games')
    .setDescription('Manage the gaming servers.')
    .addStringOption(option =>
      option.setName('service')
        .setDescription('The service to start')
        .setRequired(true)
        .addChoice('Minecraft 1.17', 'minecraft')
        .addChoice('Valheim', 'valheim')),
  async execute (interaction) {
    await interaction.deferReply();

    const service = interaction.options.getString('service')

    let functionName
    if (service === 'minecraft') {
      functionName = awsMCFunctionName
    } else if (service === 'valheim') {
      functionName = awsVhFunctionName
    }

    if (functionName) {
      const credentials = new Credentials(awsAccessKeyId, awsSecretAccessKey)

      const lambda = new Lambda({ region: awsRegion, credentials })

      const params = {
        FunctionName: functionName
      }
      lambda.invoke(params, async function (err, data) {
        if (err) {
          console.log(err, err.stack)
          await interaction.editReply('An error has occured.')
        } else {
          console.log(data)
          await interaction.editReply(`${service} is now Running.`)
        }
      })
    }
  }
}

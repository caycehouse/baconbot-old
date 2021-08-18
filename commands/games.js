const { SlashCommandBuilder } = require('@discordjs/builders')
const { Credentials, Lambda } = require('aws-sdk')

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
      functionName = process.env.AWS_MC_FUNCTION_NAME
    } else if (service === 'valheim') {
      functionName = process.env.AWS_VH_FUNCTION_NAME
    }

    if (functionName) {
      const credentials = new Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY)

      const lambda = new Lambda({ region: process.env.AWS_REGION, credentials })

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

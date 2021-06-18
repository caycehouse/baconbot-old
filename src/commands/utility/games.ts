import { Credentials, Lambda } from 'aws-sdk'
import { CommandInteraction } from 'discord.js'
import config from '../../config'

export const Games = {
  name: 'games',
  description: 'Manage the gaming servers',
  options: [{
    name: 'service',
    type: 'STRING',
    description: 'The service to start',
    required: true,
    choices: [
      {
        name: 'Minecraft 1.17',
        value: 'Minecraft'
      },
      {
        name: 'Valheim',
        value: 'Valheim'
      }
    ]
  }],
  async execute(interaction: CommandInteraction) {
    const service = String(interaction.options.get('service')?.value)

    var functionName;
    if (service == 'Minecraft') {
      functionName = config.awsMCFunctionName;
    } else if (service == 'Valheim') {
      functionName = config.awsValheimFunctionName;
    }

    if (functionName) {
      const credentials = new Credentials(config.awsAccessKeyId, config.awsSecretAccessKey)

      const lambda = new Lambda({ region: config.awsRegion, credentials })

      var params = {
        FunctionName: functionName
      }
      lambda.invoke(params, function (err, data) {
        if (err) {
          console.log(err, err.stack)
          return interaction.editReply('An error has occured.')
        } else {
          console.log(data)
          return interaction.editReply(`${service} is now Running.`)
        }
      })
    }
  }
}

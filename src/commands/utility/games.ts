import { Credentials, Lambda } from 'aws-sdk';
import { CommandInteraction } from "discord.js"
import config from '../../config';

export const Games = {
  name: 'games',
  description: 'Manage the gaming servers',
  options: [{
    name: 'service',
    type: 'STRING',
    description: 'The service to start',
    required: true,
    "choices": [
      {
        "name": "Minecraft 1.17",
        "value": "minecraft"
      }
    ]
  }, {
    name: 'action',
    type: 'STRING',
    description: 'The action to take',
    required: true,
    "choices": [
      {
        "name": "Start",
        "value": "Running"
      },
      {
        "name": "Stop",
        "value": "Stopped"
      }
    ]
  }],
  async execute(interaction: CommandInteraction) {
    
    const service = String(interaction.options.get('service')?.value)
    const action = String(interaction.options.get('action')?.value)

    var functionName;
    if (service == "minecraft") {
      functionName = config.awsMCFunctionName;
    }

    if (functionName) {
      const credentials = new Credentials(config.awsAccessKeyId, config.awsSecretAccessKey);

      const lambda = new Lambda({ region: config.awsRegion, credentials });

      var params = {
        FunctionName: functionName,
        Payload: `{ "status": "${action}" }`
      };
      lambda.invoke(params, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          interaction.editReply('An error has occured.');
        } else {
          console.log(data);
          interaction.editReply(`${service} is now ${action}.`);
        }
      });
    }
  }
}

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
        "value": "Minecraft"
      }
    ]
  }],
  async execute(interaction: CommandInteraction) {
    
    const service = String(interaction.options.get('service')?.value)

    var functionName;
    if (service == "Minecraft") {
      functionName = config.awsMCFunctionName;
    }

    if (functionName) {
      const credentials = new Credentials(config.awsAccessKeyId, config.awsSecretAccessKey);

      const lambda = new Lambda({ region: config.awsRegion, credentials });

      var params = {
        FunctionName: functionName,
        Payload: `{ "status": "Running" }`
      };
      lambda.invoke(params, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          interaction.editReply('An error has occured.');
        } else {
          console.log(data);
          interaction.editReply(`${service} is now Running.`);
        }
      });
    }
  }
}

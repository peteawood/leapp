import {Command} from '@oclif/core'
import {LeappCliService} from '../../service/leapp-cli-service'
import {Config} from '@oclif/core/lib/config/config'
import {AwsSsoIntegration} from '@noovolari/leapp-core/models/aws-sso-integration'

export default class DeleteIntegration extends Command {
  static description = 'Delete an integration'

  static examples = [
    '$leapp integration delete',
  ]

  constructor(argv: string[], config: Config, private leappCliService = new LeappCliService()) {
    super(argv, config)
  }

  async run(): Promise<void> {
    try {
      const selectedIntegration = await this.selectIntegration()
      await this.delete(selectedIntegration)
    } catch (error) {
      this.error(error instanceof Error ? error.message : `Unknown error: ${error}`)
    }
  }

  public async delete(integration: AwsSsoIntegration): Promise<void> {
    await this.leappCliService.awsSsoIntegrationService.deleteIntegration(integration.id)
    this.log(`integration deleted`)
  }

  public async selectIntegration(): Promise<AwsSsoIntegration> {
    const integrations = this.leappCliService.awsSsoIntegrationService.getIntegrations()
    if (integrations.length === 0) {
      throw new Error('no integrations available')
    }

    const answer: any = await this.leappCliService.inquirer.prompt([{
      name: 'selectedIntegration',
      message: 'select an integration to delete',
      type: 'list',
      choices: integrations.map((integration: any) => ({name: integration.alias, value: integration})),
    }])
    return answer.selectedIntegration
  }
}
import {Command, CliUx} from '@oclif/core'
import {LeappCliService} from '../../service/leapp-cli-service'
import {Config} from '@oclif/core/lib/config/config'
import {SessionStatus} from '@noovolari/leapp-core/models/session-status'

export default class ListSessions extends Command {
  static description = 'Show sessions list'
  static examples = [`$leapp session list`]

  static flags = {
    ...CliUx.ux.table.flags(),
  }

  constructor(argv: string[], config: Config, private leappCliService = new LeappCliService()) {
    super(argv, config)
  }

  async run(): Promise<void> {
    try {
      await this.showSessions()
    } catch (error) {
      this.error(error instanceof Error ? error.message : `Unknown error: ${error}`)
    }
  }

  public async showSessions(): Promise<void> {
    const {flags} = await this.parse(ListSessions)
    const sessionTypeLabelMap = this.leappCliService.cloudProviderService.getSessionTypeMap()
    const namedProfilesMap = this.leappCliService.namedProfilesService.getNamedProfilesMap()
    const data = this.leappCliService.repository.getSessions().map(session => {
      return {
        sessionName: session.sessionName,
        type: sessionTypeLabelMap.get(session.type),
        profileId: 'profileId' in session ? namedProfilesMap.get((session as any).profileId)?.name : '-',
        region: session.region,
        status: SessionStatus[session.status],
      }
    }) as any as Record<string, unknown> []

    const columns = {
      sessionName: {header: 'Session Name'},
      type: {header: 'Type'},
      profileId: {header: 'Named Profile'},
      region: {header: 'Region/Location'},
      status: {header: 'Status'},
    }

    CliUx.ux.table(data, columns, {...flags})
  }
}
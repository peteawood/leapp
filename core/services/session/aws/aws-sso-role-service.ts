import SSO from 'aws-sdk/clients/sso'
import {BrowserWindowClosing} from '../../../interfaces/i-browser-window-closing'
import {INativeService} from '../../../interfaces/i-native-service'
import {ISessionNotifier} from '../../../interfaces/i-session-notifier'
import {AwsSsoRoleSession} from '../../../models/aws-sso-role-session'
import {CredentialsInfo} from '../../../models/credentials-info'
import {AwsCoreService} from '../../aws-core-service'
import {FileService} from '../../file-service'
import {KeychainService} from '../../keychain-service'
import {Repository} from '../../repository'

import {AwsSessionService} from './aws-session-service'
import {AwsSsoOidcService} from '../../aws-sso-oidc.service'
import {AwsSsoRoleSessionRequest} from './aws-sso-role-session-request'
import {IAwsIntegrationDelegate} from '../../../interfaces/i-aws-integration-delegate'

export interface GenerateSSOTokenResponse {
  accessToken: string;
  expirationTime: Date;
}

export interface LoginResponse {
  accessToken: string;
  region: string;
  expirationTime: Date;
  portalUrlUnrolled: string;
}

export interface RegisterClientResponse {
  clientId?: string;
  clientSecret?: string;
  clientIdIssuedAt?: number;
  clientSecretExpiresAt?: number;
}

export interface StartDeviceAuthorizationResponse {
  deviceCode?: string;
  expiresIn?: number;
  interval?: number;
  userCode?: string;
  verificationUri?: string;
  verificationUriComplete?: string;
}

export interface VerificationResponse {
  clientId: string;
  clientSecret: string;
  deviceCode: string;
}

export interface SsoRoleSession {
  sessionName: string;
  roleArn: string;
  email: string;
  region: string;
  profileId: string;
  awsSsoConfigurationId: string;
}

export class AwsSsoRoleService extends AwsSessionService implements BrowserWindowClosing {

  public constructor(protected sessionNotifier: ISessionNotifier, protected repository: Repository, private fileService: FileService,
                     private keyChainService: KeychainService, private awsCoreService: AwsCoreService,
                     private nativeService: INativeService, private awsSsoOidcService: AwsSsoOidcService) {
    super(sessionNotifier, repository)
    awsSsoOidcService.appendListener(this)
  }

  private awsIntegrationDelegate: IAwsIntegrationDelegate

  static sessionTokenFromGetSessionTokenResponse(getRoleCredentialResponse: SSO.GetRoleCredentialsResponse): { sessionToken: any } {
    return {
      sessionToken: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        aws_access_key_id: getRoleCredentialResponse.roleCredentials.accessKeyId.trim(),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        aws_secret_access_key: getRoleCredentialResponse.roleCredentials.secretAccessKey.trim(),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        aws_session_token: getRoleCredentialResponse.roleCredentials.sessionToken.trim(),
      },
    }
  }

  public setAwsIntegrationDelegate(delegate: IAwsIntegrationDelegate) {
    this.awsIntegrationDelegate = delegate
  }

  async catchClosingBrowserWindow(): Promise<void> {
    const sessions = this.sessionNotifier.listAwsSsoRoles()
    for (let i = 0; i < sessions.length; i++) {
      // Stop session
      const currentSession = sessions[i]
      await this.stop(currentSession.sessionId).then(_ => {
      })
    }
  }

  async create(request: AwsSsoRoleSessionRequest): Promise<void> {
    const session = new AwsSsoRoleSession(request.sessionName, request.region, request.roleArn, request.profileId,
      request.awsSsoConfigurationId, request.email)

    this.repository.addSession(session)
    this.sessionNotifier?.addSession(session)
  }

  async applyCredentials(sessionId: string, credentialsInfo: CredentialsInfo): Promise<void> {
    const session = this.sessionNotifier.getSessionById(sessionId)
    const profileName = this.repository.getProfileName((session as AwsSsoRoleSession).profileId)
    const credentialObject = {}
    credentialObject[profileName] = {
      aws_access_key_id: credentialsInfo.sessionToken.aws_access_key_id,
      aws_secret_access_key: credentialsInfo.sessionToken.aws_secret_access_key,
      aws_session_token: credentialsInfo.sessionToken.aws_session_token,
      region: session.region,
    }
    return await this.fileService.iniWriteSync(this.awsCoreService.awsCredentialPath(), credentialObject)
  }

  async deApplyCredentials(sessionId: string): Promise<void> {
    const session = this.sessionNotifier.getSessionById(sessionId)
    const profileName = this.repository.getProfileName((session as AwsSsoRoleSession).profileId)
    const credentialsFile = await this.fileService.iniParseSync(this.awsCoreService.awsCredentialPath())
    delete credentialsFile[profileName]
    await this.fileService.replaceWriteSync(this.awsCoreService.awsCredentialPath(), credentialsFile)
  }

  async generateCredentials(sessionId: string): Promise<CredentialsInfo> {
    const session: AwsSsoRoleSession = (this.sessionNotifier.getSessionById(sessionId) as AwsSsoRoleSession)
    const awsSsoConfiguration = this.repository.getAwsSsoIntegration(session.awsSsoConfigurationId)
    const region = awsSsoConfiguration.region
    const portalUrl = awsSsoConfiguration.portalUrl
    const roleArn = session.roleArn

    const accessToken = await this.awsIntegrationDelegate.getAccessToken(session.awsSsoConfigurationId, region, portalUrl)
    const credentials = await this.awsIntegrationDelegate.getRoleCredentials(accessToken, region, roleArn)

    return AwsSsoRoleService.sessionTokenFromGetSessionTokenResponse(credentials)
  }

  sessionDeactivated(sessionId: string) {
    super.sessionDeactivated(sessionId)
  }

  removeSecrets(sessionId: string): void {
  }
}
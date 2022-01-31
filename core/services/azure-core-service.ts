import { AzureLocation } from './azure-location'

export class AzureCoreService{

  public constructor() {
  }

  public isAzure(session): boolean {
    return session.subscriptionId !== null && session.subscriptionId !== undefined
  }

  public getLocations(): AzureLocation[] {
    return [
      new AzureLocation('eastus'),
      new AzureLocation('eastus2'),
      new AzureLocation('southcentralus'),
      new AzureLocation('australiaeast'),
      new AzureLocation('southeastasia'),
      new AzureLocation('northeurope'),
      new AzureLocation('uksouth'),
      new AzureLocation('westeurope'),
      new AzureLocation('centralus'),
      new AzureLocation('northcentralus'),
      new AzureLocation('southafricanorth'),
      new AzureLocation('centralindia'),
      new AzureLocation('eastasia'),
      new AzureLocation('japaneast'),
      new AzureLocation('koreacentral'),
      new AzureLocation('canadacentral'),
      new AzureLocation('francecentral'),
      new AzureLocation('germanywestcentral'),
      new AzureLocation('norwayeast'),
      new AzureLocation('switzerlandnorth'),
      new AzureLocation('uaenorth'),
      new AzureLocation('brazilsouth'),
      new AzureLocation('centralusstage'),
      new AzureLocation('eastusstage'),
      new AzureLocation('eastus2stage'),
      new AzureLocation('northcentralusstage'),
      new AzureLocation('southcentralusstage'),
      new AzureLocation('westusstage'),
      new AzureLocation('westus2stage'),
      new AzureLocation('asia'),
      new AzureLocation('asiapacific'),
      new AzureLocation('australia'),
      new AzureLocation('brazil'),
      new AzureLocation('canada'),
      new AzureLocation('europe'),
      new AzureLocation('global'),
      new AzureLocation('india'),
      new AzureLocation('japan'),
      new AzureLocation('uk'),
      new AzureLocation('unitedstates'),
      new AzureLocation('eastasiastage'),
      new AzureLocation('southeastasiastage'),
      new AzureLocation('centraluseuap'),
      new AzureLocation('eastus2euap'),
      new AzureLocation('westcentralus'),
      new AzureLocation('westus3'),
      new AzureLocation('southafricawest'),
      new AzureLocation('australiacentral'),
      new AzureLocation('australiacentral2'),
      new AzureLocation('australiasoutheast'),
      new AzureLocation('japanwest'),
      new AzureLocation('koreasouth'),
      new AzureLocation('southindia'),
      new AzureLocation('westindia'),
      new AzureLocation('canadaeast'),
      new AzureLocation('francesouth'),
      new AzureLocation('germanynorth'),
      new AzureLocation('norwaywest'),
      new AzureLocation('switzerlandwest'),
      new AzureLocation('ukwest'),
      new AzureLocation('uaecentral'),
      new AzureLocation('brazilsoutheast')
    ]
  }
}

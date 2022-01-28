import { Injectable } from '@angular/core'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { environment } from '../../environments/environment'
import { UpdateDialogComponent } from '../components/shared/update-dialog/update-dialog.component'
import compareVersions from 'compare-versions'
import { HttpClient } from '@angular/common/http'
import md from 'markdown-it'
import { ElectronService } from './electron.service'
import { constants } from '@noovolari/leapp-core/models/constants'
import { Repository } from '@noovolari/leapp-core/services/repository'
import { WorkspaceService } from '@noovolari/leapp-core/services/workspace.service'
import { LeappCoreService } from './leapp-core.service'
import { WindowService } from './window.service'

@Injectable({
  providedIn: 'root'
})
export class UpdaterService {
  version: string
  releaseName: string
  releaseDate: string
  releaseNotes: string
  bsModalRef: BsModalRef
  markdown: any
  private repository: Repository
  private workspaceService: WorkspaceService

  constructor(private bsModalService: BsModalService, private httpClient: HttpClient,
              private electronService: ElectronService, private windowService: WindowService,
              leappCoreService: LeappCoreService) {
    this.markdown = md()
    this.repository = leappCoreService.repository
    this.workspaceService = leappCoreService.workspaceService
  }

  isUpdateNeeded(): boolean {
    const currentSavedVersion = this.getSavedAppVersion()
    const updateVersion = this.version
    return compareVersions(updateVersion, currentSavedVersion) > 0
  }

  getCurrentAppVersion(): string {
    return this.electronService.app.getVersion()
  }

  getSavedAppVersion(): string {
    return this.electronService.fs.readFileSync(this.electronService.os.homedir() + `/.Leapp/.latest.json`).toString()
  }

  getSavedVersionComparison(): boolean {
    return compareVersions(this.getSavedAppVersion(), this.getCurrentAppVersion()) > 0
  }

  setUpdateInfo(version: string, releaseName: string, releaseDate: string, releaseNotes: string): void {
    this.version = version
    this.releaseName = releaseName
    this.releaseDate = releaseDate
    this.releaseNotes = releaseNotes

    this.workspaceService.sessions = [...this.workspaceService.sessions]
    this.repository.updateSessions(this.workspaceService.sessions)
  }

  updateDialog(): void {
    if (!this.bsModalRef) {
      for (let i = 1; i <= this.bsModalService.getModalsCount(); i++) {
        this.bsModalService.hide(i)
      }

      const callback = (event) => {
        if (event === constants.confirmClosedAndIgnoreUpdate) {
          this.updateVersionJson(this.version)
          this.workspaceService.sessions = [...this.workspaceService.sessions]
          this.repository.updateSessions(this.workspaceService.sessions)
        } else if (event === constants.confirmCloseAndDownloadUpdate) {
          this.windowService.openExternalUrl(`${constants.latestUrl}`)
        }
        this.bsModalRef = undefined
      }

      this.windowService.getCurrentWindow().show()
      this.bsModalRef = this.bsModalService.show(UpdateDialogComponent, {
        backdrop: 'static',
        animated: false,
        class: 'confirm-modal',
        initialState: {version: this.version, releaseDate: this.releaseDate, releaseNotes: this.releaseNotes, callback}
      })

    }
  }

  updateVersionJson(version: string): void {
    this.electronService.fs.writeFileSync(this.electronService.os.homedir() + '/.Leapp/.latest.json', version)
  }

  async getReleaseNote(): Promise<string> {
    return new Promise((resolve, _) => {
      this.httpClient.get('https://asset.noovolari.com/CHANGELOG.md', {responseType: 'text'}).subscribe(data => {
        resolve(this.markdown.render(data))
      }, error => {
        console.log('error', error)
        resolve('')
      })
    })
  }

  isReady() {
    return (this.version !== undefined)
  }
}
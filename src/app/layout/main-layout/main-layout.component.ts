import {Component, OnDestroy, OnInit} from '@angular/core';
import {compactMode} from '../../components/command-bar/command-bar.component';
import {ElectronService} from '../../services/electron.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  _compactMode: boolean;

  private subscription;

  constructor(private electronService: ElectronService) {
    this.subscription = compactMode.subscribe(value => {
      this._compactMode = value;
      this.electronService.ipcRenderer.send('resize-window', { compactMode: this._compactMode });
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
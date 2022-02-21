import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { IpcService, ProjectService } from '@core';
import { StatusService } from '@core/status.service';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';

@Component({
  selector: 'app-shell-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  //#region @Input/@Output/@ViewChild -----------------------------------------
  @Output() public sideNavToggle: EventEmitter<any>;
  //#endregion

  //#region private properties ------------------------------------------------
  private statusService: StatusService;
  private ipcService: IpcService;
  private matDialog: MatDialog;
  private zone: NgZone;
  //#endregion

  //#region public properties -------------------------------------------------
  public title: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    matDialog: MatDialog,
    statusService: StatusService,
    zone: NgZone,
    ipcService: IpcService) {
    this.title = 'Openproject';
    this.matDialog = matDialog;
    this.statusService = statusService
    this.ipcService = ipcService;
    this.zone = zone;
    this.sideNavToggle = new EventEmitter();
  }

  public ngOnInit(): void {
    this.statusService.statusChange.subscribe((status: string) => {
      if (status === 'config-required') {
        this.zone.run(() => {
          // open the dialog full screen and do not allow the user to cancel it
          this.matDialog.open(
            SettingsDialogComponent,
            {
              maxWidth: '100vw',
              maxHeight: '100vh',
              height: '100%',
              width: '100%',
              disableClose: true,
              data: { canCancel: false }
            }
          );
        })
      }
    });
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public devToolsClick(): void {
    this.ipcService.openDevTools();
  }

  public menuButtonClick(): void {
    this.sideNavToggle.emit();
  }

  public settingsClick(): void {
    this.matDialog.open(
      SettingsDialogComponent,
      {
        maxWidth: '100vw',
        maxHeight: '100vh',
        width: '600px'
      }
    );
  }
  //#endregion
}

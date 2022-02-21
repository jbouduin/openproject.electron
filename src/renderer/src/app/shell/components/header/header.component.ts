import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { IpcService, ProjectService } from '@core';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';

@Component({
  selector: 'app-shell-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  // <editor-fold desc='@Input'>
  @Output() public sideNavToggle: EventEmitter<any>;
  // </editor-fold>

  private projectService: ProjectService;
  private ipcService: IpcService;
  private matDialog: MatDialog;
  // <editor-fold desc='Public properties'>
  public title: string;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    matDialog: MatDialog,
    projectService: ProjectService,
    ipcService: IpcService) {
    this.title= 'Openproject';
    this.matDialog = matDialog;
    this.projectService = projectService;
    this.ipcService = ipcService;
    this.sideNavToggle = new EventEmitter();
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void { }
  // </editor-fold>

  // <editor-fold desc='UI Triggered methods'>
  public devToolsClick(): void {
    this.ipcService.openDevTools();
  }

  public menuButtonClick(): void {
    this.sideNavToggle.emit();
  }

  public refreshClick(): void {
    this.projectService.refresh();
  }

  public settingsClick(): void {
    this.matDialog.open(
      SettingsDialogComponent,
      {
        maxWidth: '100vw',
        maxHeight: '100vh',
        // height: '100%',
        width: '600px'
      }
    );
  }
  // </editor-fold>
}

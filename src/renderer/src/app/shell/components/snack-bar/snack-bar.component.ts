import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA, MatLegacySnackBarRef as MatSnackBarRef } from '@angular/material/legacy-snack-bar';
import { IpcService } from '@core';
import { LogLevel } from '@common';
import { SnackBarParams } from './snack-bar.params';

@Component({
  selector: 'app-snack-bar',
  templateUrl: './snack-bar.component.html',
  styleUrls: ['./snack-bar.component.scss']
})
export class SnackBarComponent {

  //#region private properties ------------------------------------------------
  private snackBarRef: MatSnackBarRef<SnackBarComponent>;
  private ipcService: IpcService;
  //#endregion

  //#region public properties -------------------------------------------------
  public params: SnackBarParams;
  public buttonColor: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(
    ipcService: IpcService,
    snackBarRef: MatSnackBarRef<SnackBarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) params: SnackBarParams) {
      this.ipcService = ipcService;
    this.params = params;
    this.snackBarRef = snackBarRef;
    if (params.logLevel === LogLevel.Error) {
      this.buttonColor = 'warn'
    } else {
      this.buttonColor = 'accent'
    }
  }
  //#endregion

  //#region UI-triggered methods ----------------------------------------------
  public close(): void {
    this.snackBarRef.dismiss();
  }

  public openDevTools(): void {
    this.ipcService.openDevTools();
  }
  //#endregion
}

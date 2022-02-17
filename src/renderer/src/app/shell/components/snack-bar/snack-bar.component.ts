import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { LogLevel } from '../../../../../../common/log-level';
import { SnackBarParams } from './snack-bar.params';

@Component({
  selector: 'app-snack-bar',
  templateUrl: './snack-bar.component.html',
  styleUrls: ['./snack-bar.component.scss']
})
export class SnackBarComponent {

  //#region private properties ------------------------------------------------
  private snackBarRef: MatSnackBarRef<SnackBarComponent>;
  //#endregion

  //#region public properties -------------------------------------------------
  public params: SnackBarParams;
  public buttonColor: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(
    snackBarRef: MatSnackBarRef<SnackBarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) params: SnackBarParams) {
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
  //#endregion
}

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConfigurationService } from '@core/configuration.service';
import { DataVerb, DtoConfiguration, DtoLogLevelConfiguration, DtoUntypedDataResponse } from '@common';
import { LogLevel, LogSource } from '@common';
import { ConfirmationDialogService } from '@shared';

interface ILogLevelOption {
  value: LogLevel;
  display: string
}

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit {
  //#region private properties ------------------------------------------------
  private dialogRef: MatDialogRef<SettingsDialogComponent>;
  private configurationService: ConfigurationService;
  private dialogService: ConfirmationDialogService;
  private savePath: string;
  private saveVerb: DataVerb;
  //#endregion

  //#region public properties -------------------------------------------------
  public formData: FormGroup;
  public canCancel: boolean;
  public levels: Array<ILogLevelOption>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(
    formbuilder: FormBuilder,
    configurationService: ConfigurationService,
    dialogService: ConfirmationDialogService,
    dialogRef: MatDialogRef<SettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public params: any) {
    if (params) {
      this.canCancel = params.canCancel;
    } else {
      this.canCancel = true;
    }
    this.savePath = this.canCancel ? '/config' : '/config/init';
    this.saveVerb = this.canCancel ? DataVerb.PATCH : DataVerb.POST;
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this.dialogRef = dialogRef;
    this.formData = formbuilder.group({
      apiKey: new FormControl(undefined, Validators.required),
      apiHost: new FormControl(undefined, Validators.required),
      apiRoot: new FormControl(),
      axios: new FormControl(LogLevel.None),
      main: new FormControl(LogLevel.None),
      renderer: new FormControl(LogLevel.None)
    });
    this.levels = new Array<ILogLevelOption>(
      { value: LogLevel.None, display: 'None' },
      { value: LogLevel.Error, display: 'Error' },
      { value: LogLevel.Warning, display: 'Warning' },
      { value: LogLevel.Info, display: 'Info' },
      { value: LogLevel.Debug, display: 'Verbose' },
    );
  }

  ngOnInit(): void {
    console.log('start of on init')
    this.configurationService
      .loadConfiguration()
      .then((configuration: DtoConfiguration) => {
        console.log(configuration)
        this.formData.controls['apiKey'].patchValue(configuration.api.apiKey);
        this.formData.controls['apiHost'].patchValue(configuration.api.apiHost);
        this.formData.controls['apiRoot'].patchValue(configuration.api.apiRoot);
        configuration.log.levels.forEach((level: DtoLogLevelConfiguration) => {
          switch (level.logSource) {
            case LogSource.Axios:
              this.formData.controls['axios'].patchValue(level.logLevel);
              break;
            case LogSource.Main:
              this.formData.controls['main'].patchValue(level.logLevel);
              break;
            case LogSource.Renderer:
              this.formData.controls['renderer'].patchValue(level.logLevel);
              break;
          }
        });
      }).catch((reason:any) => console.log(reason));
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public save(): void {
    const toSave: DtoConfiguration = {
      api: {
        apiHost: this.formData.controls['apiHost'].value,
        apiKey: this.formData.controls['apiKey'].value,
        apiRoot: this.formData.controls['apiRoot'].value
      },
      log: {
        levels: [
          { logSource: LogSource.Axios, logLevel: this.formData.controls['axios'].value },
          { logSource: LogSource.Main, logLevel: this.formData.controls['main'].value },
          { logSource: LogSource.Renderer, logLevel: this.formData.controls['renderer'].value },
        ]
      }
    };
    this.configurationService
      .saveConfiguration(toSave, this.saveVerb, this.savePath)
      .then((response: DtoUntypedDataResponse) => {
        if (response.message) {
          this.dialogService
            .showErrorMessageDialog(response.message)
            .afterClosed().subscribe(() => this.dialogRef.close());
        } else {
          this.dialogRef.close();
        }
      })
      .catch((response: DtoUntypedDataResponse) => this.dialogService.showErrorMessageDialog(response.message));
  }

  public cancel(): void {
    this.dialogRef.close();
  }
  //#endregion
}

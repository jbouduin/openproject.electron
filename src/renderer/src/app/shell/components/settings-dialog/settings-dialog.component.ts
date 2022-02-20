import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { ConfigurationService } from '@core/configuration.service';
import { DataStatus, DtoConfiguration, DtoLogLevelConfiguration, DtoUntypedDataResponse } from '@ipc';
import { LogLevel, LogSource } from '@common';
import { ConfirmationDialogService } from '@shared';

interface ILogLevelOOption {
  value: LogLevel;
  display: string
}

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit {
  private dialogRef: MatDialogRef<SettingsDialogComponent>;
  private configurationService: ConfigurationService;
  private dialogService: ConfirmationDialogService;
  public formData: FormGroup;
  public levels: Array<ILogLevelOOption>;

  constructor(
    formbuilder: FormBuilder,
    configurationService: ConfigurationService,
    dialogService: ConfirmationDialogService,
    dialogRef: MatDialogRef<SettingsDialogComponent>) {
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
    this.levels = new Array<ILogLevelOOption>(
      { value: LogLevel.None, display: 'None' },
      { value: LogLevel.Error, display: 'Error' },
      { value: LogLevel.Warning, display: 'Warning' },
      { value: LogLevel.Info, display: 'Info' },
      { value: LogLevel.Debug, display: 'Verbose' },
    );
  }

  ngOnInit(): void {
    this.configurationService
      .loadConfiguration()
      .then((configuration: DtoConfiguration) => {
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
      });
  }

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
      .saveConfiguration(toSave)
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
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { ConfigurationService } from '@core/configuration.service';
import { DtoConfiguration, DtoLogLevelConfiguration } from '@ipc';
import { LogLevel, LogSource } from '@common';

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

  public configuration: DtoConfiguration;
  public formData: FormGroup;
  public levels: Array<ILogLevelOOption>;
  constructor(
    formbuilder: FormBuilder,
    configurationService: ConfigurationService,
    dialogRef: MatDialogRef<SettingsDialogComponent>) {
    this.configurationService = configurationService;
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
      { value: LogLevel.None, display: 'None'},
      { value: LogLevel.Error, display: 'Error'},
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
          switch(level.logSource) {
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

  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

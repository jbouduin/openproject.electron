import { Injectable } from '@angular/core';
import { LogLevel, LogSource } from '@common';
import { DtoLogConfiguration, DtoLogLevelConfiguration, DtoLogMessage } from '@ipc';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '../shell/components/snack-bar/snack-bar.component';
import { SnackBarParams } from '../shell/components/snack-bar/snack-bar.params';

interface logEntry {
  logSource: LogSource;
  logLevel: LogLevel;
  message: string;
  args: Array<any>
}

@Injectable({
  providedIn: 'root'
})
export class LogService {

  //#region Private properties ------------------------------------------------
  private snackBar: MatSnackBar;
  private logConfiguration: DtoLogConfiguration;
  private readonly queue: Array<logEntry>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(snackBar: MatSnackBar) {
    this.snackBar = snackBar;
    this.logConfiguration = undefined;
    this.queue = new Array<logEntry>();
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  private setLogConfiguration(configuration: DtoLogConfiguration): void {
    this.logConfiguration = configuration;
    while (this.queue.length > 0) {
      const entry = this.queue.shift();
      //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.log(entry.logSource, entry.logLevel, entry.message, ...entry.args);
    }
  }

  public initialize(): void {
    // catch the log messages coming from main
    window.api.electronIpcRemoveAllListeners('log');
    window.api.electronIpcOn('log', (_event, arg) => {
      try {
        const message: DtoLogMessage = JSON.parse(arg);
        this.log(message.logSource, message.logLevel, message.message, ...message.args);
      } catch (error) {
        this.log(
          LogSource.Renderer,
          LogLevel.Error,
          'Error processing message received:',
          arg);
      }
    });
    // catch the log configuration changes coming from main
    window.api.electronIpcRemoveAllListeners('log-config');
    window.api.electronIpcOn('log-config', (_event, arg) => {
      console.log('config arrived');
      this.setLogConfiguration(arg);
    });

  }

  public info(message: string, ...args: Array<any>): void {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.log(LogSource.Renderer, LogLevel.Info, message, ...args);
  }

  public error(message: string, ...args: Array<any>): void {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.log(LogSource.Renderer, LogLevel.Error, message, ...args);
  }

  public warning(message: string, ...args: Array<any>): void {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.log(LogSource.Renderer, LogLevel.Warning, message, ...args);
  }

  public debug(message: string, ...args: Array<any>): void {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.log(LogSource.Renderer, LogLevel.Debug, message, ...args);
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private log(logSource: LogSource, logLevel: LogLevel, message: string, ...args: Array<any>): void {
    if (!this.logConfiguration) {
      this.queue.push({ logSource: logSource, logLevel: logLevel, message: message, args });
    } else {
      const configuredLevel = this.logConfiguration.levels.find((level: DtoLogLevelConfiguration) => level.logSource === logSource).logLevel;
      if (configuredLevel >= logLevel) {
        switch (logLevel) {
          case LogLevel.Info: {
            if (!args || args.length === 0) {
              console.info(`[${LogSource[logSource]}] ${message}`);
            } else {
              //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              console.info(`[${LogSource[logSource]}] ${message}`, ...args);
            }
            break;
          }
          case LogLevel.Error: {
            if (!args || args.length === 0) {
              console.error(`[${LogSource[logSource]}] ${message}`);
            } else {
              //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              console.error(`[${LogSource[logSource]}] ${message}`, ...args);
            }
            const params = new SnackBarParams(LogLevel.Error, message);
            this.snackBar.openFromComponent(SnackBarComponent, { data: params });
            break;
          }
          case LogLevel.Warning: {
            if (!args || args.length === 0) {
              console.warn(`[${LogSource[logSource]}] ${message}`);
            } else {
              //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              console.warn(`[${LogSource[logSource]}] ${message}`, ...args);;
            }
            const params = new SnackBarParams(LogLevel.Warning, message);
            this.snackBar.openFromComponent(SnackBarComponent, { data: params });
            break;
          }
          case LogLevel.Debug: {
            if (!args || args.length === 0) {
              console.debug(`[${LogSource[logSource]}] ${message}`);
            } else {
              //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              console.debug(`[${LogSource[logSource]}] ${message}`, ...args);;
            }
            break;
          }
        }
      }
    }
  }
  //#endregion

}

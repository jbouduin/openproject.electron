import { Injectable } from '@angular/core';
import { LogLevel, LogSource} from '@common';
import { DtoLogMessage } from '@ipc';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '../shell/components/snack-bar/snack-bar.component';
import { SnackBarParams } from '../shell/components/snack-bar/snack-bar.params';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  //#region Private properties ------------------------------------------------
  private snackBar: MatSnackBar;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(snackBar: MatSnackBar) {
    this.snackBar = snackBar;
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public initialize(): void {
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

  public log(logSource: LogSource, logLevel: LogLevel, message: string, ...args: Array<any>): void {
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
        const params = new SnackBarParams(LogLevel.Error,message);
        this.snackBar.openFromComponent(SnackBarComponent, { data: params});
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
  //#endregion

}

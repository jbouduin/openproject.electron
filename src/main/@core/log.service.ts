import { BrowserWindow } from 'electron';
import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoLogMessage, LogLevel, LogSource } from '@ipc';

export interface ILogService {
  injectWindow(browserWindow: BrowserWindow): void
  info(logSource: LogSource, object: any, ...args: Array<any>): void;
  error(logSource: LogSource, object: any, ...args: Array<any>): void;
  warning(logSource: LogSource, object: any, ...args: Array<any>): void;
  debug(logSource: LogSource, object: any, ...args: Array<any>): void;
  log(logSource: LogSource, LogLevel: LogLevel, object: any, ...args: Array<any>): void;
}

@injectable()
export class LogService implements ILogService {

  //#region Private properties ------------------------------------------------
  private browserWindow: BrowserWindow;
  private logQueue: Array<DtoLogMessage>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.browserWindow = undefined;
    this.logQueue = new Array<DtoLogMessage>();
  }
  //#endregion

  //#region ILogService interface members -------------------------------------
  public injectWindow(browserWindow: BrowserWindow): void {
    this.browserWindow = browserWindow;
    while (this.logQueue.length > 0) {
      this.browserWindow.webContents.send('log', JSON.stringify(this.logQueue.shift()));
    }
  }

  public info(logSource: LogSource, object: any, ...args: Array<any>): void {
    this.log(logSource, LogLevel.Info, object, ...args);
  }

  public error(logSource: LogSource, object: any, ...args: Array<any>): void {
    this.log(logSource, LogLevel.Error, object, ...args);
  }

  public warning(logSource: LogSource, object: any, ...args: Array<any>): void {
    this.log(logSource, LogLevel.Warning, object, ...args);
  }

  public debug(logSource: LogSource, object: any, ...args: Array<any>): void {
    this.log(logSource, LogLevel.Debug, object, ...args);
  }

  public log(logSource: LogSource, logLevel: LogLevel, object: any, ...args: Array<any>): void {
    const message: DtoLogMessage = {
      logSource,
      logLevel,
      object,
      args
    };

    if (!this.browserWindow) {
      this.logQueue.push(message);
    } else {
      this.browserWindow.webContents.send('log', JSON.stringify(message));
    }
  }
  //#endregion
}

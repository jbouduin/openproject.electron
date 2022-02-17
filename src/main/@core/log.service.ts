import { BrowserWindow } from 'electron';
import { injectable } from 'inversify';
import 'reflect-metadata';

import { LogLevel, LogSource } from '@common';
import { DtoLogMessage } from '@ipc';

export interface ILogService {
  injectWindow(browserWindow: BrowserWindow): void
  info(logSource: LogSource, message: string, ...args: Array<any>): void;
  error(logSource: LogSource, message: string, ...args: Array<any>): void;
  warning(logSource: LogSource, message: string, ...args: Array<any>): void;
  debug(logSource: LogSource, message: string, ...args: Array<any>): void;
  // log(logSource: LogSource, LogLevel: LogLevel, message: string, ...args: Array<any>): void;
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

  public info(logSource: LogSource, message: string, ...args: Array<any>): void {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.log(logSource, LogLevel.Info, message, ...args);
  }

  public error(logSource: LogSource, message: string, ...args: Array<any>): void {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.log(logSource, LogLevel.Error, message, ...args);
  }

  public warning(logSource: LogSource, message: string, ...args: Array<any>): void {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.log(logSource, LogLevel.Warning, message, ...args);
  }

  public debug(logSource: LogSource, message: string, ...args: Array<any>): void {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.log(logSource, LogLevel.Debug, message, ...args);
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private log(logSource: LogSource, logLevel: LogLevel, message: string, ...args: Array<any>): void {
    const logMessage: DtoLogMessage = {
      logSource: logSource,
      logLevel: logLevel,
      message: message,
      args: args ? Array.from(args) : undefined
    };

    if (!this.browserWindow) {
      this.logQueue.push(logMessage);
    } else {
      this.browserWindow.webContents.send('log', JSON.stringify(logMessage));
    }
  }
  //#endregion
}

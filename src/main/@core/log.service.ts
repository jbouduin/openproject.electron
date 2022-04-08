import { BrowserWindow } from 'electron';
import { injectable } from 'inversify';
import 'reflect-metadata';

import { LogLevel, LogSource } from '@common';
import { DtoLogConfiguration, DtoLogLevelConfiguration, DtoLogMessage } from '@common';

export interface ILogService {
  initialize(browserWindow: BrowserWindow, logConfig: DtoLogConfiguration): ILogService
  info(logSource: LogSource, message: string, ...args: Array<any>): void;
  error(logSource: LogSource, message: string, ...args: Array<any>): void;
  warning(logSource: LogSource, message: string, ...args: Array<any>): void;
  debug(logSource: LogSource, message: string, ...args: Array<any>): void;
  setLogConfig(logConfig: DtoLogConfiguration): ILogService;
}

// TODO 2027 write local log file (add to config also!)

@injectable()
export class LogService implements ILogService {

  //#region Private properties ------------------------------------------------
  private browserWindow: BrowserWindow;
  private logQueue: Array<DtoLogMessage>;
  private logConfig: DtoLogConfiguration;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.browserWindow = undefined;
    this.logQueue = new Array<DtoLogMessage>();
  }
  //#endregion

  //#region ILogService interface members -------------------------------------
  public initialize(browserWindow: BrowserWindow, logConfig: DtoLogConfiguration): ILogService {
    this.browserWindow = browserWindow;
    this.logConfig = logConfig;

    while (this.logQueue.length > 0) {
      this.browserWindow.webContents.send('log', JSON.stringify(this.logQueue.shift()));
    }
    return this;
  }

  public info(logSource: LogSource, message: string, ...args: Array<any>): void {
    this.log(logSource, LogLevel.Info, message, args ? Array.from(args) : undefined);
  }

  public error(logSource: LogSource, message: string, ...args: Array<any>): void {
    //eslint-disable-next-line no-console
    console.log(message, args ? Array.from(args) : undefined);
    this.log(logSource, LogLevel.Error, message, args ? Array.from(args) : undefined);
  }

  public warning(logSource: LogSource, message: string, ...args: Array<any>): void {
    this.log(logSource, LogLevel.Warning, message, args ? Array.from(args) : undefined);
  }

  public debug(logSource: LogSource, message: string, ...args: Array<any>): void {
    this.log(logSource, LogLevel.Debug, message, args ? Array.from(args) : undefined);
  }

  public setLogConfig(logConfig: DtoLogConfiguration): ILogService {
    this.logConfig = logConfig;
    return this;
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private log(logSource: LogSource, logLevel: LogLevel, message: string, args: Array<any>): void {
    const logMessage: DtoLogMessage = {
      logSource: logSource,
      logLevel: logLevel,
      message: message,
      args: args
    };

    if (!this.browserWindow || !this.logConfig) {
      this.logQueue.push(logMessage);
    } else {
      const configuredLevel = this.logConfig.levels.find((level: DtoLogLevelConfiguration) => level.logSource === logSource).logLevel;
      if (configuredLevel >= logLevel) {
        this.browserWindow.webContents.send('log', JSON.stringify(logMessage));
      }
    }
  }
  //#endregion
}

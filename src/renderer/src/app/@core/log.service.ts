import { Injectable } from '@angular/core';
import { DtoLogMessage, LogLevel, LogSource } from '@ipc';


@Injectable({
  providedIn: 'root'
})
export class LogService {

  // <editor-fold desc='Private properties'>
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() { }
  // </editor-fold>

  // <editor-fold desc='public methods'>
  public initialize(): void {
    window.api.electronIpcRemoveAllListeners('log');
    window.api.electronIpcOn('log', (_event, arg) => {
      try {
        const message: DtoLogMessage = JSON.parse(arg);
        this.log(message.logSource, message.logLevel, message.object, message.args);
      } catch (error) {
        this.log(
          LogSource.Renderer,
          LogLevel.Error,
          'Error processing message received:',
          arg);
      }
    });
  }

  public info(object: any, ...args: Array<any>): void {
    this.log(LogSource.Renderer, LogLevel.Info, object, ...args);
  }

  public error(object: any, ...args: Array<any>): void {
    this.log(LogSource.Renderer, LogLevel.Error, object, ...args);
  }

  public warning(object: any, ...args: Array<any>): void {
    this.log(LogSource.Renderer, LogLevel.Warning, object, ...args);
  }

  public debug(object: any, ...args: Array<any>): void {
    this.log(LogSource.Renderer, LogLevel.Debug, object, ...args);
  }

  public log(logSource: LogSource, logLevel: LogLevel, object: any, ...args: Array<any>): void {
    switch (logLevel) {
      case LogLevel.Info: {
        if (typeof object === 'string' && !args || args.length === 0) {
          console.info(`[${LogSource[logSource]}] ${object}`);
        } else {
          console.info(`[${LogSource[logSource]}]`, object, ...args);
        }
        break;
      }
      case LogLevel.Error: {
        if (typeof object === 'string' && !args || args.length === 0) {
          console.error(`[${LogSource[logSource]}] ${object}`);
        } else {
          console.error(`[${LogSource[logSource]}]`, object, ...args);
        }
        break;
      }
      case LogLevel.Warning: {
        if (typeof object === 'string' && !args || args.length === 0) {
          console.warn(`[${LogSource[logSource]}] ${object}`);
        } else {
          console.warn(`[${LogSource[logSource]}]`, object, ...args);
        }
        break;
      }
      case LogLevel.Debug: {
        if (typeof object === 'string' && !args || args.length === 0) {
          console.debug(`[${LogSource[logSource]}] ${object}`);
        } else {
          console.debug(`[${LogSource[logSource]}]`, object, ...args);
        }
        break;
      }
    }
  }
  // </editor-fold>

}

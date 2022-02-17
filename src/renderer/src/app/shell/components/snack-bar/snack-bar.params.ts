import { LogLevel } from "@common";

export class SnackBarParams {
  //#region public properties -------------------------------------------------
  public readonly logLevel: LogLevel;
  public readonly message: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(logLevel: LogLevel, message: string) {
    this.logLevel = logLevel;
    this.message = message;
  }
  //#endregion
}
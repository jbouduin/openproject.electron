import { isString } from "lodash";
import moment from "moment";

export class Subtotal<T> {
  //#region readonly properties
  public readonly subTotalFor: T;
  public readonly duration: moment.Duration;
  //#endregion

  //#region Getter
  public get asString(): string {
    let value = this.duration.asMilliseconds() / 1000;
    const hours = Math.floor(value / 3600);
    value = value % 3600;
    const minutes = Math.floor(value / 60);
    return hours.toString().padStart(2, '0') + ':' +
      minutes.toString().padStart(2, '0');
  }
  //#endregion

  //#region Constructor & C°
  public constructor(subTotalFor: T, initial: string | moment.Duration) {
    this.subTotalFor = subTotalFor;
    this.duration = moment.duration(0);
    this.addTime(initial);
  }
  //#endregion

  //#region Public methods
  public addTime(time: string | moment.Duration): void {
    if (isString(time)) {
      this.duration.add(moment.duration(time));
    } else {
      this.duration.add(time);
    }
  }
  //#endregion
}
import { isString } from "lodash";
import moment from "moment";

export class Subtotal<T> {
  //#region readonly properties -----------------------------------------------
  public readonly subTotalFor: T;
  public readonly billableDuration: moment.Duration;
  public readonly nonBillableDuration: moment.Duration;
  //#endregion

  //#region Getter ------------------------------------------------------------
  public get totalAsString(): string {
    return this.milliSecondsToString(
      this.billableDuration.asMilliseconds() +
      this.nonBillableDuration.asMilliseconds()
    );
  }

  public get billableAsString(): string {
    return this.milliSecondsToString(this.billableDuration.asMilliseconds());
  }

  public get nonBillableAsString(): string {
    return this.milliSecondsToString(this.nonBillableDuration.asMilliseconds());
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(subTotalFor: T, initial: string | moment.Duration, billable: boolean) {
    this.subTotalFor = subTotalFor;
    this.billableDuration = moment.duration(0);
    this.nonBillableDuration = moment.duration(0);
    this.addTime(initial, billable);
  }

  public toExportable(label: string): Subtotal<string> {
    const result = new Subtotal<string>(label, this.billableDuration, true);
    result.addTime(this.nonBillableDuration, false);
    return result;
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public addTime(time: string | moment.Duration, billable: boolean): void {
    const toAdd = isString(time) ? moment.duration(time) : time;
    if (billable == true) {
      this.billableDuration.add(toAdd);
    } else {
      this.nonBillableDuration.add(toAdd);
    }
  }
  //#endregion

  //#region private methods
  private milliSecondsToString(milliseconds: number): string {
    let result = '';
    if (milliseconds > 0) {
      let value = milliseconds / 1000;
      const hours = Math.floor(value / 3600);
      value = value % 3600;
      const minutes = Math.floor(value / 60);
      result = hours.toString().padStart(2, '0') + ':' +
        minutes.toString().padStart(2, '0');
    }
    return result;
  }
  //#endregion
}
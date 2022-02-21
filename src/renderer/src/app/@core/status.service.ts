import { Injectable } from "@angular/core";
import { Observable, Subject, Subscriber } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  //#region private properties ------------------------------------------------
  private readonly status: Subject<string>;
  //#endregion

  //#region public properties -------------------------------------------------
  public readonly statusChange: Observable<string>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.status = new Subject<string>();
    this.statusChange = this.status.asObservable()
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public initialize(): void {
    window.api.electronIpcRemoveAllListeners('system-status');
    window.api.electronIpcOn('system-status', (_event, arg) => {
      this.status.next(arg);
    });
  }
  //#endregion
}
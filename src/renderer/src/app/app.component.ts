import { Component, OnInit } from '@angular/core';
import { LogService } from '@core';

@Component({
  selector: 'app-root',
  template: '<app-shell></app-shell>',
  styles: []
})
export class AppComponent implements OnInit {

  //#region private properties ------------------------------------------------
  private logService: LogService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(logService: LogService) {
    this.logService = logService;
  }

  public ngOnInit(): void {
    this.logService.initialize();
  }
  //#endregion

}

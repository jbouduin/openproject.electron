import { Component, OnInit } from '@angular/core';
import { LogService } from '@core';
import { ConfigurationService } from '@core/configuration.service';
import { StatusService } from '@core/status.service';
import { DtoConfiguration } from '@ipc';

@Component({
  selector: 'app-root',
  template: '<app-shell></app-shell>',
  styles: []
})
export class AppComponent implements OnInit {

  //#region private properties ------------------------------------------------
  private logService: LogService;
  private configurationService: ConfigurationService;
  private statusService: StatusService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(statusService: StatusService, logService: LogService, configurationService: ConfigurationService) {
    this.statusService = statusService;
    this.logService = logService;
    this.configurationService = configurationService;
  }

  public ngOnInit(): void {
    this.statusService.initialize();
    this.logService.initialize();
  }
  //#endregion

}

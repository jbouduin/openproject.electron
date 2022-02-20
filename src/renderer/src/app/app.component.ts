import { Component, OnInit } from '@angular/core';
import { LogService } from '@core';
import { ConfigurationService } from '@core/configuration.service';
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
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(logService: LogService, configurationService: ConfigurationService) {
    this.logService = logService;
    this.configurationService = configurationService;
  }

  public ngOnInit(): void {
    this.logService.initialize();
    void this.configurationService
      .loadConfiguration()
      .then((configuration: DtoConfiguration) => this.logService.setLogConfiguration(configuration.log));
  }
  //#endregion

}

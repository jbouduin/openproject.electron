import { Component, NgZone, OnInit } from '@angular/core';
import { StatusService } from '@core/status.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {

  //#region private properties ------------------------------------------------
  private statusService: StatusService;
  private zone: NgZone;
  //#endregion

  //#region public properties -------------------------------------------------
  public isInitializing: boolean;
  //#endregion


  //#region Constructor & C° --------------------------------------------------
  constructor(zone: NgZone, statusService: StatusService) {
    this.zone = zone;
    this.statusService = statusService;
    this.isInitializing = true;
   }

  ngOnInit(): void {
    this.statusService.statusChange.subscribe((status: string) => {
      if (status === 'ready') {
        this.zone.run(() => this.isInitializing = false);
      }
    });
  }
  //#endregion
}

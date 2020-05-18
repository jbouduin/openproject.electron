import { Component, OnInit } from '@angular/core';

import { DtoBaseFilter, DtoTimeEntry } from '@ipc';
import { CacheService, LogService } from '@core';

@Component({
  selector: 'time-entry-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  // <editor-fold desc='Public properties'>
  public timeEntries = Array<DtoTimeEntry>();
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(private cacheService: CacheService, private logService: LogService) {
    this.timeEntries = new Array<DtoTimeEntry>();
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void { }
  // </editor-fold>

  // <editor-fold desc='UI triggered methods'>
  public load(filter: DtoBaseFilter): void {
    this.cacheService.loadTimeEntries(filter).then(response => {
      this.logService.verbose('total', response.total);
      this.logService.verbose('count', response.count);
      this.logService.verbose('pageSize', response.pageSize);
      this.logService.verbose('offset', response.offset);
      this.timeEntries = response.items;
    });
  }
  // </editor-fold>
}
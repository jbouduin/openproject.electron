import { Component, OnInit } from '@angular/core';

import { DtoBaseFilter, DtoTimeEntry, DtoTimeEntryList, DtoProject } from '@ipc';
import { CacheService, LogService } from '@core';

@Component({
  selector: 'time-entry-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  // <editor-fold desc='Public properties'>
  public timeEntryList: DtoTimeEntryList;
  public projects: Array<DtoProject>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(private cacheService: CacheService, private logService: LogService) {
    this.timeEntryList = {
      total: 0,
      count: 0,
      pageSize: undefined,
      offset: undefined,
      items: new Array<DtoTimeEntry>()
    };
    this.projects = new Array<DtoProject>();
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void {
    this.cacheService.projects().then(projects => this.projects = projects);
  }
  // </editor-fold>

  // <editor-fold desc='UI triggered methods'>
  public load(filter: DtoBaseFilter): void {
    this.cacheService.loadTimeEntries(filter).then(response => {
      this.logService.verbose('total', response.total);
      this.logService.verbose('count', response.count);
      this.logService.verbose('pageSize', response.pageSize);
      this.logService.verbose('offset', response.offset);
      this.timeEntryList = response;
    });
  }
  // </editor-fold>
}

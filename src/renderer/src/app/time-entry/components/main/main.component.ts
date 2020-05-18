import { Component, OnInit } from '@angular/core';

import { DtoTimeEntry } from '@ipc';
import { CacheService } from '@core';

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
  public constructor(private cacheService: CacheService) {
    this.timeEntries = new Array<DtoTimeEntry>();
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void {
    this.cacheService.timeEntries().then(entries => this.timeEntries = entries);
  }
  // </editor-fold>

}

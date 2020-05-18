import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';

import * as moment  from 'moment';

import { DtoTimeEntry } from '@ipc';

@Component({
  selector: 'time-entry-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  // <editor-fold desc='@Input/@Output/@ViewChild'>
  @Input() public timeEntries = Array<DtoTimeEntry>();
  @ViewChild(MatSort) sort: MatSort;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public displayedColumns: string[];
  // </editor-fold>
  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.displayedColumns = ['spentOn', 'activityTitle', 'workPackageTitle', 'comment', 'customField2', 'customField3', 'hours'];
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void { }
  // </editor-fold>

  // <editor-fold desc='Public methods'>
  public getTotalTime(): string {
    const total = new Date(
      this.timeEntries
        .map(entry => moment.duration(entry.hours).asMilliseconds())
        .reduce((acc, value) => acc + value, 0)
    );
    const hours = total.getUTCHours();
    const minutes = total.getUTCMinutes();

    return hours.toString().padStart(2, '0') + ':' +
      minutes.toString().padStart(2, '0');
  }
  // </editor-fold>
}

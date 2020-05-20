import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatSort } from '@angular/material/sort';

import * as moment  from 'moment';

import { DtoTimeEntry, DtoTimeEntryList } from '@ipc';

@Component({
  selector: 'time-entry-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnChanges, OnInit {

  // <editor-fold desc='@Input/@Output/@ViewChild'>
  @Input() public timeEntryList: DtoTimeEntryList;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public displayedColumns: string[];
  public headerLabel: string;
  public showTable: boolean;
  public timeEntries: Array<DtoTimeEntry>;
  public totalTime: string;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.displayedColumns = ['spentOn', 'activityTitle', 'workPackageTitle', 'comment', 'customField2', 'customField3', 'hours'];
    this.timeEntries = new Array<DtoTimeEntry>();
    this.headerLabel = 'Result';
    this.showTable = false;
    this.totalTime = '';
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'timeEntryList': {
            const newValue = changes[propName].currentValue;
            if (newValue.offset === 1) {
              this.timeEntries = newValue.items;
              this.totalTime = this.getTotalTime();
              this.headerLabel = newValue.count > 0 ?
                newValue.total > (newValue.pageSize || 0) ? 'Result (partial)' : 'Result';
            } else {
              this.timeEntries.concat(newValue.items);
            }
            if (this.timeEntries.length > 0) {
              this.showTable = true;
              this.headerLabel = this.timeEntries.length < newValue.total ?
                `Result (partial ${this.timeEntries.length}/${newValue.total})` : 'Result';
            } else {
              this.showTable = false;
              this.headerLabel = 'No result';
            }
          }
        }
      }
    }
  }
  // </editor-fold>

  // <editor-fold desc='private methods'>
  private getTotalTime(): string {
    if (this.timeEntries) {
      let seconds = this.timeEntries
          .map(entry => moment.duration(entry.hours).asMilliseconds())
          .reduce((acc, value) => acc + value, 0) / 1000;

      const hours = Math.floor(seconds / 3600);
      seconds = seconds % 3600;
      const minutes = Math.floor(seconds / 60);

      return hours.toString() + ':' +
        minutes.toString().padStart(2, '0');
    } else {
      return '';
    }
  }
  // </editor-fold>

}

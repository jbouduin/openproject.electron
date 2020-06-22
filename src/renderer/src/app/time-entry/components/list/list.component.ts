import { Component, Input, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as moment  from 'moment';

import { DtoTimeEntry, DtoTimeEntryList } from '@ipc';

import { TimeEntry } from './time-entry';

@Component({
  selector: 'time-entry-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnChanges, OnInit {

  // <editor-fold desc='@Input/@Output/@ViewChild'>
  @Input() public timeEntryList: DtoTimeEntryList;
  @Output() public edit: EventEmitter<number>;
  @Output() public delete: EventEmitter<number>;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public displayedColumns: string[];
  public timeEntries: Array<TimeEntry>;
  public totalTime: string;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.displayedColumns = [
      'matIcon',
      'spentOn',
      'activityTitle',
      'workPackageTitle',
      'comment',
      'customField2',
      'customField3',
      'hours',
      'actions'
    ];
    this.timeEntries = new Array<TimeEntry>();
    this.edit = new EventEmitter<number>();
    this.delete = new EventEmitter<number>();
    this.totalTime = '';
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void { }

  public ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'timeEntryList': {
            const newValue = changes[propName].currentValue;
            const newEntries = newValue.items
              .map((entry: DtoTimeEntry) => new TimeEntry(entry))
              .sort( (a: TimeEntry, b: TimeEntry) => {
                if (a.customField2 < b.customField2) {
                  return -1;
                } else if (a.customField2 > b.customField2) {
                  return 1;
                } else {
                  return 0;
                }
              });
            this.validateEntries(newEntries);
            this.timeEntries = newEntries;
            this.totalTime = this.getTotalTime(newValue.items);
          }
        }
      }
    }
  }
  // </editor-fold>

  // <editor-fold desc='Public UI triggered methods'>
  public editEntry(id: number) {
    this.edit.emit(id);
  }

  public deleteEntry(id: number) {
    this.delete.emit(id);
  }
  // </editor-fold>

  // <editor-fold desc='private methods'>
  private getTotalTime(timeEntries: Array<DtoTimeEntry>): string {
    if (timeEntries) {
      let seconds = timeEntries
          .map(entry => moment.duration(entry.hours).asMilliseconds())
          .reduce((acc, value) => acc + value, 0) / 1000;

      const hours = Math.floor(seconds / 3600);
      seconds = seconds % 3600;
      const minutes = Math.floor(seconds / 60);

      return hours.toString().padStart(2, '0') + ':' +
        minutes.toString().padStart(2, '0');
    } else {
      return '';
    }
  }

  private validateEntries(entries: Array<TimeEntry>) {
    for(let idx = 0; idx < entries.length - 1; idx++ ) {
      const current = entries[idx];
      const next = entries[idx + 1];
      if (current.spentOn === next.spentOn) {
        if (current.customField3 > next.customField2) {
          current.setError('error', 'overlaps with next entry', 'warn');
        }
      }
    }
  }
  // </editor-fold>

}

import { Component, Input, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as moment  from 'moment';

import { TimeEntrySort } from '@common';
import { DtoTimeEntry, DtoTimeEntryList } from '@ipc';

import { TimeEntry } from './time-entry';
import { MatCheckboxChange } from '@angular/material/checkbox';

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
  @Output() public selectionChanged: EventEmitter<Array<number>>;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public displayedColumns: string[];
  public nonBillableFooterColumns: string[];
  public grandTotalFooterColumns: string[];

  public timeEntries: Array<TimeEntry>;
  public totalBillable: string;
  public totalNonBillable: string;
  public totalTime: string;
  // </editor-fold>

  // <editor-fold desc='public getters/setters'>
  public get allIndeterminate(): boolean {
    return this.timeEntries.some(entry => entry.selected) && this.timeEntries.some(entry => !entry.selected);
  }

  public get allSelected(): boolean {
    return this.timeEntries.every(entry => entry.selected);
  }

  public set allSelected(value: boolean) {
    this.timeEntries.forEach(entry => entry.selected = value);
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.displayedColumns = [
      'matIcon',
      'billable',
      'spentOn',
      'activity',
      'workPackageTitle',
      'comment',
      'start',
      'end',
      'hours',
      'actions'
    ];
    this.nonBillableFooterColumns = [
      'matIcon',
      'billable',
      'spentOn',
      'activity',
      'workPackageTitle',
      'comment',
      'start',
      'nonBillableLabel',
      'nonBillableValue',
      'actions'
    ];
    this.grandTotalFooterColumns = [
      'matIcon',
      'billable',
      'spentOn',
      'activity',
      'workPackageTitle',
      'comment',
      'start',
      'grandTotalLabel',
      'grandTotalValue',
      'actions'
    ];
    this.timeEntries = new Array<TimeEntry>();
    this.edit = new EventEmitter<number>();
    this.delete = new EventEmitter<number>();
    this.selectionChanged = new EventEmitter<Array<number>>();
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
            const newEntries = TimeEntrySort.sortByDateAndTime(newValue.items)
              .map((entry: DtoTimeEntry) => new TimeEntry(entry));
            this.validateEntries(newEntries);
            this.timeEntries = newEntries;
            this.totalBillable = this.getTotalTimeAsString(newValue.items, true);
            this.totalNonBillable = this.getTotalTimeAsString(newValue.items, false);
            this.totalTime = this.getTotalTimeAsString(newValue.items, undefined);
          }
        }
      }
    }
  }
  // </editor-fold>

  // <editor-fold desc='Public UI triggered methods'>
  public editEntry(id: number): void {
    this.edit.emit(id);
  }

  public deleteEntry(id: number): void {
    this.delete.emit(id);
  }

  public toggleSelect(): void {
    this.timeEntries.forEach(entry => entry.selected = false);
    if (this.displayedColumns[0] === 'select') {
      this.displayedColumns.shift();
      this.nonBillableFooterColumns.shift();
      this.grandTotalFooterColumns.shift();
    } else {
      this.displayedColumns.unshift('select');
      this.nonBillableFooterColumns.unshift('select');
      this.grandTotalFooterColumns.unshift('select');
    }
  }

  public toggleChange(_event: MatCheckboxChange) {
    this.selectionChanged.emit(this.timeEntries.filter(entry => entry.selected).map(entry => entry.id));
  }
  // </editor-fold>

  // <editor-fold desc='private methods'>
  private filterTime(timeEntry: DtoTimeEntry, billable: boolean): boolean {
    if (billable === true) {
      return timeEntry.workPackage.billable || timeEntry.project.pricing == 'Fixed Price';
    } else if (billable === false) {
      return !timeEntry.workPackage.billable && timeEntry.project.pricing != 'Fixed Price';
    } else {
      return true;
    }
  }

  private getTotalTimeAsString(timeEntries: Array<DtoTimeEntry>, billable: boolean): string {
    if (timeEntries) {
      let seconds = timeEntries
          .filter(entry => this.filterTime(entry, billable))
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
        if (current.end > next.start) {
          current.setError('error', 'overlaps with next entry', 'warn');
        }
      }
    }
  }
  // </editor-fold>

}

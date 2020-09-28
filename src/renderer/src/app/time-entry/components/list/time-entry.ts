import * as moment from 'moment';

import { DtoTimeEntry } from '@ipc';

export class TimeEntry {

  // <editor-fold desc='Private properties'>
  private _matIcon?: string;
  private _iconColor?: string
  private _tooltip?: string;
  private dtoTimeEntry: DtoTimeEntry;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public selected: boolean;
  // </editor-fold>

  // <editor-fold desc='Public getter methods'>
  public get activity(): string {
    return this.dtoTimeEntry.activity.name;
  }

  public get billable(): boolean {
    return this.dtoTimeEntry.workPackage.customField6;
  }

  public get billableColor(): string {
    if (this.billable && this.dtoTimeEntry.customField5) {
      return '';
    } else {
      return 'warn';
    }
  }
  public get comment(): string {
    return this.dtoTimeEntry.comment.raw;
  }

  public get customField2(): string {
    return this.dtoTimeEntry.customField2;
  }

  public get customField3(): string {
    return this.dtoTimeEntry.customField3
  }

  public get hours(): string {
    return this.dtoTimeEntry.hours;
  }

  public get id(): number {
    return this.dtoTimeEntry.id;
  }

  public get spentOn(): Date {
    return this.dtoTimeEntry.spentOn;
  }

  public get workPackageId(): number {
    return this.dtoTimeEntry.workPackage.id;
  }

  public get workPackageTitle(): string {
    return this.dtoTimeEntry.workPackage.subject;
  }

  public get matIcon(): string | undefined {
    return this._matIcon;
  }

  public get iconColor(): string | undefined {
    return this._iconColor;
  }

  public get tooltip(): string | undefined {
    return this._tooltip;
  }
  // </editor-fold>

  // <editor-fold desc='Constructor'>
  public constructor(dtoTimeEntry: DtoTimeEntry) {
    this.dtoTimeEntry = dtoTimeEntry;
    this._iconColor = undefined;
    this._tooltip = undefined;
    this._matIcon = undefined;
    this.selected = false;
    this.validateEntry();
  }
  // </editor-fold>

  // <editor-fold desc='Public methods'>
  public setError(icon: string, tooltip: string, iconColor: string) {
    this._matIcon = icon;
    this._tooltip = tooltip;
    this._iconColor = iconColor;
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private validateEntry() {
    try {
      const duration = moment.duration(this.dtoTimeEntry.hours).asMilliseconds();
      const start = this.dtoTimeEntry.customField2.split(':').map(part => Number(part));
      const startTime = moment.duration({ hours: start[0], minutes: start[1]}).asMilliseconds();
      const end = this.dtoTimeEntry.customField3.split(':').map(part => Number(part));
      const endTime = moment.duration({ hours: end[0], minutes: end[1]}).asMilliseconds();
      if (endTime - startTime !== duration) {
        this.setError('error', 'Duration does not correspond to start and end time', 'warn');
      }
    } catch {
      this.setError('error', 'Invalid data', 'warn');
    }
  }
  // </editor-fold>
}

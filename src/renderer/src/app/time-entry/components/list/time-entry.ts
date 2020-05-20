import * as moment from 'moment';

import { DtoTimeEntry } from '@ipc';

export class TimeEntry {

  // <editor-fold desc='Private properties'>
  private dtoTimeEntry: DtoTimeEntry;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public matIcon?: string;
  public iconColor?: string
  public tooltip?: string;
  // </editor-fold>

  // <editor-fold desc='Public getter methods'>
  public get activityTitle(): string {
    return this.dtoTimeEntry.activityTitle;
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

  public get workPackageTitle(): string {
    return this.dtoTimeEntry.workPackageTitle;
  }
  // </editor-fold>

  // <editor-fold desc='Constructor'>
  public constructor(dtoTimeEntry: DtoTimeEntry) {
    this.dtoTimeEntry = dtoTimeEntry;
    this.iconColor = undefined;
    this.tooltip = undefined;
    this.matIcon = undefined;
    this.validateEntry();
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
        this.matIcon = 'error';
        this.tooltip = 'Duration does not correspond to start and end time';
        this.iconColor = 'warn'; // 'primary', 'accent', or 'warn'.
      }
    } catch {
      this.matIcon = 'error';
      this.tooltip = 'Invalid data';
      this.iconColor = 'warn';
    }
  }
  // </editor-fold>
}

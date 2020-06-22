import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as moment from 'moment';

import { DtoProject } from '@ipc';
import { EditDialogParams } from './edit-dialog.params';

interface TimeSelection {
  value: moment.Duration;
  label: string;
}

@Component({
  selector: 'time-entry-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent implements OnInit {

  // <editor-fold desc='Public readonly properties'>
  public readonly startTimes: Array<TimeSelection>;
  public readonly endTimes: Array<TimeSelection>;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public formData: FormGroup;
  // </editor-fold>

  // <editor-fold desc='Public getters'>
  public get isCreate(): boolean {
    return this.params.timeEntry ? false : true;
  }

  public get projects(): Array<DtoProject> {
    return this.params.projects;
  }

  public get selectedProject(): Array<number> {
    if (this.params.timeEntry) {
      return [ this.params.timeEntry.projectId ];
    } else {
      return [];
    }
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  constructor(
    formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public params: EditDialogParams) {

    this.startTimes = this.getStartTimes();
    this.endTimes = this.getEndTimes();

    const workPackage = new FormControl( { value: '', disabled: this.params.timeEntry }, [Validators.required]);
    const activity = new FormControl( { value: '', disabled: this.params.timeEntry }, [Validators.required]);
    const spentOn = new FormControl( Date.now(), [Validators.required]);
    const startTime = new FormControl( undefined, [Validators.required]);
    const endTime = new FormControl( undefined, [Validators.required]);
    this.formData = formBuilder.group({
      workPackage,
      activity,
      spentOn,
      startTime,
      endTime
    });

    let date: Date;
    let start: number;
    let end: number;
    if (this.params.timeEntry) {
      workPackage.patchValue(this.params.timeEntry.workPackageTitle);
      activity.patchValue(this.params.timeEntry.activityTitle);
      date = this.params.timeEntry.spentOn;
      start = this.stringToMoment(this.params.timeEntry.customField2).asMilliseconds();
      end = this.stringToMoment(this.params.timeEntry.customField3).asMilliseconds();
    } else {
      date = new Date();
      date.setHours(0);
      start = this.stringToMoment("09:00").asMilliseconds();
      end = this.stringToMoment("10:00").asMilliseconds();
    }
    spentOn.patchValue(date);
    startTime.patchValue(this.startTimes.find(f => f.value.asMilliseconds() === start));
    endTime.patchValue(this.endTimes.find(f => f.value.asMilliseconds() === end));
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private getStartTimes(): Array<TimeSelection> {
    const result = new Array<TimeSelection>();
    for(let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 4; minute++) {
        const minutes = minute * 15;
        result.push({
          value: moment.duration({hours: hour, minutes: minutes}),
          label: hour.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
        });
      }
    }
    result.push({
      value: moment.duration({hours: 24, minutes: 0}),
      label: '24:00'
    });
    return result;
  }

  private getEndTimes(): Array<TimeSelection> {
    const result = new Array<TimeSelection>();
    for(let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 4; minute++) {
        const minutes = minute * 15;
        result.push({
          value: moment.duration({hours: hour, minutes: minutes}),
          label: hour.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
        });
      }
    }
    result.push({
      value: moment.duration({hours: 24, minutes: 0}),
      label: '24:00'
    });
    return result;
  }

  private stringToMoment(value: string): moment.Duration {
    return moment.duration({
      hours: Number.parseInt(value.split(':')[0]),
      minutes: Number.parseInt(value.split(':')[1])
    });
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void { }
  // </editor-fold>

  // <editor-fold desc='UI Triggered methods'>
  public save(): void {
     this.dialogRef.close();
  }

  public cancel(): void {
    // todo check if changes
    this.dialogRef.close();
  }
  // </editor-fold>
}

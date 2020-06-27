import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as moment from 'moment';

import { DtoProject } from '@ipc';
import { EditDialogParams } from './edit-dialog.params';

interface TimeSelection {
  value: moment.Duration;
  label: string;
  disabled: boolean;
}

@Component({
  selector: 'time-entry-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent implements OnInit {

  // <editor-fold desc='Public readonly properties'>
  public readonly startTimes: Array<TimeSelection>;
  public endTimes: Array<TimeSelection>;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public formData: FormGroup;
  // </editor-fold>

  // <editor-fold desc='Public getters'>
  public get isCreate(): boolean {
    return this.params.id ? false : true;
  }

  public get projects(): Array<DtoProject> {
    return this.params.projects;
  }

  public get selectedProject(): Array<number> {
    let result: Array<number>;
    if (this.params.timeEntry) {
      result = [ this.params.timeEntry.payload.project.id ];
    } else {
      result = new Array<number>();
    }
    return result;
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  constructor(
    formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public params: EditDialogParams) {

    this.startTimes = this.getStartTimes();
    const workPackage = new FormControl( { value: '', disabled: !this.isCreate }, [Validators.required]);
    const activity = new FormControl( { value: '', disabled: !this.isCreate }, [Validators.required]);
    const spentOn = new FormControl( Date.now(), [Validators.required]);
    const startTime = new FormControl( undefined, [Validators.required]);
    const endTime = new FormControl( undefined, [Validators.required]);
    const comment = new FormControl('');
    this.formData = formBuilder.group({
      workPackage,
      activity,
      spentOn,
      startTime,
      endTime,
      comment
    });

    let date: Date;
    let start: moment.Duration;
    let end: moment.Duration;
    if (!this.isCreate) {
      workPackage.patchValue(this.params.timeEntry.payload.workPackage.subject);
      activity.patchValue(this.params.timeEntry.payload.activity.name);
      comment.patchValue(this.params.timeEntry.payload.comment.raw);
      date = this.params.timeEntry.payload.spentOn;
      start = this.stringToMoment(this.params.timeEntry.payload.customField2);
      end = this.stringToMoment(this.params.timeEntry.payload.customField3);
    } else {
      date = new Date();
      date.setHours(0);
      start = this.stringToMoment("09:00");
      end = this.stringToMoment("10:00");
    }
    spentOn.patchValue(date);
    startTime.patchValue(this.startTimes.find(f => f.value.asMilliseconds() === start.asMilliseconds()));
    this.endTimes = this.getEndTimes(start);
    endTime.patchValue(this.endTimes.find(f => f.value.asMilliseconds() === end.asMilliseconds()));
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
          label: hour.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0'),
          disabled: false
        });
      }
    }
    return result;
  }

  private getEndTimes(start: moment.Duration): Array<TimeSelection> {
    const times = new Array<string>();

    for(let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 4; minute++) {
        if (hour > 0 || minute > 0) {
          const minutes = minute * 15;
          times.push(hour.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0'));
        }
      }
    }
    times.push("24:00");
    return times.map(time => {
      const newMoment = this.stringToMoment(time);
      let label = time;
      const diff = newMoment.clone().subtract(start);
      if (diff.asMilliseconds() > 0) {
        if (diff.asHours() >= 1) {
          label += ` (${diff.asHours()} Hours)`;
        } else {
          label += ` (${diff.asMinutes()} Minutes)`;
        }
      }
      return {
        value: newMoment,
        label,
        disabled: newMoment.asMilliseconds() <= start.asMilliseconds()
      };
    });
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
     this.dialogRef.close(this.params.timeEntry);
  }

  public cancel(): void {
    // todo check if changes
    this.dialogRef.close();
  }

  public startTimeChanged(): void {
    const oldEnd = this.formData.controls['endTime'].value.value as moment.Duration;
    const newStart = this.formData.controls['startTime'].value.value as moment.Duration;
    this.endTimes = this.getEndTimes(newStart);
    if (oldEnd < newStart)
    {
      this.formData.controls['endTime'].patchValue(this.endTimes.find(f => f.value.asMilliseconds() === newStart.asMilliseconds()));
    } else {
      this.formData.controls['endTime'].patchValue(this.endTimes.find(f => f.value.asMilliseconds() === oldEnd.asMilliseconds()));
    }
  }
  // </editor-fold>
}

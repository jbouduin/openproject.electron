import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as moment from 'moment';

import { DtoTimeEntry, DtoProject } from '@ipc';
import { ProjectTreeComponent } from '@shared';
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

  @ViewChild(ProjectTreeComponent) public projectTree: ProjectTreeComponent;

  public formData: FormGroup;
  public readonly startTimes: Array<TimeSelection>;
  public readonly endTimes: Array<TimeSelection>;

  public get isCreate(): boolean {
    return this.params.timeEntry ? false : true;
  }

  public get projects(): Array<DtoProject> {
    return this.params.projects;
  }

  constructor(
      formBuilder: FormBuilder,
      private dialogRef: MatDialogRef<EditDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public params: EditDialogParams) {
    this.formData = formBuilder.group({});
    this.startTimes = this.getStartTimes();
    this.endTimes = this.getEndTimes();
  }

  ngOnInit(): void {
  }

  public save(): void {
     this.dialogRef.close();
  }

  public cancel(): void {
    // todo check if changes
    this.dialogRef.close();
  }

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

}

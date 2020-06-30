import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as moment from 'moment';
import { switchMap, debounceTime, tap, finalize } from 'rxjs/operators';
import { from } from 'rxjs';

import { WorkPackageService } from '@core';
import { DtoProject, DtoTimeEntryActivity, DtoWorkPackage, DtoBaseFilter } from '@ipc';
import { EditDialogParams } from './edit-dialog.params';
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

interface TimeSelection {
  moment: moment.Duration;
  label: string;
  disabled: boolean;
  customFieldValue: string;
}

@Component({
  selector: 'time-entry-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent implements OnInit {

  // <editor-fold desc='Private properties'>
  private dialogRef: MatDialogRef<EditDialogComponent>;
  private workPackageService: WorkPackageService;
  // </editor-fold>

  // <editor-fold desc='Public readonly properties'>
  public readonly startTimes: Array<TimeSelection>;
  public endTimes: Array<TimeSelection>;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public allowedWorkPackages: Array<DtoWorkPackage>;
  public formData: FormGroup;
  public isLoading: boolean;
  public params: EditDialogParams;
  // </editor-fold>

  // <editor-fold desc='Public getters'>
  public get allowedActivities(): Array<DtoTimeEntryActivity> {
    return this.params.timeEntry.allowedActivities;
  }

  public get isCreate(): boolean {
    return this.params.isCreate;
  }

  public get projects(): Array<DtoProject> {
    return this.params.projects;
  }

  public get selectedProject(): Array<number> {
    let result: Array<number>;
    if (this.params.timeEntry.payload.project) {
      result = [ this.params.timeEntry.payload.project.id ];
    } else {
      result = new Array<number>();
    }
    return result;
  }

  // public get selectActivityLabel(): string {
  //   if (!this.params.timeEntry.allowedActivities || this.params.timeEntry.allowedActivities.length === 0) {
  //     return "Select a work package";
  //   } else {
  //     return "Activity";
  //   }
  // }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  constructor(
    formBuilder: FormBuilder,
    workPackageService: WorkPackageService,
    dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) params: EditDialogParams) {

    this.dialogRef = dialogRef;
    this.params = params;
    this.workPackageService = workPackageService;

    this.isLoading = false;
    this.startTimes = this.getStartTimes();
    this.allowedWorkPackages = this.params.isCreate ?
      new Array<DtoWorkPackage>() :
      [ this.params.timeEntry.payload.workPackage ];

    const workPackage = new FormControl( { value: '', disabled: !this.isCreate }, [Validators.required]);
    // TODO allow change of WP in edit mode
    const activity = new FormControl( { value: '', disabled: !this.isCreate }, [Validators.required]);
    const spentOn = new FormControl( Date.now(), [Validators.required]);
    const startTime = new FormControl( undefined, [Validators.required]);
    const endTime = new FormControl( undefined, [Validators.required]);
    const wpInput = new FormControl( { value: '', disabled: !this.isCreate }, [Validators.required] );
    const comment = new FormControl('');
    this.formData = formBuilder.group({
      wpInput,
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
      workPackage.patchValue(this.params.timeEntry.payload.workPackage.id);
      // we could consider patching this value also when creating as Openproject assigns a default
      activity.patchValue(this.params.timeEntry.payload.activity.id);
      comment.patchValue(this.params.timeEntry.payload.comment.raw);
      wpInput.patchValue(this.params.timeEntry.payload.workPackage);
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
    startTime.patchValue(this.startTimes.find(f => f.moment.asMilliseconds() === start.asMilliseconds()));
    this.endTimes = this.getEndTimes(start);
    endTime.patchValue(this.endTimes.find(f => f.moment.asMilliseconds() === end.asMilliseconds()));
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private getStartTimes(): Array<TimeSelection> {
    const result = new Array<TimeSelection>();
    for(let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 4; minute++) {
        const minutes = minute * 15;
        result.push({
          moment: moment.duration({hours: hour, minutes: minutes}),
          label: hour.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0'),
          disabled: false,
          customFieldValue: hour.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
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
        moment: newMoment,
        label,
        disabled: newMoment.asMilliseconds() <= start.asMilliseconds(),
        customFieldValue: time
      };
    });
  }

  private loadWorkPackages(inputValue: string): Observable<Array<DtoWorkPackage>> {
    if (inputValue) {
      const filters = new Array<any>();
      filters.push(
        {
          'subjectOrId': {
            'operator': '**',
            'values': [ inputValue ]
         }
        }
      );
      const dtoFilter: DtoBaseFilter = {
        offset: 0,
        pageSize: 20,
        filters: JSON.stringify(filters)
      };
      return from(this.workPackageService.loadWorkPackages(dtoFilter).then(list => list.items));
    } else {
      return from([]);
    }
  }

  private stringToMoment(value: string): moment.Duration {
    return moment.duration({
      hours: Number.parseInt(value.split(':')[0]),
      minutes: Number.parseInt(value.split(':')[1])
    });
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void {
    this.formData
      .get('wpInput')
      .valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading = true),
        switchMap(value => this.loadWorkPackages(value)
        .pipe(
          finalize(() => this.isLoading = false),
          )
        )
      )
      .subscribe(workPackages => this.allowedWorkPackages = workPackages);

  }
  // </editor-fold>

  // <editor-fold desc='UI Triggered methods'>
  public async save(): Promise<void> {
    // commit all the values
    const startTime = this.formData.controls['startTime'].value;
    const endTime = this.formData.controls['endTime'].value;
    this.params.timeEntry.payload.comment.raw = this.formData.controls['comment'].value;
    this.params.timeEntry.payload.customField2 = startTime.customFieldValue;
    this.params.timeEntry.payload.customField3 = endTime.customFieldValue;
    this.params.timeEntry.payload.hours = endTime.moment.subtract(startTime.moment).toISOString();
    // check if the date has been changed
    if (this.formData.controls['spentOn'].dirty) {
      this.params.timeEntry.payload.spentOn = this.formData.controls['spentOn'].value.toISOString(true).substring(0,10);
    }
    const validation = await this.params.validate(this.params.timeEntry);
    if (validation.validationErrors.length === 0) {
      this.params.save(this.params.timeEntry);
      this.dialogRef.close();
    } else {
      // TODO show the error messages;
      this.params.timeEntry = validation;
    }
  }

  public cancel(): void {
    // TODO check if changes
    this.dialogRef.close();
  }

  public displayWorkPackage (workPackage: DtoWorkPackage): string {
    if (workPackage) {
      return `#${workPackage.id}: ${workPackage.subject}`;
    } else {
      return '';
    }
  }

  public startTimeChanged(): void {
    const oldEnd = this.formData.controls['endTime'].value.moment as moment.Duration;
    const newStart = this.formData.controls['startTime'].value.moment as moment.Duration;
    this.endTimes = this.getEndTimes(newStart);
    if (oldEnd < newStart)
    {
      this.formData.controls['endTime'].patchValue(this.endTimes.find(f => f.moment.asMilliseconds() === newStart.asMilliseconds()));
    } else {
      this.formData.controls['endTime'].patchValue(this.endTimes.find(f => f.moment.asMilliseconds() === oldEnd.asMilliseconds()));
    }
  }

  public async workPackageSelected(event: MatAutocompleteSelectedEvent): Promise<void> {
    this.params.timeEntry.payload.project = event.option.value.project;
    this.params.timeEntry.payload.workPackage = event.option.value;
    const validation = await this.params.validate(this.params.timeEntry);
    this.params.timeEntry.allowedActivities = validation.allowedActivities;
    // console.log('errors', this.formData.invalid, this.formData.errors);
  }
  // </editor-fold>
}

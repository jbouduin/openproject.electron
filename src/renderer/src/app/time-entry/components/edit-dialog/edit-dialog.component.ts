import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as moment from 'moment';
import { switchMap, debounceTime, tap, finalize } from 'rxjs/operators';
import { from } from 'rxjs';

import { WorkPackageService } from '@core';
import { DtoProject, DtoTimeEntryActivity, DtoWorkPackage, DtoBaseFilter, DtoWorkPackageType } from '@ipc';
import { EditDialogParams } from './edit-dialog.params';
import { Observable } from 'rxjs';
import { ConfirmationDialogService } from '@shared';
import { WorkPackageTypeMap } from '@common';

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

  //#region Private properties ------------------------------------------------
  private confirmationDialogService: ConfirmationDialogService;
  private dialogRef: MatDialogRef<EditDialogComponent>;
  private workPackageService: WorkPackageService;
  private allowedWorkpackageTypes: Array<number>;
  //#endregion

  //#region Public readonly properties ----------------------------------------
  public readonly startTimes: Array<TimeSelection>;
  //#endregion

  //#region Public properties -------------------------------------------------
  public allowedWorkPackages: Array<DtoWorkPackage>;
  public endTimes: Array<TimeSelection>;
  public formData: FormGroup;
  public treeFormControl: FormControl;
  public isLoading: boolean;
  public params: EditDialogParams;
  //#endregion

  //#region Public getters ----------------------------------------------------
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
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    formBuilder: FormBuilder,
    workPackageService: WorkPackageService,
    confirmationDialogService: ConfirmationDialogService,
    dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) params: EditDialogParams) {

    this.confirmationDialogService = confirmationDialogService;
    this.dialogRef = dialogRef;
    this.params = params;
    this.workPackageService = workPackageService;

    this.isLoading = false;
    // TODO #1606 shouldn't part of this be in ngOnInit ?
    this.startTimes = this.getStartTimes();
    this.allowedWorkPackages = this.params.isCreate ?
      new Array<DtoWorkPackage>() :
      [ this.params.timeEntry.payload.workPackage ];
    this.allowedWorkpackageTypes = new Array<number>();
    this.treeFormControl = new FormControl( { value: undefined, disabled: !this.isCreate });
    const activity = new FormControl( undefined , [Validators.required]);
    const spentOn = new FormControl( Date.now(), [Validators.required]);
    const startTime = new FormControl( undefined, [Validators.required]);
    const endTime = new FormControl( undefined, [Validators.required]);
    const wpInput = new FormControl( { value: '', disabled: !this.isCreate }, [Validators.required] );
    const comment = new FormControl('');
    const openOnly = new FormControl({ value: true, disabled: !this.isCreate });
    const billed = new FormControl();
    const another = new FormControl({ value: false, disabled: !this.isCreate });
    this.formData = formBuilder.group({
      activity,
      billed,
      comment,
      endTime,
      openOnly,
      spentOn,
      startTime,
      treeFormControl: this.treeFormControl,
      wpInput,
      another
    });

    let date: moment.Moment;
    let start: moment.Duration;
    let end: moment.Duration;
    if (!this.isCreate) {
      if (this.params.timeEntry.allowedActivities.find((activity: DtoTimeEntryActivity) => activity.id == this.params.timeEntry.payload.activity.id)) {
        activity.patchValue(this.params.timeEntry.payload.activity.id);
      } else if (this.params.timeEntry.allowedActivities.length == 1) {
        activity.patchValue(this.params.timeEntry.allowedActivities[0].id);
        activity.markAsDirty();
      } else {
        activity.patchValue(-1);
      }
      comment.patchValue(this.params.timeEntry.payload.comment.raw);
      wpInput.patchValue(this.params.timeEntry.payload.workPackage);
      date = moment(this.params.timeEntry.payload.spentOn);
      start = this.stringToMoment(this.params.timeEntry.payload.start);
      end = this.stringToMoment(this.params.timeEntry.payload.end);
      this.treeFormControl.patchValue(this.params.timeEntry.payload.project.id);
      if (this.params.timeEntry.payload.workPackage.billable || this.params.timeEntry.payload.project.pricing == 'Fixed Price') {
        billed.enable();
        billed.patchValue(this.params.timeEntry.payload.billed);
      } else {
        billed.disable();
      }
    } else {
      date = moment().startOf('date');
      start = this.stringToMoment("09:00");
      end = this.stringToMoment("10:00");
    }
    spentOn.patchValue(date);
    startTime.patchValue(this.startTimes.find(f => f.moment.asMilliseconds() === start.asMilliseconds()));
    this.endTimes = this.getEndTimes(start);
    endTime.patchValue(this.endTimes.find(f => f.moment.asMilliseconds() === end.asMilliseconds()));
  }

  public ngOnInit(): void {
    const typesAsString = new Array<string>(
      WorkPackageTypeMap.Absence,
      WorkPackageTypeMap.Application,
      WorkPackageTypeMap.BlogPost,
      WorkPackageTypeMap.Company,
      WorkPackageTypeMap.Task,
      WorkPackageTypeMap.UserStory,
      WorkPackageTypeMap.WebPage
    );

    this.workPackageService
      .loadWorkPackageTypes()
      .then((allTypes: Array<DtoWorkPackageType>) =>
        this.allowedWorkpackageTypes = allTypes
          .filter((type: DtoWorkPackageType) => typesAsString.includes(type.name))
          .map((type: DtoWorkPackageType) => type.id)
      );

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
  //#endregion

  //#region Private methods ---------------------------------------------------
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
    if (inputValue && typeof inputValue === 'string') {
      const filters = new Array<any>();

      filters.push({
        'type': {
          'operator': '=',
          'values': this.allowedWorkpackageTypes
        }
      });

      filters.push(
        {
          'subjectOrId': {
            'operator': '**',
            'values': [ inputValue ]
         }
        }
      );

      if (this.treeFormControl.value) {
        filters.push({
          'project': {
            'operator': '=',
            'values': [ this.treeFormControl.value ]
          }
        });
      }

      if (this.formData.controls['openOnly'].value) {
        filters.push({
          'status_id': {
            'operator': 'o',
            'values': null
          }
        });
      }
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

  private createAnother(): void {
    const endTimeValue = this.formData.controls['endTime'].value;
    const start = this.stringToMoment(endTimeValue.customFieldValue);
    const end = moment.duration(start).add(1, 'h');
    this.endTimes = this.getEndTimes(start);
    this.formData.controls['startTime'].patchValue(this.startTimes.find(f => f.moment.asMilliseconds() === start.asMilliseconds()));
    this.formData.controls['endTime'].patchValue(this.endTimes.find(f => f.moment.asMilliseconds() === end.asMilliseconds()));
  }
  //#endregion

  //#region UI Triggered methods ----------------------------------------------
  public async save(): Promise<void> {
    // commit all the values that where not committed before
    const startTime = this.formData.controls['startTime'].value;
    const endTime = this.formData.controls['endTime'].value;
    this.params.timeEntry.payload.comment.raw = this.formData.controls['comment'].value;
    this.params.timeEntry.payload.start = startTime.customFieldValue;
    this.params.timeEntry.payload.end = endTime.customFieldValue;
    this.params.timeEntry.payload.billed = this.params.timeEntry.payload.workPackage.billable ||
      this.params.timeEntry.payload.project.pricing == 'Fixed Price' ?
      this.formData.controls['billed'].value :
      undefined;
    this.params.timeEntry.payload.hours = endTime.moment.subtract(startTime.moment).toISOString();
    this.params.timeEntry.payload.activity =
      this.allowedActivities.find(activity => activity.id === this.formData.controls['activity'].value);
    this.params.timeEntry.payload.spentOn = this.formData.controls['spentOn'].value.toISOString(true).substring(0,10);
    // validate the timeEntry
    const validation = await this.params.validate(this.params.timeEntry);
    // if the data is valid, save it, otherwise show the validation errors
    if (validation.validationErrors.length === 0) {
      this.params.timeEntry.commit = validation.commit;
      this.params.timeEntry.commitMethod = validation.commitMethod;
      this.params.save(this.params.timeEntry);
      if (this.isCreate && this.formData.controls['another'].value == true) {
        this.createAnother();
      } else {
        this.dialogRef.close();
      }
    } else {
      this.confirmationDialogService.showErrorMessageDialog(validation.validationErrors.map(error => error.message));
      this.params.timeEntry = validation;
    }
  }

  public cancel(): void {
    // #1187 check if changes
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
    const value = event.option.value as DtoWorkPackage;
    this.params.timeEntry.payload.project = value.project;
    this.treeFormControl.patchValue(value.project.id);
    this.params.timeEntry.payload.workPackage = value;
    const validation = await this.params.validate(this.params.timeEntry);
    this.params.timeEntry.allowedActivities = validation.allowedActivities;
    if (this.params.timeEntry.allowedActivities.length == 1) {
      this.formData.controls['activity'].patchValue(validation.allowedActivities[0].id);
    }
    const billed = this.formData.controls['billed'];

    if (value.billable || value.project.pricing == 'Fixed Price') {
      billed.enable();
    } else {
      billed.disable();
    }
  }

  public projectSelected(_selection: Array<number>): void {
    this.params.timeEntry.allowedActivities = new Array<DtoTimeEntryActivity>();
    this.allowedWorkPackages = new Array<DtoWorkPackage>();
    this.formData.controls['wpInput'].patchValue(undefined);
  }
  //#endregion
}

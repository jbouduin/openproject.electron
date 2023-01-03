import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent } from '@angular/material/legacy-autocomplete';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import * as moment from 'moment';
import { switchMap, debounceTime, tap, finalize } from 'rxjs/operators';
import { from } from 'rxjs';

import { TimeEntryService, WorkPackageService } from '@core';
import { DtoProject, DtoTimeEntryActivity, DtoWorkPackage, DtoBaseFilter, DtoWorkPackageType, DtoTimeEntryList, DtoTimeEntry } from '@common';
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
  private timeEntryService: TimeEntryService
  private allowedWorkpackageTypes: Array<number>;
  private lastStartTime: moment.Duration;
  //#endregion

  //#region Public readonly properties ----------------------------------------
  public readonly startTimes: Array<TimeSelection>;
  //#endregion

  //#region Public properties -------------------------------------------------
  public allowedWorkPackages: Array<DtoWorkPackage>;
  public endTimes: Array<TimeSelection>;
  public formData: FormGroup;
  public treeFormControl: FormControl;
  public isLoadingWorkPackages: boolean;
  public isLoadingLastTimeEntry: boolean;
  public params: EditDialogParams;
  public wpControl: FormControl;
  //#endregion

  //#region Public getters ----------------------------------------------------
  public get allowedActivities(): Array<DtoTimeEntryActivity> {
    return this.params.timeEntry.allowedActivities;
  }

  public get isNewEntry(): boolean {
    return this.params.mode == 'create' || this.params.mode == 'copy';
  }

  public get projects(): Array<DtoProject> {
    return this.params.projects;
  }

  public get selectedProject(): Array<number> {
    let result: Array<number>;
    if (this.params.timeEntry.payload.project) {
      result = [this.params.timeEntry.payload.project.id];
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
    timeEntryService: TimeEntryService,
    confirmationDialogService: ConfirmationDialogService,
    dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) params: EditDialogParams) {

    this.confirmationDialogService = confirmationDialogService;
    this.dialogRef = dialogRef;
    this.params = params;
    this.timeEntryService = timeEntryService;
    this.workPackageService = workPackageService;
    this.startTimes = this.getStartTimes();
    this.isLoadingWorkPackages = false;
    this.isLoadingLastTimeEntry = false;
    this.allowedWorkPackages = this.isNewEntry ?
      new Array<DtoWorkPackage>() :
      [this.params.timeEntry.payload.workPackage];
    this.allowedWorkpackageTypes = new Array<number>();
    this.treeFormControl = new FormControl({ value: undefined /*, disabled: !this.isNewEntry */ });
    this.wpControl = new FormControl({ value: null } /*, disabled: !this.isNewEntry } */, [Validators.required]),
      this.formData = formBuilder.group({
        treeFormControl: this.treeFormControl,
        activity: new FormControl(undefined, [Validators.required]),
        spentOn: new FormControl(Date.now(), [Validators.required]),
        startTime: new FormControl(undefined, [Validators.required]),
        endTime: new FormControl(undefined, [Validators.required]),
        wpInput: this.wpControl,
        comment: new FormControl(''),
        openOnly: new FormControl(true), // { value: true /*, disabled: !this.isNewEntry */ }),
      billed: new FormControl(),
      another: new FormControl({ value: false, disabled: !this.isNewEntry })
    });

  }

  public ngOnInit(): void {
    this.setAllowedWorkpackageTypes();
    this.setInitialValues();
    this.formData
      .get('wpInput')
      .valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoadingWorkPackages = true),
        switchMap((value: string) => this.loadWorkPackages(value)
          .pipe(
            finalize(() => this.isLoadingWorkPackages = false),
          )
        )
      )
      .subscribe(workPackages => this.allowedWorkPackages = workPackages);
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
    this.params.timeEntry.payload.spentOn = this.formData.controls['spentOn'].value.toISOString(true).substring(0, 10);
    // validate the timeEntry
    const validation = await this.params.validate(this.params.timeEntry);
    // if the data is valid, save it, otherwise show the validation errors
    if (validation.validationErrors.length === 0) {
      this.params.timeEntry.commit = validation.commit;
      this.params.timeEntry.commitMethod = validation.commitMethod;
      this.params.save(this.params.timeEntry);
      if (this.isNewEntry && this.formData.controls['another'].value == true) {
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
    // TODO #1187 check if changes
    this.dialogRef.close();
  }

  public displayWorkPackage(workPackage: DtoWorkPackage): string {
    if (workPackage != null && workPackage.id != undefined) {
      return `#${workPackage.id}: ${workPackage.subject}`;
    } else {
      return '';
    }
  }

  public startTimeChanged(): void {
    const oldEnd = this.formData.controls['endTime'].value.moment as moment.Duration;
    const newStart = this.formData.controls['startTime'].value.moment as moment.Duration;
    const movedBy = newStart.clone().subtract(this.lastStartTime);
    this.endTimes = this.getEndTimes(newStart);
    const newEnd = oldEnd.clone().add(movedBy);
    this.setEndTime(newEnd);
    this.lastStartTime = newStart;
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

  public dateChanged(): void {
    if (this.params.mode != 'copy') {
      const date = (this.formData.controls['spentOn'].value as moment.Moment).toDate();
      this.isLoadingLastTimeEntry = true;
      void this
        .timeEntryService.getLastTimeEntryOfTheDay(date)
        .then((entry: DtoTimeEntry) => {
          const start = entry ? this.stringToMoment(entry.end) : this.stringToMoment("09:00");
          const end = moment.duration(start).add(1, 'h');
          this.setStartTime(start);
          this.setEndTime(end);
        })
        .finally(() => {
          this.isLoadingLastTimeEntry = false;
        });
    }
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
  /**
   * part of the initialization:: build the list of workpackagetypes that allow time registration
   */
  private setAllowedWorkpackageTypes(): void {
    const typesAsString = new Array<string>(
      WorkPackageTypeMap.Absence,
      WorkPackageTypeMap.Application,
      WorkPackageTypeMap.BlogPost,
      WorkPackageTypeMap.Bug,
      WorkPackageTypeMap.Company,
      WorkPackageTypeMap.Task,
      WorkPackageTypeMap.UserStory,
      WorkPackageTypeMap.WebPage
    );

    void this.workPackageService
      .loadWorkPackageTypes()
      .then((allTypes: Array<DtoWorkPackageType>) =>
        this.allowedWorkpackageTypes = allTypes
          .filter((type: DtoWorkPackageType) => typesAsString.includes(type.name))
          .map((type: DtoWorkPackageType) => type.id)
      );

  }

  /**
   * part of the initialization: display the existing time-entry or set defaults for a new one
   */
  private setInitialValues(): void {

    if (this.params.mode != 'create') {
      const activity = this.formData.controls['activity'];
      const billed = this.formData.controls['billed'];

      if (this.params.timeEntry.allowedActivities.find((activity: DtoTimeEntryActivity) => activity.id == this.params.timeEntry.payload.activity.id)) {
        activity.patchValue(this.params.timeEntry.payload.activity.id);
      } else if (this.params.timeEntry.allowedActivities.length == 1) {
        activity.patchValue(this.params.timeEntry.allowedActivities[0].id);
        activity.markAsDirty();
      } else {
        activity.patchValue(-1);
      }
      this.formData.controls['comment'].patchValue(this.params.timeEntry.payload.comment.raw);
      this.formData.controls['wpInput'].patchValue(this.params.timeEntry.payload.workPackage);
      this.formData.controls['spentOn'].patchValue(moment(this.params.timeEntry.payload.spentOn));
      this.setStartTime(this.params.timeEntry.payload.start);
      this.setEndTime(this.params.timeEntry.payload.end);
      this.treeFormControl.patchValue(this.params.timeEntry.payload.project.id);
      if (this.params.timeEntry.payload.workPackage.billable || this.params.timeEntry.payload.project.pricing == 'Fixed Price') {
        billed.enable();
        billed.patchValue(this.params.timeEntry.payload.billed);
      } else {
        billed.disable();
      }
    } else {
      this.formData.controls['spentOn'].patchValue(moment().startOf('date'));
      this.dateChanged();
    }
  }

  /**
   * part of the initialization: build the array of entries for the start time select. Interval is 15 minutes.
   * All entries are enabled
   *
   * @returns {Array<TimeSelection>} the results
   */
  private getStartTimes(): Array<TimeSelection> {
    const result = new Array<TimeSelection>();
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 4; minute++) {
        const minutes = minute * 15;
        result.push({
          moment: moment.duration({ hours: hour, minutes: minutes }),
          label: hour.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0'),
          disabled: false,
          customFieldValue: hour.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
        });
      }
    }
    return result;
  }

  /**
   * build the array of entries for the end time select. Interval is 15 minutes.
   * Only entries after the start time are enabled
   *
   * @param start {moment.Duration} the start time
   * @returns {Array<TimeSelection>} the results
   */
  private getEndTimes(start: moment.Duration): Array<TimeSelection> {
    const times = new Array<string>();

    for (let hour = 0; hour < 24; hour++) {
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

  /**
   * Load workpackages for displaying in the option list
   * @param {string} inputValue - the value entered by the user
   * @returns {Observable<Array<DtoWorkPackage>>} the list of wp's returned by the server
   */
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
            'values': [inputValue]
          }
        }
      );

      if (this.treeFormControl.value != null && this.treeFormControl.value.value != undefined) {
        filters.push({
          'project': {
            'operator': '=',
            'values': [this.treeFormControl.value]
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
      console.log(JSON.stringify(filters));
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
    this.setStartTime(endTimeValue.customFieldValue);
    this.setEndTime(end);
  }

  /**
   * Sets the value of the end time select.
   *
   * @param {moment.Duration | string} end - the end time to set
   */
  private setEndTime(end: moment.Duration | string): void {
    const toSet = typeof end === 'string' ?
      this.stringToMoment(end) :
      end;
    this.formData.controls['endTime'].patchValue(
      this.endTimes.find(f => f.moment.asMilliseconds() === toSet.asMilliseconds())
    );
  }

  /**
   * Sets the start time of the start time select and the value of lastStartTime
   *
   * @param {moment.Duration | string} end - the start time to set
   */
  private setStartTime(start: moment.Duration | string): void {
    const toSet = typeof start === 'string' ?
      this.stringToMoment(start) :
      start;
    this.formData.controls['startTime'].patchValue(
      this.startTimes.find(f => f.moment.asMilliseconds() === toSet.asMilliseconds())
    );
    this.endTimes = this.getEndTimes(toSet);
    this.lastStartTime = toSet;
  }
  //#endregion
}

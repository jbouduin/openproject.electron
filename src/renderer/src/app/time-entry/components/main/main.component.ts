import { Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';

import { DtoBaseFilter, DtoTimeEntry, DtoTimeEntryList, DtoProject, DtoTimeEntryForm, DtoSchema, DtoSchemaAttribute } from '@common';
import { LogService, ProjectService, TimeEntryService } from '@core';

import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { EditDialogParams } from '../edit-dialog/edit-dialog.params';
import { SelectionData } from '../selection/selection-data';
import { ConfirmationDialogService } from '@shared';
import { ExportService } from 'src/app/export/export.service';
import { DateRangeSelection } from '../selection/date-range-selection';
import * as moment from 'moment';
import { TimeEntry } from '../list/time-entry';

@Component({
  selector: 'time-entry-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  //#region @ViewChild
  @ViewChild(MatPaginator) paginator: MatPaginator;
  //#endregion

  //#region Private properties
  private confirmationDialogService: ConfirmationDialogService;
  private exportService: ExportService;
  private lastSelectionData: SelectionData;
  private logService: LogService;
  private matDialog: MatDialog;
  private projectService: ProjectService;
  private selection: Array<number>;
  private timeEntryService: TimeEntryService;
  //#endregion

  //#region Public properties
  public timeEntryList: DtoTimeEntryList;
  public projects: Array<DtoProject>;
  //#endregion

  //#region Public getter methods
  public get exportEnabled(): boolean {
    return this.timeEntryList ?
      this.timeEntryList.items.length > 0 :
      false;
  }
  //#endregion

  //#region Constructor & C°
  public constructor(
    matDialog: MatDialog,
    exportService: ExportService,
    projectService: ProjectService,
    timeEntryService: TimeEntryService,
    logService: LogService,
    confirmationDialogService: ConfirmationDialogService) {

    this.matDialog = matDialog;
    this.exportService = exportService;
    this.projectService = projectService;
    this.timeEntryService = timeEntryService;
    this.logService = logService;
    this.confirmationDialogService = confirmationDialogService;

    this.lastSelectionData = new SelectionData(
      DateRangeSelection.today,
      moment().startOf('date'),
      moment().startOf('date'),
      new Array<number>());
    this.timeEntryList = {
      total: 0,
      count: 0,
      pageSize: 100,
      offset: 1,
      items: new Array<DtoTimeEntry>()
    };
    this.projects = new Array<DtoProject>();
    this.selection = new Array<number>();
  }
  //#endregion

  //#region Angular interface methods
  public ngOnInit(): void {
    this.projectService
      .getProjects()
      .then(projects => this.projects = Array.from(projects.values()));
  }
  //#endregion

  //#region UI triggered methods
  public async createEntry(): Promise<void> {
    const timeEntryForm = await this.timeEntryService.getCreateTimeEntryForm();
    const data: EditDialogParams = {
      mode: 'create',
      timeEntry: timeEntryForm,
      projects: this.projects,
      save: this.save.bind(this),
      validate: this.validate.bind(this)
    };

    this.matDialog.open(
      EditDialogComponent,
      {
        height: '520px',
        width: '630px',
        maxWidth: '100vw',
        maxHeight: '100vh',
        data
      });
  }

  public async copyEntry(id: number): Promise<void>{

    const timeEntryForm = await this.timeEntryService.getCreateTimeEntryForm();
    const sourceEntryForm = await this.timeEntryService.getUpdateTimeEntryForm(id);
    const source = this.timeEntryList.items.find((e: DtoTimeEntry) => e.id == id);
    timeEntryForm.payload.activity = source.activity;
    timeEntryForm.allowedActivities = sourceEntryForm.allowedActivities;
    timeEntryForm.payload.billed = source.billed;
    timeEntryForm.payload.comment = source.comment;
    timeEntryForm.payload.end = source.end;
    timeEntryForm.payload.hours = source.hours;
    timeEntryForm.payload.project = source.project;
    timeEntryForm.payload.spentOn = source.spentOn;
    timeEntryForm.payload.start = source.start;
    timeEntryForm.payload.workPackage = source.workPackage;

    const data: EditDialogParams = {
      mode: 'copy',
      timeEntry: timeEntryForm,
      projects: this.projects,
      save: this.save.bind(this),
      validate: this.validate.bind(this)
    };

    this.matDialog.open(
      EditDialogComponent,
      {
        height: '520px',
        width: '630px',
        maxWidth: '100vw',
        maxHeight: '100vh',
        data
      });
  }

  public deleteEntry(id: number): void {
    this.confirmationDialogService.showQuestionDialog(
      [
        'You are about to delete this time entry.',
        ' Are you sure you want to continue?'
      ],
      async () => {
        await this.timeEntryService.deleteTimeEntry(id);
        const idx = this.timeEntryList.items.findIndex(entry => entry.id === id);
        if (idx >= 0) {
          const newList = this.cloneTimeEntryList(this.timeEntryList);
          newList.items.splice(idx, 1);
          newList.total--;
          this.timeEntryList = newList;
        }
      }
    );
  }

  public async editEntry(id: number): Promise<void> {
    const timeEntryForm = await this.timeEntryService.getUpdateTimeEntryForm(id);
    const data: EditDialogParams = {
      mode: 'edit',
      timeEntry: timeEntryForm,
      projects: this.projects,
      save: this.save.bind(this),
      validate: this.validate.bind(this)
    };
    this.matDialog.open(
      EditDialogComponent,
      {
        height: '520px',
        width: '630px',
        maxWidth: '100vw',
        maxHeight: '100vh',
        data
      }
    );
  }

  public async export(): Promise<void> {
    const schema: DtoSchema = { attributes: new Array<DtoSchemaAttribute>() };
    const selection = this.selection.length > 0 ?
      this.selection.map(selected => this.timeEntryList.items.find(entry => entry.id === selected)) :
      this.timeEntryList.items;
    let approvalName: string = undefined;
    let approvalLocation: string = undefined;
    if (this.lastSelectionData.projects?.length === 1) {
      const project = this.projects.find(p => p.id === this.lastSelectionData.projects[0]);
      if (project) {
        approvalName = project.timesheetApprovalName;
        approvalLocation = project.timesheetApprovalLocation;
      }
    }
    this.exportService.exportTimeSheets(
      schema,
      this.lastSelectionData.toExportTitle(),
      selection,
      approvalName,
      approvalLocation);
  }

  public load(selectionData: SelectionData): void {
    this.lastSelectionData = selectionData;
    this.executeLoad();
  }

  public page(pageEvent: PageEvent): void {
    if (pageEvent.pageIndex !== pageEvent.previousPageIndex) {
      this.executeLoad();
    }
  }

  public selectionChanged(selection: Array<number>) {
    this.selection = selection;
  }
  //#endregion

  //#region Private methods
  private executeLoad(): void {
    const filter: DtoBaseFilter = {
      filters: this.lastSelectionData.toQueryFilterString(),
      offset: this.paginator.pageIndex + 1,
      pageSize: this.paginator.pageSize,
      sortBy: this.lastSelectionData.toSortByString()
    };

    this.timeEntryService.loadTimeEntries(filter).then(response => {
      this.timeEntryList = response;
    });
  }

  private cloneTimeEntryList(list: DtoTimeEntryList) {
    const result: DtoTimeEntryList = {
      total: list.total,
      count: list.count,
      pageSize: list.pageSize,
      offset: list.offset,
      items: list.items
    }
    return result;
  }

  private async save(timeEntryForm: DtoTimeEntryForm): Promise<void> {
    const saved = await this.timeEntryService.saveTimeEntry(timeEntryForm);
    const idx = this.timeEntryList.items.findIndex(entry => entry.id === saved.id);
    const newList = this.cloneTimeEntryList(this.timeEntryList);

    if (idx >= 0) {
      newList.items[idx] = saved;
    } else {
      newList.items.unshift(saved);
      newList.total++;
      newList.count++;
    }

    this.timeEntryList = newList;
  }

  private async validate(timeEntryForm: DtoTimeEntryForm): Promise<DtoTimeEntryForm> {
    return this.timeEntryService.validateTimeEntry(timeEntryForm);
  }
  //#endregion
}

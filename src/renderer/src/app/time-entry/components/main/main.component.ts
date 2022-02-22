import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { DtoBaseFilter, DtoTimeEntry, DtoTimeEntryList, DtoProject, DtoTimeEntryForm } from '@common';
import { LogService, ProjectService, TimeEntryService } from '@core';

import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { EditDialogParams } from '../edit-dialog/edit-dialog.params';
import { SelectionData } from '../selection/selection-data';
import { ConfirmationDialogService } from '@shared';
import { ExportService } from 'src/app/export/export.service';
import { DateRangeSelection } from '../selection/date-range-selection';
import * as moment from 'moment';

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
      pageSize: 25,
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
  public async create(): Promise<void> {
    const timeEntryForm = await this.timeEntryService.getCreateTimeEntryForm();
    const data: EditDialogParams = {
      isCreate: true,
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

  public delete(id: number): void {
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

  public async edit(id: number): Promise<void> {
    const timeEntryForm = await this.timeEntryService.getUpdateTimeEntryForm(id);
    const data: EditDialogParams = {
      isCreate: false,
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
    const schema = await this.timeEntryService.getTimeEntrySchema();
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

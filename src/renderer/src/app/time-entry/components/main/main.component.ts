import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { DtoBaseFilter, DtoTimeEntry, DtoTimeEntryList, DtoProject, DtoTimeEntryForm } from '@ipc';
import { LogService, ProjectService, TimeEntryService } from '@core';

import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { EditDialogParams } from '../edit-dialog/edit-dialog.params';
import { SelectionData } from '../selection/selection-data';
import { ConfirmationDialogService } from '@shared';
import { ExportService } from 'src/app/export/export.service';

@Component({
  selector: 'time-entry-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  // <editor-fold desc='@ViewChild'>
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // </editor-fold>

  // <editor-fold desc='Private properties'>
  private confirmationDialogService: ConfirmationDialogService;
  private exportService: ExportService;
  private lastSelectionData: SelectionData;
  private logService: LogService;
  private matDialog: MatDialog;
  private projectService: ProjectService;
  private selection: Array<number>;
  private timeEntryService: TimeEntryService;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public timeEntryList: DtoTimeEntryList;
  public projects: Array<DtoProject>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
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

    this.lastSelectionData = new SelectionData('', '');
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
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void {
    this.projectService.projects().then(projects => this.projects = projects);
  }
  // </editor-fold>

  // <editor-fold desc='UI triggered methods'>
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
        height: '650px',
        width: '610px',
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
        height: '400px',
        width: '600px',
        data
      }
    );
  }

  public async export(): Promise<void> {
    const schema = await this.timeEntryService.getTimeEntrySchema();
    const selection = this.selection.length > 0 ?
      this.selection.map(selected => this.timeEntryList.items.find(entry => entry.id === selected)) :
      this.timeEntryList.items;
    this.exportService.exportTimeSheets(schema, selection);
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
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private executeLoad(): void {
    const filter: DtoBaseFilter = {
      filters: this.lastSelectionData.filters,
      offset: this.paginator.pageIndex + 1,
      pageSize: this.paginator.pageSize,
      sortBy: this.lastSelectionData.sortBy
    };

    this.timeEntryService.loadTimeEntries(filter).then(response => {
      this.logService.verbose('total', response.total);
      this.logService.verbose('count', response.count);
      this.logService.verbose('pageSize', response.pageSize);
      this.logService.verbose('offset', response.offset);
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
  // </editor-fold>
}

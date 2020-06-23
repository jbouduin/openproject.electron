import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { DtoBaseFilter, DtoTimeEntry, DtoTimeEntryList, DtoProject } from '@ipc';
import { CacheService, LogService } from '@core';

import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { EditDialogParams } from '../edit-dialog/edit-dialog.params';
import { SelectionData } from '../selection/selection-data';
import { ConfirmationDialogService } from '@shared';

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
  private lastSelectionData: SelectionData;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public timeEntryList: DtoTimeEntryList;
  public projects: Array<DtoProject>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    private matDialog: MatDialog,
    private cacheService: CacheService,
    private logService: LogService,
    private confirmationDialogService: ConfirmationDialogService) {

    this.lastSelectionData = new SelectionData('', '');
    this.timeEntryList = {
      total: 0,
      count: 0,
      pageSize: 25,
      offset: 1,
      items: new Array<DtoTimeEntry>()
    };
    this.projects = new Array<DtoProject>();
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void {
    this.cacheService.projects().then(projects => this.projects = projects);
  }
  // </editor-fold>

  // <editor-fold desc='UI triggered methods'>
  public create(): void {
    const data: EditDialogParams = {
      timeEntry: undefined,
      projects: this.projects
    };
    const dialogRef = this.matDialog.open(
      EditDialogComponent,
      {
        height: '650px',
        width: '610px',
        maxWidth: '100vw',
        maxHeight: '100vh',
        data
      });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`); // Pizza!
    });
  }

  public delete(id: number): void {
    this.confirmationDialogService.showQuestionDialog(
      [
        'You are about to delete this time entry.',
        ' Are you sure you want to continue?'
      ],
      () => {
        id = 125000;
        alert(`delete ${id} x`);
        this.cacheService.deleteTimeEntry(id);
      }
    );
  }

  public edit(id: number): void {
    const toEdit = this.timeEntryList.items.filter(entry => entry.id === id);
    if (toEdit.length > 0) {
      const data: EditDialogParams = {
        timeEntry: toEdit[0],
        projects: this.projects
      };
      const dialogRef = this.matDialog.open(
        EditDialogComponent,
        {
          height: '400px',
          width: '600px',
          data
        });
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`); // Pizza!
      });
    }
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
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private executeLoad(): void {
    const filter: DtoBaseFilter = {
      filters: this.lastSelectionData.filters,
      offset: this.paginator.pageIndex + 1,
      pageSize: this.paginator.pageSize,
      sortBy: this.lastSelectionData.sortBy
    };

    this.cacheService.loadTimeEntries(filter).then(response => {
      this.logService.verbose('total', response.total);
      this.logService.verbose('count', response.count);
      this.logService.verbose('pageSize', response.pageSize);
      this.logService.verbose('offset', response.offset);
      this.timeEntryList = response;
    });
  }
  // </editor-fold>
}

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DtoSchema, DtoTimeEntry, DataVerb, DtoTimeEntryExportRequest } from '@ipc';
import { SetupDialogParams } from './components/setup-dialog/setup-dialog.params';
import { SetupDialogComponent } from './components/setup-dialog/setup-dialog.component';
import { IpcService, DataRequestFactory } from '@core';
import { ConfirmationDialogService } from '@shared';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  private matDialog: MatDialog;
  private ipcService: IpcService;
  private dataRequestFactory: DataRequestFactory;
  private confirmationDialogService: ConfirmationDialogService;

  constructor(
    matDialog: MatDialog,
    ipcService: IpcService,
    confirmationDialogService: ConfirmationDialogService,
    dataRequestFactory: DataRequestFactory) {
    this.matDialog = matDialog;
    this.ipcService = ipcService;
    this.dataRequestFactory = dataRequestFactory;
    this.confirmationDialogService = confirmationDialogService;
  }

  public exportTimeSheets(schema: DtoSchema,
    title: Array<string>,
    entries: Array<DtoTimeEntry>,
    approvalName?: string,
    approvalLocation?: string): void {

    const params = new SetupDialogParams(
      'Export timesheets',
      schema,
      title,
      entries,
      this.exportTimeSheetsCallBack.bind(this));
    params.approvalName = approvalName;
    params.approvalLocation = approvalLocation;
    this.matDialog.open(SetupDialogComponent, {
      height: 'auto',
      width: '600px',
      data: params
    });
  }

  public async exportTimeSheetsCallBack(data: DtoTimeEntryExportRequest): Promise<void> {
    const request = this.dataRequestFactory.createDataRequest<DtoTimeEntryExportRequest>(DataVerb.POST, '/export/time-entries', data);
    await this.ipcService.dataRequest<DtoTimeEntryExportRequest, any>(request);
    this.confirmationDialogService.showQuestionDialog(
      'Do you want to mark the exported time entries as billed?',
      this.markAsBilled.bind(this, data.data)
    )
  }

  private async markAsBilled(timeEntries: Array<DtoTimeEntry>): Promise<void> {
    alert(timeEntries.length);
  }
}

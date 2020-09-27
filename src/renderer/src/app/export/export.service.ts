import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DtoSchema, DtoTimeEntry, DataVerb, DtoTimeEntryExportRequest } from '@ipc';
import { SetupDialogParams } from './components/setup-dialog/setup-dialog.params';
import { SetupDialogComponent } from './components/setup-dialog/setup-dialog.component';
import { IpcService, DataRequestFactory } from '@core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  private matDialog: MatDialog;
  private ipcService: IpcService;
  private dataRequestFactory: DataRequestFactory;

  constructor(
    matDialog: MatDialog,
    ipcService: IpcService,
    dataRequestFactory: DataRequestFactory) {
    this.matDialog = matDialog;
    this.ipcService = ipcService;
    this.dataRequestFactory = dataRequestFactory;
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
      width: '400px',
      data: params
    });
  }

  public async exportTimeSheetsCallBack(data: DtoTimeEntryExportRequest): Promise<void> {
    const request = this.dataRequestFactory.createDataRequest<DtoTimeEntryExportRequest>(DataVerb.POST, '/export/time-entries', data);
    await this.ipcService.dataRequest<DtoTimeEntryExportRequest, any>(request);
  }
}

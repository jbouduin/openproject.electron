import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DtoSchema, DtoTimeEntry, DtoExportRequest, DataVerb } from '@ipc';
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

  public exportTimeSheets(schema: DtoSchema, entries: Array<DtoTimeEntry>): void {
    const params = new SetupDialogParams(
      'Export timesheets',
      schema,
      entries,
      this.exportTimeSheetsCallBack.bind(this));
    this.matDialog.open(SetupDialogComponent, {
      height: 'auto',
      width: '400px',
      data: params
    });
  }

  public async exportTimeSheetsCallBack(data: DtoExportRequest): Promise<void> {
    const request = this.dataRequestFactory.createDataRequest<DtoExportRequest>(DataVerb.POST, '/export/time-entries', data);
    await this.ipcService.dataRequest<DtoExportRequest, any>(request);
  }
}

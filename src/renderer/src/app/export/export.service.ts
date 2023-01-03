import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { DtoSchema, DtoTimeEntry, DataVerb, DtoTimeEntryExportRequest, DtoDataRequest } from '@common';
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
    const data = timeEntries
      .filter((entry: DtoTimeEntry) => !entry.billed && (entry.workPackage.billable || entry.project.pricing === 'Fixed Price'))
      .map((entry: DtoTimeEntry) => entry.id);
    if (data.length === 0) {
      this.confirmationDialogService.showInfoMessageDialog('No time entries found to mark as billed');
    } else {
      const request = this.dataRequestFactory.createDataRequest<Array<number>>(DataVerb.POST, '/time-entries/set-billed', data);
      void this.ipcService.dataRequest<Array<number>, any>(request);
    }
  }
}

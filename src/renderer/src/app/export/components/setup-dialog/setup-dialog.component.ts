import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SetupDialogParams } from './setup-dialog.params';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { IpcService, DataRequestFactory } from '@core';
import { DataVerb, DtoExportRequest, TimeEntryLayoutLines, TimeEntryLayoutSubtotal } from '@ipc';
import { MatSelectChange } from '@angular/material/select';

interface LayoutOption {
  label: string,
  value: TimeEntryLayoutLines
}

interface SubtotalOption {
  label: string,
  value: TimeEntryLayoutSubtotal,
  disabled: boolean,
}

@Component({
  selector: 'app-setup-dialog',
  templateUrl: './setup-dialog.component.html',
  styleUrls: ['./setup-dialog.component.scss']
})
export class SetupDialogComponent implements OnInit {

  // <editor-fold desc='Private properties'>
  private dialogRef: MatDialogRef<SetupDialogComponent>;
  private ipcService: IpcService;
  private dataRequestFactory: DataRequestFactory;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public formGroup: FormGroup;
  public params: SetupDialogParams;
  public layoutLinesOptions: Array<LayoutOption>;
  public subtotalOptions: Array<SubtotalOption>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  constructor(
    formBuilder: FormBuilder,
    dialogRef: MatDialogRef<SetupDialogComponent>,
    ipcService: IpcService,
    dataRequestFactory: DataRequestFactory,
    @Inject(MAT_DIALOG_DATA) params: SetupDialogParams) {
    this.dialogRef = dialogRef;
    this.ipcService = ipcService;
    this.dataRequestFactory = dataRequestFactory;
    this.params = params;
    this.layoutLinesOptions = [
      { label: 'One line per entry', value: TimeEntryLayoutLines.perEntry },
      { label: 'One line per WP and day', value: TimeEntryLayoutLines.perWorkPackageAndDate }
    ];
    this.subtotalOptions = [
      { label: 'No subtotals', value: TimeEntryLayoutSubtotal.none, disabled: false },
      { label: 'By workpackage', value: TimeEntryLayoutSubtotal.workPackage, disabled: false },
      { label: 'By date', value: TimeEntryLayoutSubtotal.date, disabled: false },
      { label: 'By date and Workpackage', value: TimeEntryLayoutSubtotal.perWorkPackageAndDate, disabled: false },
    ];
    this.enableDisableSubtotals(TimeEntryLayoutLines.perWorkPackageAndDate);
    this.formGroup = formBuilder.group({
      fileName: new FormControl('', [Validators.required]),
      openFile: new FormControl(true),
      title0: new FormControl(params.title[0], [Validators.required]),
      title1: new FormControl(params.title[1]),
      title2: new FormControl(params.title[2]),
      layout: new FormControl(TimeEntryLayoutLines.perWorkPackageAndDate, [Validators.required]),
      subtotal: new FormControl(TimeEntryLayoutSubtotal.workPackage)
    });
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  ngOnInit(): void { }
  // </editor-fold>

  // <editor-fold desc='UI Triggered methods'>
  public cancel(): void {
    this.dialogRef.close();
  }

  public export(): void {
    const exportRequest: DtoExportRequest = {
      fileName: this.formGroup.controls['fileName'].value,
      data: this.params.data,
      openFile: this.formGroup.controls['openFile'].value,
      title: [
        this.formGroup.controls['title0'].value,
        this.formGroup.controls['title1'].value,
        this.formGroup.controls['title2'].value
      ]
    }
    this.params.callBack(exportRequest);
    this.dialogRef.close();
  }

  public layoutLinesChanged(selection: MatSelectChange): void {
    this.enableDisableSubtotals(selection.value);
  }

  public async saveAs(): Promise<void> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/save-as/export');
    const response = await this.ipcService.untypedDataRequest(request);
    this.formGroup.controls['fileName'].patchValue(response.data);
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private enableDisableSubtotals(lines: TimeEntryLayoutLines): void {
    const byDateAndWPOption = this.subtotalOptions.find(option => option.value === TimeEntryLayoutSubtotal.perWorkPackageAndDate);
    byDateAndWPOption.disabled = lines === TimeEntryLayoutLines.perWorkPackageAndDate
  }
  // </editor-fold>
}

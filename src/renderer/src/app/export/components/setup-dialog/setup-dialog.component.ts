import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SetupDialogParams } from './setup-dialog.params';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { TimeEntryLayoutLines, TimeEntryLayoutSubtotal, DtoTimeEntryExportRequest, DtoTimeEntry } from '@common';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { PdfCommonSelection } from '@shared';

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

  //#region Private properties ------------------------------------------------
  private dialogRef: MatDialogRef<SetupDialogComponent>;
  //#endregion

  //#region Public properties -------------------------------------------------
  public formGroup: FormGroup;
  public params: SetupDialogParams;
  public layoutLinesOptions: Array<LayoutOption>;
  public subtotalOptions: Array<SubtotalOption>;
  public showCommentAndActivity: boolean;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(
    formBuilder: FormBuilder,
    dialogRef: MatDialogRef<SetupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) params: SetupDialogParams) {
    this.dialogRef = dialogRef;

    this.params = params;
    this.layoutLinesOptions = [
      { label: 'One line per entry', value: TimeEntryLayoutLines.perEntry },
      { label: 'One line per WP and day', value: TimeEntryLayoutLines.perWorkPackageAndDate }
    ];
    this.subtotalOptions = [
      { label: 'No subtotals', value: TimeEntryLayoutSubtotal.none, disabled: false },
      { label: 'By workpackage', value: TimeEntryLayoutSubtotal.workpackage, disabled: false },
      { label: 'By date', value: TimeEntryLayoutSubtotal.date, disabled: false },
      { label: 'By date and workpackage', value: TimeEntryLayoutSubtotal.dateAndWorkpackage, disabled: false },
      { label: 'By workpackage and date', value: TimeEntryLayoutSubtotal.workpackageAndDate, disabled: false },
    ];
    this.enableDisableSubtotals(TimeEntryLayoutLines.perWorkPackageAndDate);
    this.formGroup = formBuilder.group({
      pdfCommon: new Array<undefined>(),
      billableOnly: new FormControl(true),
      title0: new FormControl(params.title[0], [Validators.required]),
      title1: new FormControl(params.title[1]),
      title2: new FormControl(params.title[2]),
      approvalName: new FormControl(params.approvalName),
      approvalLocation: new FormControl(params.approvalLocation),
      includeSignatureTable: new FormControl(true),
      layout: new FormControl(TimeEntryLayoutLines.perWorkPackageAndDate, [Validators.required]),
      subtotal: new FormControl(TimeEntryLayoutSubtotal.workpackage),
      showComments: new FormControl(false),
      showActivities: new FormControl(false)
    });
  }

  ngOnInit(): void {
    this.formGroup.controls['pdfCommon']
      .patchValue(PdfCommonSelection.ResetPdfCommonSelection());
  }
  //#endregion

  //#region UI Triggered methods ----------------------------------------------
  public cancel(): void {
    this.dialogRef.close();
  }

  public export(): void {
    const toExport = this.formGroup.controls['billableOnly'].value ?
      (this.params.data as Array<DtoTimeEntry>)
        .filter(entry => entry.workPackage.billable || entry.workPackage.project.pricing == 'Fixed Price') :
      this.params.data;

    const exportRequest: DtoTimeEntryExportRequest = {
      pdfCommonSelection: this.formGroup.controls['pdfCommon'].value,
      data: toExport,
      title: [
        this.formGroup.controls['title0'].value,
        this.formGroup.controls['title1'].value,
        this.formGroup.controls['title2'].value
      ],
      approvalName: this.formGroup.controls['approvalName'].value,
      approvalLocation: this.formGroup.controls['approvalLocation'].value,
      includeSignatureTable: this.formGroup.controls['includeSignatureTable'].value,
      layoutLines: this.formGroup.controls['layout'].value,
      subtotal: this.formGroup.controls['subtotal'].value,
      showComments: this.formGroup.controls['showComments'].value,
      showActivities: this.formGroup.controls['showActivities'].value
    }
    this.params.callBack(exportRequest);
    this.dialogRef.close();
  }

  public layoutLinesChanged(selection: MatSelectChange): void {
    this.enableDisableSubtotals(selection.value);
  }

  public includeSignatureTableChanged(event: MatSlideToggleChange): void {
    if (event.checked) {
      this.formGroup.controls['approvalName'].enable();
      this.formGroup.controls['approvalLocation'].enable();
    } else {
      this.formGroup.controls['approvalName'].disable();
      this.formGroup.controls['approvalLocation'].disable();
    }
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
  private enableDisableSubtotals(lines: TimeEntryLayoutLines): void {
    const byDateAndWPOption = this.subtotalOptions.find(option => option.value === TimeEntryLayoutSubtotal.workpackageAndDate);
    const byWPAndDateOption = this.subtotalOptions.find(option => option.value === TimeEntryLayoutSubtotal.dateAndWorkpackage);
    byDateAndWPOption.disabled = lines === TimeEntryLayoutLines.perWorkPackageAndDate;
    byWPAndDateOption.disabled = lines === TimeEntryLayoutLines.perWorkPackageAndDate;
    this.showCommentAndActivity = lines === TimeEntryLayoutLines.perEntry;
  }
  //#endregion
}

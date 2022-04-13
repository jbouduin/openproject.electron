import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { WorkPackageService } from '@core';
import { EditDialogComponent } from 'src/app/time-entry/components/edit-dialog/edit-dialog.component';

@Component({
  selector: 'app-invoice-dialog',
  templateUrl: './invoice-dialog.component.html',
  styleUrls: ['./invoice-dialog.component.scss']
})
export class InvoiceDialogComponent implements OnInit {

  //#region Private properties ------------------------------------------------
  private dialogRef: MatDialogRef<EditDialogComponent>;
  private workPackageService: WorkPackageService;
  //#endregion ----------------------------------------------------------------

  //#region public properties -------------------------------------------------
  public formData: FormGroup;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    formBuilder: FormBuilder,
    workPackageService: WorkPackageService,
    dialogRef: MatDialogRef<EditDialogComponent>) {
    this.dialogRef = dialogRef;
    this.workPackageService = workPackageService;
    this.formData = formBuilder.group({});
  }

  ngOnInit(): void {
  }
  //#endregion

  //#region UI Triggered methods ----------------------------------------------
  public cancel(): void {
    this.dialogRef.close();
  }

  public save(): void {
    // save and
    this.dialogRef.close();
  }
  //#endregion
}

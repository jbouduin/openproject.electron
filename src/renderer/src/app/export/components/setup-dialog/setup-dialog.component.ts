import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SetupDialogParams } from './setup-dialog.params';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { IpcService, DataRequestFactory } from '@core';
import { DataVerb } from '@ipc';

@Component({
  selector: 'app-setup-dialog',
  templateUrl: './setup-dialog.component.html',
  styleUrls: ['./setup-dialog.component.scss']
})
export class SetupDialogComponent implements OnInit {

  private dialogRef: MatDialogRef<SetupDialogComponent>;
  private ipcService: IpcService;
  private dataRequestFactory: DataRequestFactory;

  public formGroup: FormGroup;
  public params: SetupDialogParams;

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
    this.formGroup = formBuilder.group({
      fileName: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  export(): void {
    this.params.callBack(this.params.data);
    this.dialogRef.close();
  }

  public async saveAs(): Promise<void> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/save-as');
    const response = await this.ipcService.untypedDataRequest(request);
    this.formGroup.controls['fileName'].patchValue(response.data);
  }
}

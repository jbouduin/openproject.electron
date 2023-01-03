import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogParams } from './confirmation-dialog.params';
import { ConfirmationDialogButton } from './confirmation-dialog.button';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {

  // <editor-fold desc='Constructor & C°'>
  constructor(
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public params: ConfirmationDialogParams) { }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  ngOnInit(): void {
  }
  // </editor-fold>

  // <editor-fold desc='UI triggered methods'>
  public click(button: ConfirmationDialogButton): void {
    if (button.callback) {
      button.callback();
    }
    this.dialogRef.close();
  }
  // </editor-fold>
}

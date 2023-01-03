import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { ConfirmationDialogParams } from './confirmation-dialog.params';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  // <editor-fold desc='Private properties'>
  private dialog: MatDialog
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(dialog: MatDialog) {
    this.dialog = dialog;
  }
  // </editor-fold>

  // <editor-fold desc='public methods'>
  public showErrorMessageDialog(text: string | Array<string>): MatDialogRef<ConfirmationDialogComponent> {
    const params = new ConfirmationDialogParams('Error', Array.isArray(text) ? text : [ text ]);
    params.addButton('OK', undefined);
    return this.dialog.open(ConfirmationDialogComponent, {
      height: 'auto',
      width: '400px',
      data: params
    });
  }

  public showInfoMessageDialog(text: string | Array<string>): MatDialogRef<ConfirmationDialogComponent> {
    const params = new ConfirmationDialogParams('Info', Array.isArray(text) ? text : [ text ]);
    params.addButton('OK', undefined);
    return this.dialog.open(ConfirmationDialogComponent, {
      height: 'auto',
      width: '400px',
      data: params
    });
  }

  public showQuestionDialog(text: string | Array<string>, yesCallback: () => void): MatDialogRef<ConfirmationDialogComponent> {
    const params = new ConfirmationDialogParams('Question', Array.isArray(text) ? text : [ text ]);
    params.addButton('Yes', yesCallback);
    params.addButton('No', undefined);
    return this.dialog.open(ConfirmationDialogComponent, {
      height: 'auto',
      width: '400px',
      data: params
    });
  }

  public showConfirmationDialog(header: string, text: string | Array<string>, okCallback: () => void): MatDialogRef<ConfirmationDialogComponent> {
    const params = new ConfirmationDialogParams(header,  Array.isArray(text) ? text : [ text ]);
    params.addButton('OK', okCallback);
    params.addButton('Cancel', undefined);
    return this.dialog.open(ConfirmationDialogComponent, {
      height: 'auto',
      width: '400px',
      data: params
    });
  }
  // </editor-fold>

}

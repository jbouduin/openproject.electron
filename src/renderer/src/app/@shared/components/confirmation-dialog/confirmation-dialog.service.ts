import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
  public showInfoMessageDialog(text: string | Array<string>) {
    const params = new ConfirmationDialogParams('Info', Array.isArray(text) ? text : [ text ]);
    params.addButton('OK', undefined);
    this.dialog.open(ConfirmationDialogComponent, {
      height: '400px',
      width: '400px',
      data: params
    });
  }

  public showQuestionDialog(text: string | Array<string>, yesCallback: () => void) {
    const params = new ConfirmationDialogParams('Question', Array.isArray(text) ? text : [ text ]);
    params.addButton('Yes', yesCallback);
    params.addButton('No', undefined);
    this.dialog.open(ConfirmationDialogComponent, {
      height: '400px',
      width: '400px',
      data: params
    });
  }

  public showConfirmationDialog(header: string, text: string | Array<string>, okCallback: () => void) {
    const params = new ConfirmationDialogParams(header,  Array.isArray(text) ? text : [ text ]);
    params.addButton('OK', okCallback);
    params.addButton('Cancel', undefined);
    this.dialog.open(ConfirmationDialogComponent, {
      height: '400px',
      width: '400px',
      data: params
    });
  }
  // </editor-fold>

}

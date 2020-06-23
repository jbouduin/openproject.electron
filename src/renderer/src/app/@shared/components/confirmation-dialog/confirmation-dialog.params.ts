import { ConfirmationDialogButton } from './confirmation-dialog.button';

export class ConfirmationDialogParams {
  public header: string;
  public text: Array<string>;
  public buttons: Array<ConfirmationDialogButton>;

  public constructor(header: string, text: Array<string>) {
    this.header = header;
    this.text = text;
    this.buttons = new Array<ConfirmationDialogButton>();
  }

  public addButton(label: string, callback: () => void) {
    this.buttons.push(new ConfirmationDialogButton(label, callback));
  }
}

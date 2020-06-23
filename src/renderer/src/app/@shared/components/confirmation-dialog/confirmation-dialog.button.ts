export class ConfirmationDialogButton {
  // <editor-fold desc='Public properties'>
  public label: string;
  public callback?: () => void;
  // </editor-fold>

  // <editor-fold desc='Constructor'>
  public constructor(label: string, callback: () => void) {
    this.label = label;
    this.callback = callback;
  }
  // </editor-fold>
}

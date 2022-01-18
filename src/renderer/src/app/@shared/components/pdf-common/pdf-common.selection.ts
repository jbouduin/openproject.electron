import { DtoPdfCommonSelection } from "@ipc";

export class PdfCommonSelection implements DtoPdfCommonSelection {

  public readonly fileName: string;
  public readonly openFile: boolean;

  public constructor(fileName: string, openFile: boolean) {
    this.fileName = fileName;
    this.openFile = openFile;
  }

  public static ResetPdfCommonSelection(): DtoPdfCommonSelection {
    return new PdfCommonSelection('', true);
  }
}

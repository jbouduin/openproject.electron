import { DtoPdfCommonSelection } from "@ipc";

export class PdfCommonSelection implements DtoPdfCommonSelection {

  public readonly fileName: string;
  public readonly openFile: boolean;
  public readonly dumpJson: boolean;

  public constructor(fileName: string, openFile: boolean, dumpJson: boolean) {
    this.fileName = fileName;
    this.openFile = openFile;
    this.dumpJson = dumpJson;
  }

  public static ResetPdfCommonSelection(): DtoPdfCommonSelection {
    return new PdfCommonSelection('', true, false);
  }
}

import { PdfUnit } from "./pdf-unit";

export interface IPdfSize {
  readonly width: PdfUnit;
  readonly height: PdfUnit;
}

export class PdfSize implements IPdfSize {
  public width: PdfUnit;
  public height: PdfUnit;

  public constructor(width: string, height: string) {
    this.width = new PdfUnit(width);
    this.height = new PdfUnit(height);
  }
}

import { rgb } from "pdf-lib";
import { PdfUnit, IPdfUnit } from "./size/pdf-unit";

export class PdfStatics {
  public static readonly pdfPointInMillimeters = 0.352777778;
  public static readonly defaultColor = rgb(0.25, 0.25, 0.25);
  public static readonly defaultTextHeight = 12;
  public static readonly defaultLineHeight = 1.15;

  public static isNumber(n: any): boolean {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  }

  public static get defaultTableCellMargin(): IPdfUnit {
    return new PdfUnit('5 pt'); // ca. 1,76 mm
  }

  public static get defaultTableBorderThickness(): IPdfUnit {
    return new PdfUnit('1 pt'); // 0,352777778 mm
  }

  public static get noBorder(): IPdfUnit {
    return new PdfUnit('0');
  }
}

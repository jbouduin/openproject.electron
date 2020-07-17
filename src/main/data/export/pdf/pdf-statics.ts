import { rgb } from "pdf-lib";
import { PdfUnit, IPdfUnit } from "./pdf-unit";

export class PdfStatics {
  public static readonly pdfPointInMillimeters = 0.352777778;
  public static readonly defaultColor = rgb(0.25, 0.25, 0.25);
  public static readonly defaultTextHeight = 12;
  public static readonly defaultLineHeight = 1.15;
  public static readonly defaultTableMargin = 5; // ca. 1,76 mm

  public static isNumber(n: any): boolean {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  }

  public static get defaultTableBorderThickness(): IPdfUnit {
    return new PdfUnit('1 pt'); // 0,352777778 mm
  }
}

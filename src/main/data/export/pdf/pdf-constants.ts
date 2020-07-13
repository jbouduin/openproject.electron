import { rgb } from "pdf-lib";

export class PdfConstants {
  public static readonly pdfPointInMillimeters = 0.352777778;
  public static readonly defaultColor = rgb(0.25, 0.25, 0.25);
  public static readonly defaultTextHeight = 12;
  public static readonly defaultLineHeight = 1.15;
  public static readonly defaultTableMargin = 5; // ca. 1,76 mm
  public static readonly defaultTableBorderThickness = 1; // 0,352777778 mm

  public static isNumber(n: any): boolean {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  }
}

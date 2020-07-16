import { PdfStatics } from "./pdf-statics";

export class PdfUnit {

  private _millimeter: number;
  private _pdfPoints: number;

  public get millimeter(): number {
    return this._millimeter;
  }

  public get pfdPoints(): number {
    return this._pdfPoints;
  }

  public constructor(value: string) {
    const ptIdx = value.indexOf('pt');
    if (ptIdx > 0) {
      this._pdfPoints = parseFloat(value.substr(0, ptIdx));
      this._millimeter = this._pdfPoints * PdfStatics.pdfPointInMillimeters;
    } else if (ptIdx === 0) {
      this._pdfPoints = 0;
      this._millimeter = 0;
    } else {
      const mmIdx = value.indexOf('mm');
      if (mmIdx > 0) {
        this._millimeter = parseFloat(value.substr(0, mmIdx));
        this._pdfPoints = this._millimeter / PdfStatics.pdfPointInMillimeters;
      } else if (mmIdx === 0) {
        this._pdfPoints = 0;
        this._millimeter = 0;
      } else {
        this._millimeter = parseFloat(value);
        this._pdfPoints = this._millimeter / PdfStatics.pdfPointInMillimeters;
      }
    }
  }
}

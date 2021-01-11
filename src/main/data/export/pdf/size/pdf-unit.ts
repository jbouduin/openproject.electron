import { PdfStatics } from "../../pdf-statics";

export interface IPdfUnit {
  readonly millimeter: number;
  readonly pfdPoints: number;

  /**
   * returns a new PdfUnit. The original PdfUnits remain untouched
   */
  add(pdfUnit: IPdfUnit): IPdfUnit;

  clone(): IPdfUnit;
  /**
   * returns a new PdfUnit. The original PdfUnits remain untouched
   */
  subtract(pdfUnit: IPdfUnit): IPdfUnit;
}

export class PdfUnit implements IPdfUnit {

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

  public add(pdfUnit: IPdfUnit): IPdfUnit {
    const result = new PdfUnit('0');
    result._pdfPoints = this.pfdPoints + pdfUnit.pfdPoints;
    result._millimeter = this._pdfPoints + pdfUnit.millimeter;
    return result;
  }

  public clone(): IPdfUnit {
    const result = new PdfUnit('0');
    result._pdfPoints = this.pfdPoints;
    result._millimeter = this._pdfPoints;
    return result;
  }
  public subtract(pdfUnit: IPdfUnit): IPdfUnit {
    const result = new PdfUnit('0');
    result._pdfPoints = this.pfdPoints - pdfUnit.pfdPoints;
    result._millimeter = this._pdfPoints - pdfUnit.millimeter;
    return result;
  }
}

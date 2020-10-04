import { PageSizes, rgb, RGB, StandardFonts } from "pdf-lib";
import { IFourSides, FourSides } from "../size/four-sides";
import { IPdfSize, PdfSize } from "../size/pdf-size";
import { IPdfUnit, PdfUnit } from "../size/pdf-unit";

export interface IDocumentOptions {
  defaultColor: RGB;
  defaultLineHeight: number;
  defaultTextHeight: number;
  defaultFontKey: string;
  /**
   * @description: the margins of the page in PdfUnits
   * @type {IFourSides}
   */
  margin: IFourSides<IPdfUnit>;
  pageSize: IPdfSize;
  // #1184 orientaton: 'portrait' | 'landscape'
  title: string;
}

export class DocumentOptions implements IDocumentOptions {

  // <editor-fold desc='Public properties'>
  public defaultColor: RGB;
  public defaultFontKey: string;
  public defaultLineHeight: number;
  public defaultTextHeight: number;
  // </editor-fold>

  // <editor-fold desc='IDocumentOptions interface members'>
  public margin: IFourSides<IPdfUnit>;
  public pageSize: IPdfSize;
  public title: string;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.defaultColor = rgb(0.25, 0.25, 0.25);
    this.defaultFontKey = StandardFonts.TimesRoman;
    this.defaultLineHeight = 1.15;
    this.defaultTextHeight = 12;
    this.margin = new FourSides<IPdfUnit>(new PdfUnit('10 mm'), new PdfUnit('15 mm'));
    this.pageSize = new PdfSize(`${PageSizes.A4[0]} pt`, `${PageSizes.A4[1]} pt`);
  }
  // </editor-fold>
}

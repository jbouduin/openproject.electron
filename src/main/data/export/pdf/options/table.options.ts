import { RGB } from "pdf-lib";
import { IFourSides, FourSides } from "../size/four-sides";
import { IPdfUnit, PdfUnit } from "../size/pdf-unit";
import { ITextOptions, TextOptions } from "./text.options";
import { IDocumentOptions } from "./document.options";

export interface ITableOptions extends ITextOptions {
  borderColor: RGB;
  borderThickness: IFourSides<IPdfUnit>;
  cellMargin: IFourSides<IPdfUnit>;
}

export class TableOptions extends TextOptions {

  // <editor-fold desc='Private readonly properties'>
  private readonly defaultCellMargin: IFourSides<IPdfUnit>;
  private readonly defaultBorderThickness: FourSides<IPdfUnit>;
  // </editor-fold>

  // <editor-fold desc='Private properties for get/set'>
  private _borderColor: RGB | undefined;
  private _borderThickness: IFourSides<IPdfUnit> | undefined;
  private _cellMargin: IFourSides<IPdfUnit> | undefined;
  // </editor-fold>

  // <editor-fold desc='ITableOptions interface members'>
  protected get noBorder(): IPdfUnit {
    return new PdfUnit('0');
  }

  public get borderColor(): RGB {
    return this._borderColor || this.color;
  }

  public set borderColor(value: RGB) {
    this._borderColor = value;
  }

  public get borderThickness(): IFourSides<IPdfUnit> {
    return this._borderThickness || this.defaultBorderThickness;
  }

  public set borderThickness(value: IFourSides<IPdfUnit>) {
    this._borderThickness = value;
  }

  public get cellMargin(): IFourSides<IPdfUnit> {
    return this._cellMargin || this.defaultCellMargin;
  }

  public set cellMargin(value : IFourSides<IPdfUnit>) {
    this._cellMargin = value;
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(documentOptions: IDocumentOptions) {
    super(documentOptions);
    this.defaultCellMargin = new FourSides<IPdfUnit>(new PdfUnit('5 pt')); // ca. 1,76 mm
    this.defaultBorderThickness = new FourSides<IPdfUnit>(new PdfUnit('1 pt'));
  }
  // </editor-fold>
}

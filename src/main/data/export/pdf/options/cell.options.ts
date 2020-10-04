import { RGB } from "pdf-lib";
import { IFourSides } from "../size/four-sides";
import { IPdfUnit } from "../size/pdf-unit";
import { ITableOptions } from "./table.options";
import { FontStyle } from "./font-style";
import { IColumnOptions, IRowOptions } from "./row-column.options";

export interface ICellOptions extends IColumnOptions, IRowOptions { }

export class CellOptions implements ICellOptions {

  // <editor-fold desc='Private properties for get/set'>
  private _align: 'left' | 'right' | 'center' | undefined;
  private _borderColor: RGB | undefined;
  private _borderThickness: IFourSides<IPdfUnit> | undefined;
  private _cellMargin: IFourSides<IPdfUnit> | undefined;
  private _color: RGB | undefined;
  private _fontKey: string | undefined;
  private _lineHeight: number | undefined;
  private _maxWidth: IPdfUnit | undefined;
  private _style: FontStyle | undefined;
  private _textHeight: number | undefined;
  // wordBreaks: Array<string> | undefined;
  private _x: IPdfUnit | undefined;
  private _y: IPdfUnit | undefined;
  // </editor-fold>

  // <editor-fold desc='Private properties'>
  private rowOptions: IRowOptions;
  private columnOptions: IColumnOptions;
  private tableOptions: ITableOptions;
  // </editor-fold>

  // <editor-fold desc='ICellOptions members'>
  public get align(): 'left' | 'right' | 'center' {
    return this._align || this.rowOptions.align || this.columnOptions.align || this.tableOptions.align;
  }

  public set align(value: 'left' | 'right' | 'center') {
    this._align = value
  }
  public get borderColor(): RGB {
    return this._borderColor || this.rowOptions.borderColor || this.columnOptions.borderColor || this.tableOptions.borderColor;
  }

  public set borderColor(value: RGB) {
    this._borderColor = value;
  }

  public get borderThickness(): IFourSides<IPdfUnit> {
    return this._borderThickness || this.rowOptions.borderThickness || this.columnOptions.borderThickness || this.tableOptions.borderThickness;
  }

  public set borderThickness(value: IFourSides<IPdfUnit>) {
    this._borderThickness = value;
  }

  public get cellMargin(): IFourSides<IPdfUnit> {
    return this._cellMargin || this.rowOptions.cellMargin || this.columnOptions.cellMargin || this.tableOptions.cellMargin;
  }

  public set cellMargin(value : IFourSides<IPdfUnit>) {
    this._cellMargin = value;
  }


  public get color(): RGB {
    return this._color || this.rowOptions.color || this.columnOptions.color || this.tableOptions.color;
  }

  public set color(value: RGB) {
    this._color = value;
  }

  public get fontKey(): string {
    return this._fontKey || this.rowOptions.fontKey || this.columnOptions.fontKey || this.tableOptions.fontKey;
  }

  public set fontKey(value: string) {
    this._fontKey = value;
  }

  public get lineHeight(): number {
    return this._lineHeight || this.rowOptions.lineHeight || this.columnOptions.lineHeight || this.tableOptions.lineHeight;
  }

  public set lineHeight(value: number) {
    this._lineHeight = value;
  }

  public get maxWidth(): IPdfUnit {
    return this._maxWidth || this.columnOptions.maxWidth || this.tableOptions.maxWidth;
  }

  public set maxWidth(value: IPdfUnit) {
    this._maxWidth = value;
  }

  public get style(): FontStyle {
    return this._style || this.rowOptions.style || this.columnOptions.style || this.tableOptions.style;
  }

  public set style(value: FontStyle) {
    this._style = value;
  }

  public get textHeight(): number {
    return this._textHeight || this.rowOptions.textHeight || this.columnOptions.textHeight || this.tableOptions.textHeight;
  }

  public set textHeight(value: number) {
    this._textHeight = value;
  }

  public get x(): IPdfUnit {
    return this._x || this.columnOptions.x;
  }

  public set x(value: IPdfUnit) {
    this._x = value;
  }

  public get y(): IPdfUnit {
    return this._y || this.rowOptions.y;
  }

  public set y(value: IPdfUnit) {
    this._y = value;
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(rowOptions: IRowOptions, columnOptions: IColumnOptions, tableOptions: ITableOptions) {
    this.rowOptions = rowOptions;
    this.columnOptions = columnOptions;
    this.tableOptions = tableOptions;
  }
  // </editor-fold>

}

import { RGB } from "pdf-lib";
import { IFourSides } from "../size/four-sides";
import { IPdfUnit } from "../size/pdf-unit";
import { FontStyle } from "./font-style";

export interface IRowColumnOptions {
  align: 'left' | 'right' | 'center' | undefined;
  borderColor: RGB | undefined;
  borderThickness: IFourSides<IPdfUnit> | undefined;
  cellMargin: IFourSides<IPdfUnit> | undefined;
  color: RGB | undefined;
  fontKey: string | undefined;
  lineHeight: number | undefined;
  style: FontStyle | undefined;
  textHeight: number | undefined;
  // wordBreaks: Array<string> | undefined;
}

export interface IRowOptions extends IRowColumnOptions {
  y: IPdfUnit  | undefined;
}

export interface IColumnOptions extends IRowColumnOptions {
  maxWidth: IPdfUnit | undefined;
  x: IPdfUnit | undefined;
}

export class RowColumnOptions implements IRowOptions, IColumnOptions {

  // <editor-fold desc='Public properties'>
  public align: 'left' | 'right' | 'center' | undefined;
  public borderColor: RGB | undefined;
  public borderThickness: IFourSides<IPdfUnit> | undefined;
  public cellMargin: IFourSides<IPdfUnit> | undefined;
  public color: RGB | undefined;
  public fontKey: string | undefined;
  public lineHeight: number | undefined;
  public maxWidth: IPdfUnit | undefined;
  public style: FontStyle | undefined;
  public textHeight: number | undefined;
  // wordBreaks: Array<string> | undefined;
  public x: IPdfUnit | undefined;
  public y: IPdfUnit  | undefined;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() { }
  // </editor-fold>
}

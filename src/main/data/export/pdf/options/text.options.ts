import { RGB } from "pdf-lib";
import { IPdfUnit } from "../size/pdf-unit";
import { IDocumentOptions } from "./document.options";
import { FontStyle } from "./font-style";

export interface ITextOptions {
  align: 'left' | 'right' | 'center';
  color: RGB;
  fontKey: string;
  lineHeight: number;
  maxWidth: IPdfUnit;
  style: FontStyle;
  textHeight: number;
  x: IPdfUnit;
  // wordBreaks?: Array<string>;
  y?: IPdfUnit;
}

export class TextOptions implements ITextOptions {

  // <editor-fold desc='Private properties for get/set'>
  private _color: RGB | undefined;
  private _fontKey: string | undefined;
  private _documentOptions: IDocumentOptions;
  private _lineHeight: number | undefined;
  private _maxWidth: IPdfUnit | undefined;
  private _textHeight: number | undefined;
  private _x?: IPdfUnit | undefined;
  // </editor-fold>


  // <editor-fold desc='ITextOptions interface members'>
  public align: 'left' | 'right' | 'center';
  public style: FontStyle;
  // public wordBreaks?: Array<string>
  public y?: IPdfUnit;
  // </editor-fold>

  // <editor-fold desc='ITextOptions interface members get/set'>
  public get color(): RGB {
    return this._color || this._documentOptions.defaultColor;
  }

  public set color(value: RGB) {
    this._color = value;
  }

  public get fontKey(): string {
    return this._fontKey || this._documentOptions.defaultFontKey;
  }

  public set fontKey(value: string) {
    this._fontKey = value;
  }

  public get lineHeight(): number {
    return this._lineHeight || this._documentOptions.defaultLineHeight;
  }

  public set lineHeight(value: number) {
    this._lineHeight = value;
  }

  public get maxWidth(): IPdfUnit {
    return this._maxWidth ||
      this._documentOptions.pageSize.width
      .subtract(this._documentOptions.margin.left)
      .subtract(this._documentOptions.margin.right);
  }

  public set maxWidth(value: IPdfUnit) {
    this._maxWidth = value;
  }

  public get textHeight(): number {
    return this._textHeight || this._documentOptions.defaultTextHeight;
  }

  public set textHeight(value: number) {
    this._textHeight = value;
  }

  public get x(): IPdfUnit {
    return this._x || this._documentOptions.margin.left;
  }

  public set x(value: IPdfUnit) {
    this._x = value;
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(documentOptions: IDocumentOptions) {
    this._documentOptions = documentOptions;
    this.align = 'left';
    this.style = FontStyle.normal;
  }
  // </editor-fold>
}

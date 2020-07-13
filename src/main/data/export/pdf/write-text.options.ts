import { Color } from "pdf-lib";
import { FontStyle } from "./font-style";

export interface IWriteTextOptions {
  align?: 'left' | 'right' | 'center';
  color?: Color;
  fontKey?: string;
  lineHeight?: number;
  maxWidth?: number;
  style?: FontStyle;
  textHeight?: number;
  wordBreaks?: Array<string>;
  x?: number;
  y?: number;
}

export class WriteTextOptions implements IWriteTextOptions {

  // <editor-fold desc='Public properties'>
  public align?: 'left' | 'right' | 'center';
  public color?: Color;
  public fontKey?: string;
  public lineHeight?: number;
  public maxWidth?: number;
  public style?: FontStyle;
  public textHeight?: number;
  public wordBreaks?: Array<string>
  public x?: number;
  public y?: number;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() { }
  // </editor-fold>
}

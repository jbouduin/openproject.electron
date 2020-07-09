import { Color } from "pdf-lib";
import { FontStyle } from "./font-style";

export interface IWriteTextOptions {
  align?: 'left' | 'right' | 'center';
  style?: FontStyle;
  color?: Color;
  fontKey?: string;
  lineHeight?: number;
  size?: number;
  maxWidth?: number;
  wordBreaks: string[];
}

export class WriteTextOptions implements IWriteTextOptions {

  // <editor-fold desc='Public properties'>
  public align?: 'left' | 'right' | 'center';
  public style?: FontStyle;
  public color?: Color;
  public fontKey?: string;
  public size?: number;
  public lineHeight?: number;
  public maxWidth?: number;
  public wordBreaks: string[];
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.wordBreaks = [' '];
  }
  // </editor-fold>
}

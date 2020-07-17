import { IWriteTextOptions, WriteTextOptions } from "./write-text.options";
import { IFourSides, FourSides } from "./four-sides";
import { Color } from "pdf-lib";
import { PdfStatics } from "./pdf-statics";
import { IPdfUnit } from "./pdf-unit";

export interface ITableOptions extends IWriteTextOptions {
  borderThickness: IFourSides<IPdfUnit>;
  borderColor?: Color;
  margin: IFourSides<number>;
  clone(): ITableOptions;
}

export class TableOptions extends WriteTextOptions {
  public borderThickness: IFourSides<IPdfUnit>;
  public borderColor?: Color;
  public margin: IFourSides<number>;

  public constructor() {
    super();
    this.borderThickness = new FourSides<IPdfUnit>(PdfStatics.defaultTableBorderThickness);
    this.margin = new FourSides<number>(PdfStatics.defaultTableMargin);
  }

  public clone(): ITableOptions {
    const result = new TableOptions();
    result.align = this.align;
    result.style = this.style;
    result.color = this.color ? Object.assign({}, this.color) : undefined;
    result.fontKey = this.fontKey;
    result.textHeight = this.textHeight;
    result.lineHeight = this.lineHeight;
    result.maxWidth = this.maxWidth ? this.maxWidth.clone() : undefined;
    result.wordBreaks = Object.assign([], this.wordBreaks);
    result.borderColor = this.borderColor ? Object.assign({}, this.borderColor) : undefined;
    result.margin = this.margin.transform(x => x);
    result.borderThickness = this.borderThickness.transform(x => x);
    result.x = this.x ? this.x.clone() : undefined;
    result.y = this.y ? this.y.clone() : undefined;
    return result;
  }
}

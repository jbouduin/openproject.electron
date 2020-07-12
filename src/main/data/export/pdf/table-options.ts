import { IWriteTextOptions, WriteTextOptions } from "./write-text-options";
import { IFourSides, FourSides } from "./four-sides";
import { Color } from "pdf-lib";
import { PdfConstants } from "./pdf-constants";

export interface ITableOptions extends IWriteTextOptions {
  borderThickness: IFourSides<number>;
  // TODO borderColor: IFourSides<color>
  borderColor?: Color;
  margin: IFourSides<number>;
  clone(): ITableOptions;
}

export class TableOptions extends WriteTextOptions {
  public borderThickness: IFourSides<number>;
  public borderColor?: Color;
  public margin: IFourSides<number>;

  public constructor() {
    super();
    this.borderThickness = new FourSides<number>(PdfConstants.defaultTableBorderThickness);
    this.margin = new FourSides<number>(PdfConstants.defaultTableMargin);
  }

  public clone(): ITableOptions {
    const result = new TableOptions();
    result.align = this.align;
    result.style = this.style;
    result.color = Object.assign({}, this.color);
    result.fontKey = this.fontKey;
    result.size = this.size;
    result.lineHeight = this.lineHeight;
    result.maxWidth = this.maxWidth;
    result.wordBreaks = Object.assign([], this.wordBreaks);
    result.borderColor = Object.assign({}, this.borderColor);
    result.margin = this.margin.transform(x => x);
    result.borderThickness = this.borderThickness.transform(x => x);
    return result;
  }
}

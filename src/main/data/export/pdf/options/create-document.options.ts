import { PdfHeaderFooter } from "../content/pdf-header-footer";
import { IFourSides } from "../size/four-sides";
import { IPdfUnit } from "../size/pdf-unit";
import { IPdfSize } from "../size/pdf-size";

export interface CreateDocumentOptions {

  /**
   * Header
   */
  headerBlock?: PdfHeaderFooter;

  /**
   * Footer
   */
  footerBlock?: PdfHeaderFooter;

  /**
   * @description: the margins of the page in PdfUnits
   * @type {IFourSides}
   */
  margin: IFourSides<IPdfUnit>;
  pageSize: IPdfSize;
  // #1184 orientaton: 'portrait' | 'landscape'
  title: string;
}

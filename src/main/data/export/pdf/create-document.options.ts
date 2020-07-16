import { IFourSides } from "./four-sides";
import { PdfHeaderFooter } from "./pdf-header-footer";
import { IPdfUnit } from "./pdf-unit";
import { IPdfSize } from "./pdf-size";

export interface CreateDocumentOptions {

  /**
   * Full path to a header Image
   */
  headerImage?: string;
  headerBlock?: PdfHeaderFooter;

  /**
   * Full path to a footer image
   */
  footerImage?: string;
  footerBlock?: PdfHeaderFooter;

  /**
   * @description: the margins of the page in millimeters
   * @type {IFourSides}
   */
  margin: IFourSides<IPdfUnit>;
  pageSize: IPdfSize;
  // #1184 orientaton: 'portrait' | 'landscape'
  title: string;
}

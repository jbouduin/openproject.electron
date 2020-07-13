import { IFourSides } from "./four-sides";

export interface CreateDocumentOptions {

  /**
   * Full path to a header Image
   */
  headerImage?: string;
  // #1183 headertext

  /**
   * Full path to a footer image
   */
  footerImage?: string;
  // #1183 footertext

  /**
   * @description: the margins of the page in millimeters
   * @type {IFourSides}
   */
  margin: IFourSides<number>;
  pageSize: [number, number];
  // #1184 orientaton: 'portrait' | 'landscape'
  title: string;
}

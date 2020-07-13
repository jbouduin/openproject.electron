import { FourSides } from "./four-sides";

export interface CreateDocumentOptions {
  headerImage?: string;
  // #1183 headertext
  footerImage?: string;
  // #1183 footertext
  margin: FourSides<number>;
  pageSize: [number, number];
  // #1184 orientaton: 'portrait' | 'landscape'
  title: string;
}

import { FourSides } from "./four-sides";

export interface CreateParams {
  headerImage?: string;
  footerImage?: string;
  margin: FourSides<number>;
  pageSize: [number, number];
  // TODO orientaton: 'portrait' | 'landscape'
  title: string;
}

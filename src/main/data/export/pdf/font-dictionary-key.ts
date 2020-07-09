import { FontStyle } from "./font-style";

export class FontDictionaryKey {
  public name: string;
  public style: FontStyle;

  public constructor(name: string, style: FontStyle) {
    this.name = name;
    this.style = style;
  }

  public toString(): string {
    return this.name + ' ' + this.style;
  }
}

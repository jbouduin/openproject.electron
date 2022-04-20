import { DtoFormattableText, FormattableTextFormat } from "@common";

export class FormattableModel implements DtoFormattableText {

  //#region Public properties -------------------------------------------------
  format: FormattableTextFormat;
  raw: string;
  html: string;
  //#endregion
}

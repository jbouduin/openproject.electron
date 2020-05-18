import { FormattableTextFormat } from './formattable-text-format';

export interface DtoFormattableText {
  format: FormattableTextFormat;
  raw: string;
  html: string;
}

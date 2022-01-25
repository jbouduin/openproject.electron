import { HalProperty, HalResource } from '@jbouduin/hal-rest-client';

export class FormattableModel extends HalResource {

  // <editor-fold desc='Public properties'>
  @HalProperty()
  format: 'markdown' | 'plain' | 'custom';

  @HalProperty()
  raw: string;

  @HalProperty()
  html: string;
  // </editor-fold>
}

import { HalProperty, HalResource } from '@jbouduin/hal-rest-client';

export abstract class EntityModel extends HalResource {

  // <editor-fold desc='Public properties'>
  @HalProperty()
  public id: number;

  @HalProperty()
  public createdAt: Date;

  @HalProperty()
  public updatedAt: Date;
  // </editor-fold>
}

import { HalProperty, HalResource } from '@jbouduin/hal-rest-client';

export abstract class EntityModel extends HalResource {

  //#region Public properties -------------------------------------------------
  @HalProperty()
  public id: number;

  @HalProperty()
  public createdAt: Date;

  @HalProperty()
  public updatedAt: Date;

  @HalProperty()
  public lockVersion: number
  //#endregion
}

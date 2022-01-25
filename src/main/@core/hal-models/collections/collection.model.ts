import { HalProperty, HalResource } from '@jbouduin/hal-rest-client';
import { EntityModel } from '../entities/entity.model';

export abstract class CollectionModel<Ent extends EntityModel> extends HalResource {

  // <editor-fold desc='Public properties'>
  @HalProperty()
  public total: number;

  @HalProperty()
  public count: number;

  @HalProperty()
  public pageSize: number;

  @HalProperty()
  public offset: number;
  // </editor-fold>

  // <editor-fold desc='Abstract public properties'>
  // elements is abstract, as I can not find a way to define the @HalProperty() generically
  public abstract elements: Array<Ent>;
  // </editor-fold>

}

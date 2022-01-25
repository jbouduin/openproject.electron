import { HalProperty, HalResource } from '@jbouduin/hal-rest-client';
import { QueryGroupModel } from './query-group.model';

export class GroupByQueryResultModel extends HalResource {
  @HalProperty()
  public total: number;

  @HalProperty()
  public count: number;

  @HalProperty({ resourceType: QueryGroupModel })
  public groups: Array<QueryGroupModel>
}

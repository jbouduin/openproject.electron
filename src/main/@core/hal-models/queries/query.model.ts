import { HalProperty, HalResource } from "hal-rest-client";
import { GroupByQueryResultModel } from "./group-by-query-result.model";

export class QueryModel extends HalResource {
  @HalProperty()
  public name: string;
  @HalProperty(GroupByQueryResultModel)
  public results: GroupByQueryResultModel;
}
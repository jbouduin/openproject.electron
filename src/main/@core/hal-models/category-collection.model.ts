import { HalProperty } from "hal-rest-client";
import { CollectionModel } from "./collection.model";
import { CategoryEntityModel } from "./category-entity.model";

export class CategoryCollectionModel extends CollectionModel<CategoryEntityModel> {
  // <editor-fold desc='Public abstract properties implementation'>
  @HalProperty(CategoryEntityModel)
  public elements: Array<CategoryEntityModel>;
  // </editor-fold>
}

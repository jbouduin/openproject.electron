import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoBase, DtoBaseList } from '@ipc';
import { CollectionModel, EntityModel } from '@core/hal-models';
import { IBaseEntityAdapter } from './base-entity.adapter';
import { ILogService } from '@core';
import { LogSource } from '@common';

export interface IBaseCollectionAdapter<Ent extends EntityModel, DtoList, DtoEntity>  {
  createDtoList(): DtoList;
  resourceToDto(entityAdapter: IBaseEntityAdapter<Ent, DtoEntity>, collection: CollectionModel<Ent>): Promise<DtoList>;
}

@injectable()
export abstract class BaseCollectionAdapter<Ent extends EntityModel, DtoList extends DtoBaseList<DtoEntity>, DtoEntity extends DtoBase>
  implements IBaseCollectionAdapter<Ent, DtoList, DtoEntity> {

  //#region Abstract methods --------------------------------------------------
  public abstract createDtoList(): DtoList;
  //#endregion

  //#region protected properties ----------------------------------------------
  protected logService: ILogService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(logService: ILogService) {
    this.logService = logService;
  }
  //#endregion

  //#region IBaseAdapter interface methods ------------------------------------
  public async resourceToDto(entityAdapter: IBaseEntityAdapter<Ent, DtoEntity>, collection: CollectionModel<Ent>): Promise<DtoList> {
    const result = this.createDtoList();
    result.count = collection.count;
    result.offset = collection.offset;
    result.pageSize = collection.pageSize;
    result.total = collection.total;
    if (collection.elements) {
      try {
        result.items = await Promise.all(collection.elements.map( (item: Ent) => entityAdapter.resourceToDto(item)));
      } catch (error) {
        this.logService.error(LogSource.Main, 'Error processing the items', error);
      }
    }
    return result;
  }
  //#endregion
}

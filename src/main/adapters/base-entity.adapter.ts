import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoBase, DtoFormattableText, FormattableTextFormat } from '@ipc';
import { EntityModel, FormattableModel } from '@core/hal-models';
import { ILogService } from '@core';

export interface IBaseEntityAdapter<Ent, Dto> {
  createDto(): Dto;
  resourceToDto(entityModel: Ent): Promise<Dto>;
}

@injectable()
export abstract class BaseEntityAdapter<Ent extends EntityModel, Dto extends DtoBase> implements IBaseEntityAdapter<Ent, Dto> {

  //#region protected properties ----------------------------------------------
  protected logService: ILogService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(logService: ILogService) {
    this.logService = logService;
  }
  //#endregion

  //#region Protected methods -------------------------------------------------
  protected resourceToFormattable(formattable: FormattableModel): DtoFormattableText {
    // TODO check if openproject indeeds returns a string
    const result: DtoFormattableText = {
      format: FormattableTextFormat[formattable.format],
      html: formattable.html,
      raw: formattable.raw
    };
    return result;
  }
  //#endregion

  //#region Abstract methods --------------------------------------------------
  public abstract createDto(): Dto;
  //#endregion

  //#region IBaseAdapter interface methods ------------------------------------
  public resourceToDto(entityModel: EntityModel): Promise<Dto> {
    return Promise.resolve(this.resourceToDtoSync(entityModel));
  }
  //#endregion

  //#region protected methods -------------------------------------------------
  protected resourceToDtoSync(entityModel: EntityModel): Dto {
    const result = this.createDto();
    result.id = entityModel.id;
    result.createdAt = entityModel.createdAt;
    result.updatedAt = entityModel.updatedAt;
    result.href = entityModel.uri?.href;
    return result;
  }
  //#endregion
}

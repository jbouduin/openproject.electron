import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoBase, DtoFormattableText, FormattableTextFormat, FormattableTextFormatKeyStrings } from '@ipc';
import { EntityModel, FormattableModel } from '@core/hal-models';

export interface IBaseEntityAdapter<Ent, Dto> {
  createDto(): Dto;
  resourceToDto(entityModel: Ent): Promise<Dto>;
}

@injectable()
export abstract class BaseEntityAdapter<Ent extends EntityModel, Dto extends DtoBase> implements IBaseEntityAdapter<Ent, Dto> {

  //#region Constructor & C° --------------------------------------------------
  constructor() { }
  //#endregion

  //#region Protected methods -------------------------------------------------
  protected resourceToFormattable(formattable: FormattableModel): DtoFormattableText {
    const result: DtoFormattableText = {
      format: FormattableTextFormat[<FormattableTextFormatKeyStrings>formattable.format],
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
    result.href = entityModel.uri?.uri;
    return result;
  }
  //#endregion
}

import { injectable } from 'inversify';
import 'reflect-metadata';
import { DtoBaseFilter, DtoUntypedDataResponse, DataStatus, DataStatusKeyStrings, LogSource } from '@ipc';
import { ILogService, IOpenprojectService } from '@core';
import { CollectionModel, EntityModel } from '@core/hal-models';
import { IHalResource, IUriData } from '@jbouduin/hal-rest-client';
import { IHalResourceConstructor } from '@jbouduin/hal-rest-client';
import { BaseService } from './base.service';

@injectable()
export abstract class BaseDataService extends BaseService{

  //#region  <editorProtected properties --------------------------------------
  protected openprojectService: IOpenprojectService;
  //#endregion

  //#region Abstract getters --------------------------------------------------
  protected abstract get entityRoot(): string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(logService: ILogService, openprojectService: IOpenprojectService) {
    super(logService);
    this.openprojectService = openprojectService;
  }
  //#endregion

  //#region Protected helper methods ------------------------------------------
  protected buildUriWithFilter(baseUri: string, filter: DtoBaseFilter): string {
    if (filter) {
      const query = new Array<string>();
      query.push(`offset=${filter.offset}`);
      query.push(`pageSize=${filter.pageSize}`);
      if (filter.sortBy) {
        query.push(`sortBy=${encodeURIComponent(filter.sortBy)}`);
      }
      if (filter.groupby) {
        query.push(`group_by=${encodeURIComponent(filter.groupby)}`);
      }
      if (filter.filters) {
        query.push(`filters=${encodeURIComponent(filter.filters)}`);
      }
      if (query.length > 0) {
        baseUri += `?${query.join('&')}`;
      }
    }
    return baseUri;
  }

  protected async preFetchLinks<M extends EntityModel, L extends IHalResource>(
      elements: Array<M>,
      linkFn: (m: M) => L): Promise<void> {
    // make sure that all resources are fetched at least once
    await Promise.all(elements
      .map(element => linkFn(element))
      // filter out the unloaded resources
      .filter((element: L) => element && element.uri?.href && !element.isLoaded)
      // filter out all duplicate uri's
      .filter((element: L, i: number, arr: Array<L>) => arr.findIndex((t: L) => t.uri.href === element.uri.href) === i)
      .map((link: L) => {
        this.logService.verbose(LogSource.Main, 'prefetch', link.uri.href);
        return link.fetch({ force: true});
      })
    );
  }

  protected processServiceError(error: any): DtoUntypedDataResponse {
    let status: DataStatus;
    let message: string;

    console.log(`Exception: ${error.name}: ${error.message}`);
    console.log(error);
    if (error.response?.status) {
      status = DataStatus[<DataStatusKeyStrings>error.response.status];
      if (status === undefined) {
        status = DataStatus.Error;
      }
      message = error.response.statusText;
      this.logService.error(
        LogSource.Main,
        {
          status: error.response.status,
          statusText: error.response.status,
          method: error.response.config.method,
          url: error.response.config.url,
          configData: error.response.config.data,
          data: error.response.data
        }
      );
    } else {
      status = DataStatus.Error;
      message = `${error.name}: ${error.message}`;
      this.logService.error(LogSource.Main, error);
    }

    const errorResponse: DtoUntypedDataResponse = { status, message }
    return errorResponse;
  }

  protected async deepLink<T extends CollectionModel<any>>(type: IHalResourceConstructor<T>, uri?: IUriData): Promise<T> {
    let deeplink = this.openprojectService.createResource(type, uri.href, false);
    if (deeplink.count > 0) {
      this.logService.debug(LogSource.Main, `using cache for ${uri.href}`);
      return Promise.resolve(deeplink);
    } else {
      this.logService.debug(LogSource.Main, `fetching ${uri.href}`);
      return deeplink.fetch({ force: true});
    }
  }
  // </editor-fold>
}

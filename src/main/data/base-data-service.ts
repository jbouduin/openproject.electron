import { injectable } from 'inversify';
import 'reflect-metadata';
import { DtoBaseFilter, DtoUntypedDataResponse, DataStatus, DataStatusKeyStrings, LogSource } from '@ipc';
import { ILogService, IOpenprojectService } from '@core';
import { CollectionModel, EntityModel } from '@core/hal-models';
import { IHalResource, URI } from '@jbouduin/hal-rest-client';
import { IHalResourceConstructor } from '@jbouduin/hal-rest-client/dist/hal-resource-interface';
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
      type: IHalResourceConstructor<L>,
      linkFn: (m: M) => L,
      setFn: (m: M, l: L) => void): Promise<void> {
    // make sure that all resources are fetched at least once
    await Promise.all(elements
      .filter(element => linkFn(element) && linkFn(element).uri?.uri && !linkFn(element).isLoaded)
      .map(element => linkFn(element))
      .filter((element, i, arr) => arr.findIndex(t => t.uri.uri === element.uri.uri) === i)
      .map(link => {
        this.logService.verbose(LogSource.Main, 'prefetch', link.uri.uri);
        return link.fetch(true);
      })
    );
    // TODO #1239 check if we can not just reload the resources from cache
    elements
      .filter(element => linkFn(element) && linkFn(element).uri?.uri && !linkFn(element).isLoaded)
      .forEach(element => {
        this.logService.debug(LogSource.Main, 'setting prefetched', linkFn(element).uri.uri, 'for', element.id);
        setFn(element, this.openprojectService.createFromCache(type, linkFn(element).uri));
        if (!linkFn(element).isLoaded) {
          this.logService.debug(LogSource.Main,  `did not succeed to load ${linkFn(element).uri?.uri} into ${element.uri.uri}`);
        } else {
          this.logService.debug(LogSource.Main,`succeeded to load ${linkFn(element).uri?.uri} into ${element.uri.uri}`);
        }
      });
    elements
      .filter(element => linkFn(element) && linkFn(element).uri?.uri && linkFn(element).isLoaded)
      .forEach(element => {
        this.logService.debug(LogSource.Main,`${linkFn(element).uri?.uri} already loaded into ${element.uri.uri}`);
      });
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

  protected async deepLink<T extends CollectionModel<any>>(type: IHalResourceConstructor<T>, uri?: URI): Promise<T> {
    let deeplink = this.openprojectService.createFromCache(type, uri);
    if (deeplink.count > 0) {
      this.logService.debug(LogSource.Main, `using cache for ${uri.uri}`);
      return Promise.resolve(deeplink);
    } else {
      this.logService.debug(LogSource.Main, `fetching ${uri.uri}`);
      return deeplink.fetch(true);
    }
  }
  // </editor-fold>
}

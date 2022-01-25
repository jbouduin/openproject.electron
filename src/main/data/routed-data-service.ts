import { IDataRouterService } from './data-router.service';

export interface IRoutedDataService {
  setRoutes(router: IDataRouterService): void;
}

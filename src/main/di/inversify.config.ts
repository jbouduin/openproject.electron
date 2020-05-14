import { Container } from 'inversify';

import { IDataRouterService, DataRouterService } from '../data';
import { ILogService, LogService } from '../system';
import { ISystemService, SystemService } from '../data';

import SERVICETYPES from './service.types';

const container = new Container();

// <editor-fold desc='Services'>
container.bind<IDataRouterService>(SERVICETYPES.DataRouterService).to(DataRouterService).inSingletonScope();
container.bind<ILogService>(SERVICETYPES.LogService).to(LogService).inSingletonScope();
container.bind<ISystemService>(SERVICETYPES.SystemService).to(SystemService);
// </editor-fold>

export default container;

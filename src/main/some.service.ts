import { injectable } from 'inversify';
import 'reflect-metadata';

export interface ISomeService {
  initialize(): void;
}

@injectable()
export class SomeService implements ISomeService {
  // <editor-fold desc='ISomeService Interface methods'>
  public initialize(): void {
    console.log('in initialize SomeService');
  }
  // </editor-fold>

}

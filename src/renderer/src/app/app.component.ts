import { Component, OnInit } from '@angular/core';
import { IpcService, LogService } from '@core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  // <editor-fold desc='Public properties'>
  public title: string;
  // </editor-fold>

  // <editor-fold desc=''>
  public constructor(
    private ipcService: IpcService,
    private logService: LogService) {
    this.title = 'Openproject';
  }
  // </editor-fold>

  // <editor-fold desc=''>
  public ngOnInit(): void {
    this.logService.initialize();
  }
  // </editor-fold>

  // <editor-fold desc='UI Triggered methods'>
  public clickDevTools(): void {
    this.ipcService.openDevTools();
  }
  // </editor-fold>
}

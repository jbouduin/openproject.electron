import { Component, OnInit } from '@angular/core';
import { LogService } from '@core';

@Component({
  selector: 'app-root',
  template: '<app-shell></app-shell>',
  styles: []
})
export class AppComponent implements OnInit {

  // <editor-fold desc=''>
  public constructor(private logService: LogService) { }
  // </editor-fold>

  // <editor-fold desc=''>
  public ngOnInit(): void {
    this.logService.initialize();
  }
  // </editor-fold>


}

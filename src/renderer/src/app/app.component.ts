import { Component } from '@angular/core';
import { IpcService } from '@core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Openproject';

  constructor(private ipcService: IpcService) {
  }

  clickDevTools() {
    this.ipcService.openDevTools();
  }
}

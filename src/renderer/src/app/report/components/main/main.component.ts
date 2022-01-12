import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataRequestFactory, IpcService } from '@core';
import { DataVerb } from '@ipc';

export interface Month {
  month: number;
  label: string;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  // <editor-fold desc='Private properties'>
  private ipcService: IpcService;
  private dataRequestFactory: DataRequestFactory;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public formGroup: FormGroup;
  public months: Array<Month>;
  public thisYear: number;
  // </editor-fold>

  constructor(formBuilder: FormBuilder,
    ipcService: IpcService,
    dataRequestFactory: DataRequestFactory) {
    this.ipcService = ipcService;
    this.dataRequestFactory = dataRequestFactory;
    this.thisYear = new Date().getFullYear();
    this.formGroup = formBuilder.group({
      fileName: new FormControl('', [Validators.required]),
      openFile: new FormControl(true),
      month: new FormControl(),
      year: new FormControl('', [Validators.required])
    });

    this.months = [
      { month: 1, label: 'january' },
      { month: 2, label: 'februari' },
      { month: 3, label: 'march' },
      { month: 4, label: 'april' },
      { month: 5, label: 'mai' },
      { month: 6, label: 'june' },
      { month: 7, label: 'juli' },
      { month: 8, label: 'august' },
      { month: 9, label: 'september' },
      { month: 10, label: 'october' },
      { month: 11, label: 'november' },
      { month: 12, label: 'december' }
    ];
    this.reset();
  }

  ngOnInit(): void {
  }

  public async saveAs(): Promise<void> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/save-as/export');
    const response = await this.ipcService.untypedDataRequest(request);
    console.log(response);
    this.formGroup.controls['fileName'].patchValue(response.data);
  }

  public reset(): void {
    this.formGroup.controls['fileName'].patchValue('');
    this.formGroup.controls['openFile'].patchValue(true);
    const today = new Date();
    this.formGroup.controls['month'].patchValue(today.getMonth() + 1);
    this.formGroup.controls['year'].patchValue(this.thisYear);
  }

  public export(): void {
    // const request = this.dataRequestFactory.createDataRequest<DtoTimeEntryExportRequest>(DataVerb.POST, '/export/time-entries', data);
    // await this.ipcService.dataRequest<DtoTimeEntryExportRequest, any>(request);
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceReportComponent } from './absence-report.component';

describe('AbsenceComponent', () => {
  let component: AbsenceReportComponent;
  let fixture: ComponentFixture<AbsenceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbsenceReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbsenceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfCommonComponent } from './pdf-common.component';

describe('PdfCommonComponent', () => {
  let component: PdfCommonComponent;
  let fixture: ComponentFixture<PdfCommonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfCommonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

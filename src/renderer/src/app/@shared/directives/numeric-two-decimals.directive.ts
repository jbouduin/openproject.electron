import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumericTwoDecimals]'
})
export class NumericTwoDecimalsDirective {

  //#region private properties ------------------------------------------------
  private elementRef: ElementRef;
  private regex: RegExp;
  private specialKeys: Array<string>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(elementRef: ElementRef) {
    this.elementRef = elementRef;
    // Allow decimal numbers and negative values
    this.regex = new RegExp(/^\d*\.?\d{0,2}$/g);
    // Allow key codes for special events. Reflect :
    // Backspace, tab, end, home
    this.specialKeys = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  @HostListener('keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.elementRef.nativeElement.value;
    const position = this.elementRef.nativeElement.selectionStart;
    const next: string = [current.slice(0, position), event.key == 'Decimal' ? '.' : event.key, current.slice(position)].join('');
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
  //#endregion
}


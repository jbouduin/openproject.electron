import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-floating-button',
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.scss']
})
export class FloatingButtonComponent implements OnInit {

  @Input() public icon: string;
  @Input() public label: string;
  @Input() public sequence: number;
  @Output() public onClick: EventEmitter<any>;

  constructor() {
    this.onClick = new EventEmitter<any>();
    this.sequence = 0;
  }

  ngOnInit(): void {
  }

  click(): void {
    this.onClick.emit();
  }

  public get buttonStyle(): Object {
    return {
      'top': `${80 + (this.sequence * 80)}px`
    };
  }
}

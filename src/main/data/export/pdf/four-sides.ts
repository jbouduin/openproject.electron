export interface IFourSides<T> {
  top: T;
  right: T;
  bottom: T;
  left: T;
  assign(...value: Array<T>): void;
  convert( convertFn: (x: T) => T ): void;
  overrideDefaults(override: FourSides<T>, defaultValue: T, equalityFn?: (x: T, y: T) => boolean): void
  transform<U>(transformFn: (x: T) => U): FourSides<U>
}

export class FourSides<T> implements IFourSides<T> {

  // <editor-fold desc='Public IFourSides Interface properties'>
  public top: T;
  public right: T;
  public bottom: T;
  public left: T;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(value: T, ...values: Array<T>) {
    this.assign(value, ...values);
  }
  // </editor-fold>

  // <editor-fold desc='Public IFourSides Interface methods'>
  public assign(value: T, ...values: Array<T>): void {
    this.top = value;
    switch(values.length) {
      case 3: {
        this.right = values[0];
        this.bottom = values[1];
        this.left = values[2];
        break;
      }
      case 2:  {
        this.right = values[0];
        this.bottom = values[1];
        this.left = values[0];
        break;
      }
      case 1:  {
        this.right = values[0];
        this.bottom = value;
        this.left = values[0];
        break;
      }
      default: {
        this.right = value;
        this.bottom = value;
        this.left = value;
      }
    }
  }

  public convert(convertFn: (x: T) => T): void {
    this.top = convertFn(this.top);
    this.right = convertFn(this.right);
    this.bottom = convertFn(this.bottom);
    this.left = convertFn(this.left);
  }

  public overrideDefaults(override: FourSides<T>, defaultValue: T, equalityFn?: (x: T, y: T) => boolean): void {
    if (!equalityFn) {
      equalityFn = (x: T, y:T) => x === y;
    }
    if (equalityFn(this.top, defaultValue)) {
      this.top = override.top;
    }
    if (equalityFn(this.right, defaultValue)) {
      this.right = override.right;
    }
    if (equalityFn(this.bottom, defaultValue)) {
      this.bottom = override.bottom;
    }
    if (equalityFn(this.left, defaultValue)) {
      this.left = override.left;
    }
  }

  public transform<U>(transformFn: (x: T) => U): FourSides<U> {
    return new FourSides<U>(
      transformFn(this.top),
      transformFn(this.right),
      transformFn(this.bottom),
      transformFn(this.left)
    );
  }
  // </editor-fold>
}

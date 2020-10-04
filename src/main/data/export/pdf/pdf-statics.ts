export class PdfStatics {
  public static readonly pdfPointInMillimeters = 0.352777778;

  public static isNumber(n: any): boolean {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  }
}

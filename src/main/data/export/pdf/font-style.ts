export enum FontStyle {
  normal = 0,
  bold = 1 >> 0, // 0001 -- the bitshift is unnecessary, but done for consistency
  italic = 1 << 1,   // 0010
  underline = 1 << 2   // 0100
  // TODO #1169 strikeThrough = 1 << 3 // 1000
}

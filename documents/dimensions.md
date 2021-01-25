## Dimensions in PDF
This page has lost it's significance as I switched PDF-Generation from PDFLib and a home-grown wrapper around it, to PDFMake.

### The measures of a font type

![Font](/images/font-dimensions.png)

Sample values:

| Font name       | Property           | Value |
| --------------- | ------------------ | ----: |
| **Times-Roman** | UnderlinePosition  |  -100 |
|                 | UnderlineThickness |    50 |
|                 | CapHeight          |   662 |
|                 | XHeight            |   450 |
|                 | Ascender           |   683 |
|                 | Descender          |  -217 |
|                 | StdHW              |    28 |
|                 | StdVW              |    84 |
| **Times-Bold**  | UnderlinePosition  |  -100 |
|                 | UnderlineThickness |    50 |
|                 | CapHeight          |   676 |
|                 | XHeight            |   461 |
|                 | Ascender           |   603 |
|                 | Descender          |  -217 |
|                 | StdHW              |    44 |
|                 | StdVW              |   139 |

### Assumptions about PDF-Lib:
  - The y coordinate of ```drawText``` is the *base line* of the font
  - the text size of ```drawText``` is similar to the font size expressed in points, as used in normal text processors.

### Line height
Research gave that the line height commonly equals to *1.15 x font height*.

### Conversions
Sizes in pdf-lib are in so-called *pdfPoints*.
  - 1 inch = 72 points
  - 1 inch = 25.4 mm
  - 1 point = 0.352777778 mm
  - 15 mm = 42.52 points (approx)
  - 10 mm = 28.35 points (approx)

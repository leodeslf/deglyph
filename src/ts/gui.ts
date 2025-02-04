import {
  styleHeaderToReadableName,
  styleTupleValueToCssValue,
  weightToWeightName,
  widthToWidthName
} from "./styles";

const kb = 1_000;
const mb = 1_000_000;

function useReadableFileWeight(value: number): [
  roundedValue: number,
  valueUnit: string
] {
  const sign = value >= 0 ? 1 : -1;
  const absoluteValue = Math.abs(value);
  let roundedValue: number;
  let valueUnit: string;

  if (absoluteValue < kb) {
    roundedValue = absoluteValue * sign;
    valueUnit = 'B';
  } else if (absoluteValue >= kb && absoluteValue < mb) {
    roundedValue = absoluteValue / kb * sign;
    valueUnit = 'KB';
  } else {
    roundedValue = absoluteValue / mb * sign;
    valueUnit = 'MB';
  }

  return [Number(roundedValue.toFixed(1)), valueUnit];
}

function getPercentage(unit: number, fraction: number): number {
  return Number((unit === 0 ? NaN : fraction / unit * 100).toFixed(1));
}

function useReadableCssProperties(fontVariationSettings: string): string {
  const styles = fontVariationSettings.match(/"\w{4}" [^,]+/g);

  if (styles === null) {
    return 'Style: Normal, Weight: 400 (Regular)';
  }

  return styles
    .map(style => {
      const styleHeader = style.match(/"(\w{4})"/)?.[1] as AxisTag;
      const styleTupleValue = style.match(/"\w{4}" (.+)/)?.[1] as string;
      let propertyValue: string = styleTupleValue;

      if (styleHeader in styleTupleValueToCssValue) {
        propertyValue = styleTupleValueToCssValue[
          styleHeader as RegisteredAxisTag
        ](styleTupleValue);
        propertyValue = propertyValue[0].toUpperCase() + propertyValue.slice(1);

        if (styleHeader === 'wght' && propertyValue in weightToWeightName) {
          propertyValue += ` (${weightToWeightName[
            propertyValue as FontWeightValues
          ]})`;
        } else if (
          styleHeader === 'wdth' && propertyValue in widthToWidthName
        ) {
          propertyValue += ` (${widthToWidthName[
            propertyValue as FontWidthValues
          ]})`;
        }
      }

      return `${styleHeaderToReadableName[styleHeader]}: ${propertyValue}`;
    })
    .join(', ');
}

const familyPrefix = 'Fontima - ';
const previewCharMoleculesPerPage = (() => {
  const previewColumns = 16;
  const previewRows = 45;
  return previewColumns * previewRows;
})();

function usePreviewPagination(
  pageIndex: number
): [pageStart: number, pageEnd: number] {
  return [
    previewCharMoleculesPerPage * pageIndex,
    previewCharMoleculesPerPage * (pageIndex + 1)
  ];
}

export {
  familyPrefix,
  getPercentage,
  previewCharMoleculesPerPage,
  usePreviewPagination,
  useReadableCssProperties,
  useReadableFileWeight,
};

const knownDateFields = [
  'spentOn',
  'createdAt',
  'modifiedAt',
  'startDate',
  'endDate',
  'dueDate'
];

export const dateTimeReviver = function (key: string, value: any) {
  let result = value;
  if (knownDateFields.indexOf(key) >= 0 && typeof value === 'string') {
    try {
      result = new Date(value);
    } catch (error) {
      console.log(error);
      result = value
    }
  }
  return result;
}
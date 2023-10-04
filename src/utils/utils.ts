export function removeDuplicates(listInsert) {
  return listInsert
    .map((item) => JSON.stringify(item))
    .filter((item, index, self) => self.indexOf(item) === index)
    .map((item) => JSON.parse(item));
}

export function changeTime(date) {
  if (date != null) {
    return "'" + new Date(date).toISOString() + "'";
  }
  return null;
}

export function changeStaorca(staorca: string) {
    if (staorca == undefined) {
      return null;
    }
    return staorca;
  }

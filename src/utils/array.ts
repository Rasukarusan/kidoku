export const uniq = (array) => {
  return array.filter((elem, index, self) => self.indexOf(elem) === index)
}

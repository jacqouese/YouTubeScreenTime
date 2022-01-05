export function prepareDateObject(dateBound) {
  const object = {};
  dateBound.forEach((singleDate) => {
    object[singleDate] = {};
  });
  return object;
}

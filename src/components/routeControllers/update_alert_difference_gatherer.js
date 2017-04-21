const doesNotExist = (obj, key) => !obj.hasOwnProperty(key) || obj[key] === '' || obj[key] === null;

const updateAlertDifferenceGatherer = {
  formatMessage: (newObject = {}, oldObject = {}) => {
    const diffs = [];

    const allFields = new Set(Object.keys(newObject));
    Object.keys(oldObject).forEach(k => allFields.add(k));
    allFields.delete('attributes');

    allFields.forEach((key) => {
      if (doesNotExist(newObject, key) && !doesNotExist(oldObject, key)) {
        diffs.push(` * ${key} was removed`);
      } else if (doesNotExist(oldObject, key) && !doesNotExist(newObject, key)) {
        diffs.push(` * ${key} was added: ${newObject[key]}`);
      } else if (newObject[key] !== oldObject[key]) {
        diffs.push(` * ${key} was updated from ${oldObject[key]} to ${newObject[key]}`);
      }
    });

    return diffs.join('\n');
  },
};

module.exports = updateAlertDifferenceGatherer;

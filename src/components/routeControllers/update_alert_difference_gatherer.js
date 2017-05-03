const fieldsToIgnore = ['CompareName'];
const maxInlineLength = 150;

const doesNotExist = (obj, key) => !obj.hasOwnProperty(key) || obj[key] === '' || obj[key] === null;

const formatValue = (value) => {
  if (typeof value === 'string' && (value.length > maxInlineLength || value.match(/[\n\r]+/))) {
    return `\n> ${value.split(/[\n\r]+/).join(' ')}\n\n`;
  }
  return `**${value}**`;
};

const updateAlertDifferenceGatherer = {
  formatMessage: (newObject = {}, oldObject = {}) => {
    const diffs = [];

    const allFields = new Set(Object.keys(newObject));
    Object.keys(oldObject).forEach(k => allFields.add(k));
    allFields.delete('attributes');

    Array.from(allFields)
      .filter(k => !fieldsToIgnore.includes(k))
      .sort()
      .forEach((key) => {
        if (doesNotExist(newObject, key) && !doesNotExist(oldObject, key)) {
          diffs.push(` * ${key} was removed`);
        } else if (doesNotExist(oldObject, key) && !doesNotExist(newObject, key)) {
          diffs.push(` * ${key} was added: ${formatValue(newObject[key])}`);
        } else if (newObject[key] !== oldObject[key]) {
          diffs.push(` * ${key} was updated from ${formatValue(oldObject[key])} to ${formatValue(newObject[key])}`);
        }
      });

    return diffs.join('\n');
  },
};

module.exports = updateAlertDifferenceGatherer;

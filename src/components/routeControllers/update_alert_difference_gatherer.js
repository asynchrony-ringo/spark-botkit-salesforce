const updateAlertDifferenceGatherer = {
  formatMessage: (newObj, oldObj) => {
    let diffOutput = '';
    const diffs = [];

    Object.keys(newObj).forEach((key) => {
      if (typeof newObj[key] === 'string') {
        if (newObj[key] !== oldObj[key]) {
          diffs.push(`${key} was updated to: ${newObj[key]}`);
        }
      }
    });

    if (diffs.length > 0) {
      diffOutput += '\n';
      diffOutput += diffs.join('\n');
    }

    return diffOutput;
  },
};

module.exports = updateAlertDifferenceGatherer;

const updateAlertDifferenceGatherer = require('../../../src/components/routeControllers/update_alert_difference_gatherer.js');
const expect = require('chai').expect;


describe('update alert difference gatherer', () => {
  it('should return empty string if object undefined', () => {
    expect(updateAlertDifferenceGatherer.formatMessage()).to.be.empty;
  });

  it('should return empty string if empty objects', () => {
    expect(updateAlertDifferenceGatherer.formatMessage({}, {})).to.be.empty;
  });

  it('should ignore the attributes object', () => {
    const newObject = {
      attributes: 'something',
    };
    const oldObject = {
      attributes: 'something else',
    };

    expect(updateAlertDifferenceGatherer.formatMessage(newObject, oldObject)).to.be.empty;
  });

  it('should return empty if objects are equal', () => {
    const newObject = {
      name: 'foo',
      title: 'bar',
    };
    const oldObject = {
      name: 'foo',
      title: 'bar',
    };

    expect(updateAlertDifferenceGatherer.formatMessage(newObject, oldObject)).to.be.empty;
  });

  it('should return correct format when values have been edited', () => {
    const newObject = {
      constant: 'field',
      name: 'foo',
      title: 'bar',
      blank: '',
    };
    const oldObject = {
      constant: 'field',
      name: 'bar',
      title: 'foo',
      blank: '',
    };
    const formattedDiffs = updateAlertDifferenceGatherer
      .formatMessage(newObject, oldObject).split('\n');
    expect(formattedDiffs.length).to.equal(2);
    expect(formattedDiffs[0]).to.equal(' * name was updated from bar to foo');
    expect(formattedDiffs[1]).to.equal(' * title was updated from foo to bar');
  });

  [
    {
      constant: 'field',
    },
    {
      constant: 'field',
      name: '',
      title: '',
    },
    {
      constant: 'field',
      name: null,
      title: null,

    },
  ].forEach((newObject) => {
    it('should return correct format when values have been deleted', () => {
      const oldObject = {
        constant: 'field',
        name: 'bar',
        title: 'foo',
      };
      const formattedDiffs = updateAlertDifferenceGatherer
        .formatMessage(newObject, oldObject).split('\n');
      expect(formattedDiffs.length).to.equal(2);
      expect(formattedDiffs[0]).to.equal(' * name was removed');
      expect(formattedDiffs[1]).to.equal(' * title was removed');
    });
  });


  [
    {
      constant: 'field',
    },
    {
      constant: 'field',
      title: '',
      name: '',
    },
    {
      constant: 'field',
      title: null,
      name: null,
    },
  ].forEach((oldObject) => {
    it(`should return correct format when values have been added (oldObject=${JSON.stringify(oldObject)})`, () => {
      const newObject = {
        constant: 'field',
        name: 'bar',
        title: 'foo',
      };
      const formattedDiffs = updateAlertDifferenceGatherer
        .formatMessage(newObject, oldObject).split('\n');
      expect(formattedDiffs.length).to.equal(2);
      expect(formattedDiffs[0]).to.equal(' * name was added: bar');
      expect(formattedDiffs[1]).to.equal(' * title was added: foo');
    });
  });

  it('should order the keys alphabetically', () => {
    const newObject = {
      monkey: 'banana',
      zebra: 'stripe',
      apple: 'foo',
      title: 'bar',
    };
    const oldObject = {
      monkey: 'tree',
      zebra: 'savanna',
      apple: 'bar',
      title: 'foo',
    };
    const formattedDiffs = updateAlertDifferenceGatherer
      .formatMessage(newObject, oldObject).split('\n');
    expect(formattedDiffs.length).to.equal(4);
    expect(formattedDiffs[0]).to.equal(' * apple was updated from bar to foo');
    expect(formattedDiffs[1]).to.equal(' * monkey was updated from tree to banana');
    expect(formattedDiffs[2]).to.equal(' * title was updated from foo to bar');
    expect(formattedDiffs[3]).to.equal(' * zebra was updated from savanna to stripe');
  });

  it('should ignore "CompareName" field', () => {
    const newObject = {
      CompareName: 'FOO',
      name: 'foo',
    };
    const oldObject = {
      name: 'bar',
    };
    const formattedDiffs = updateAlertDifferenceGatherer
      .formatMessage(newObject, oldObject).split('\n');
    expect(formattedDiffs.length).to.equal(1);
    expect(formattedDiffs[0]).to.equal(' * name was updated from bar to foo');
  });
});

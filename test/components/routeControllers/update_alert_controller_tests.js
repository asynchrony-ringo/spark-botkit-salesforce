const updateAlertController = require('../../../src/components/routeControllers/update_alert_controller.js');
const expect = require('chai').expect;

describe('update alert controller', () => {
  describe('isValid', () => {
    it('should return a successful status and message when the request is of correct type', () => {
      const newObjectList = [{
        attributes: {
          type: 'Opportunity',
        },
      }];
      const oldObjectList = [{
        attributes: {
          type: 'Opportunity',
        },
      }];
      const result = updateAlertController.isValid(newObjectList, oldObjectList);
      expect(result).to.be.true;
    });

    [
      {
        new: undefined,
        old: undefined,
        description: 'new and old undefined',
      },
      {
        new: 'not an array',
        old: 'not an array',
        description: 'new and old are not arrays',
      },
      {
        new: [{}],
        old: [{}],
        description: 'new and old empty objects',
      },
      {
        new: [{ attributed: {} }],
        old: [{ attributed: {} }],
        description: 'empty attributes object',
      },
      {
        new: [{ attributes: { type: 'Foo' } }],
        old: [{ attributes: { type: 'Foo' } }],
        description: 'neither has correct attribute',
      },
      {
        new: [{ attributes: { type: 'Opportunity' } }],
        old: [],
        description: 'new has more than old',
      },
      {
        new: [],
        old: [{ attributes: { type: 'Opportunity' } }],
        description: 'old has more than new',
      },
      {
        new: [{ attributes: { type: 'Opportunity' }, Id: '1' }],
        old: [{ attributes: { type: 'Opportunity' }, Id: '2' }],
        description: 'different ids',
      },
      {
        new: [{ attributes: { type: 'Opportunity' }, Id: '1' }, { attributes: { type: 'Opportunity' }, Id: '2' }],
        old: [{ attributes: { type: 'Opportunity' }, Id: '1' }, { attributes: { type: 'Opportunity' }, Id: '3' }],
        description: 'different ids after the first',
      },
      {
        new: [{ attributes: { type: 'Opportunity' }, Id: '1' }],
        old: [{ Id: '1' }],
        description: 'old element does not contain attributes attribute',
      },
      {
        new: [{ attributes: { type: 'Opportunity' }, Id: '1' }],
        old: [{ attributes: {}, Id: '1' }],
        description: 'old element does not contain type attribute',
      },
      {
        new: [{ attributes: { type: 'Opportunity' }, Id: '1' }],
        old: [{ attributes: { type: 'Foo' }, Id: '1' }],
        description: 'old element is not an opportunity',
      },
      {
        new: [{ attributes: { type: 'Opportunity' }, Id: '1' }, { attributes: { type: 'Bar' }, Id: '2' }],
        old: [{ attributes: { type: 'Opportunity' }, Id: '1' }, { attributes: { type: 'Opportunity' }, Id: '2' }],
        description: 'second new element is not of type Opportunity',
      },
      {
        new: [{ attributes: { type: 'Opportunity' }, Id: '1' }, { attributes: { type: 'Opportunity' }, Id: '2' }],
        old: [{ attributes: { type: 'Opportunity' }, Id: '1' }, { attributes: { type: 'Bar' }, Id: '2' }],
        description: 'second old element is not of type Opportunity',
      },
    ].forEach((testCase) => {
      it(`should return false when ${testCase.description}`, () => {
        const result = updateAlertController.isValid(testCase.new, testCase.old);
        expect(result).to.be.false;
      });
    });
  });
});

const updateAlertController = require('../../../src/components/routeControllers/update_alert_controller.js');
const expect = require('chai').expect;
const sinon = require('sinon');
const updateAlertDifferenceGatherer = require('../../../src/components/routeControllers/update_alert_difference_gatherer.js');

describe('update alert controller', () => {
  describe('messageOwner', () => {
    let jsforceConn;
    let controller;
    let retrieveStub;
    let newObject;
    let oldObject;

    beforeEach(() => {
      retrieveStub = sinon.stub();
      jsforceConn = { sobject: sinon.stub() };
      jsforceConn.sobject.returns({ retrieve: retrieveStub });
      controller = { spawn: sinon.stub() };
    });

    describe('when owner id exists', () => {
      beforeEach(() => {
        newObject = {
          attributes: { type: 'SOME TYPE' },
          OwnerId: 1234,
          Name: 'really_nice_name2',
          Id: 'even_better_id',
        };
        oldObject = {
          attributes: { type: 'SOME OLD TYPE' },
          OwnerId: 1234,
          Name: 'really_nice_name',
          Id: 'even_better_id',
        };
        updateAlertController.messageOwner(newObject, oldObject, controller, jsforceConn);
      });

      it('should create sobject for User query', () => {
        expect(jsforceConn.sobject.calledOnce).to.be.true;
        expect(jsforceConn.sobject.args[0][0]).to.equal('User');
      });

      it('should retrieve user based off ownerId', () => {
        expect(retrieveStub.calledOnce).to.be.true;
        expect(retrieveStub.args[0][0]).to.equal(1234);
        expect(retrieveStub.args[0][1]).to.be.a('Function');
      });

      describe('retrieve callback', () => {
        let retrieveCallback;
        let bot;

        beforeEach(() => {
          retrieveCallback = retrieveStub.args[0][1];
          bot = {
            startPrivateConversation: sinon.stub(),
          };
          controller.spawn.returns(bot);
        });

        it('should not start a conversation if there is an error', () => {
          retrieveCallback(true, {});
          expect(controller.spawn.notCalled).to.be.true;
        });

        it('should spawn a bot when no error', () => {
          retrieveCallback(null, {});
          expect(controller.spawn.calledOnce).to.be.true;
        });

        it('should start a conversation with the returned user', () => {
          retrieveCallback(null, { Email: 'some.email@some-domain.ext' });
          expect(bot.startPrivateConversation.calledOnce).to.be.true;
          expect(bot.startPrivateConversation.args[0][0]).to.deep.equal({ user: 'some.email@some-domain.ext' });
          expect(bot.startPrivateConversation.args[0][1]).to.be.a('Function');
        });

        describe('conversation callback', () => {
          let conversationCallback;
          let conversation;

          beforeEach(() => {
            process.env.base_url = 'niceurl.some-domain.ext/';
            retrieveCallback(null, { Email: 'some.email@some-domain.ext' });
            conversationCallback = bot.startPrivateConversation.args[0][1];
            conversation = { say: sinon.stub() };
            sinon.stub(updateAlertDifferenceGatherer, 'formatMessage');
          });

          afterEach(() => {
            delete process.env.base_url;
            updateAlertDifferenceGatherer.formatMessage.restore();
          });

          it('should not say anything on error', () => {
            conversationCallback(true, conversation);
            expect(conversation.say.notCalled).to.be.true;
          });

          it('should tell the user an opportunity has been updated and diff message on success', () => {
            const expectedDifferenceMessage = 'Here is a really good difference message';
            updateAlertDifferenceGatherer.formatMessage
              .withArgs(newObject, oldObject)
              .returns(expectedDifferenceMessage);

            conversationCallback(null, conversation);
            expect(conversation.say.called).to.be.true;
            expect(conversation.say.args[0][0]).to.equal(`The SOME TYPE [really_nice_name2](niceurl.some-domain.ext/even_better_id) has been updated!\n${expectedDifferenceMessage}`);
          });
        });
      });
    });
  });

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

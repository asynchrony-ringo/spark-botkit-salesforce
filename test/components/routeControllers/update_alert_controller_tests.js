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

    it('should do nothing if new obj owner id does not exist', () => {
      newObject = {
        attributes: { type: 'SOME TYPE' },
        Name: 'really_nice_name2',
        Id: 'even_better_id',
        CreatedDate: 'something',
      };
      oldObject = {
        attributes: { type: 'SOME OLD TYPE' },
        Name: 'really_nice_name',
        Id: 'even_better_id',
        CreatedDate: 'something',
      };
      updateAlertController.messageOwner(newObject, oldObject, controller, jsforceConn);
      expect(jsforceConn.sobject.calledOnce).to.be.false;
    });


    it('should do nothing if old obj CreatedDate does not exist', () => {
      newObject = {
        attributes: { type: 'SOME TYPE' },
        OwnerId: 'owner',
        Name: 'really_nice_name2',
        Id: 'even_better_id',
        CreatedDate: 'something',
      };
      oldObject = {
        attributes: { type: 'SOME OLD TYPE' },
        Name: 'really_nice_name',
        Id: 'even_better_id',
      };
      updateAlertController.messageOwner(newObject, oldObject, controller, jsforceConn);
      expect(jsforceConn.sobject.calledOnce).to.be.false;
    });

    describe('when owner id exists', () => {
      beforeEach(() => {
        newObject = {
          attributes: { type: 'SOME TYPE' },
          OwnerId: 1234,
          Name: 'really_nice_name2',
          Id: 'even_better_id',
          CreatedDate: 'something',
        };
        oldObject = {
          attributes: { type: 'SOME OLD TYPE' },
          Name: 'really_nice_name',
          Id: 'even_better_id',
          CreatedDate: 'something',
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

          it('should tell the user the entity has been updated and diff message on success', () => {
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
    it('should return a successful status and message when type and ids are the same', () => {
      const newObjectList = [{
        attributes: {
          type: 'Some awesome type',
        },
        Id: 1,
      }];
      const oldObjectList = [{
        attributes: {
          type: 'Some awesome type',
        },
        Id: 1,
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
        new: [{ attributes: { type: 'type' } }],
        old: [{ attributes: { type: 'type' } }],
        description: 'no ids',
      },
      {
        new: [{ attributes: {}, Id: 'id' }],
        old: [{ attributes: {}, Id: 'id' }],
        description: 'empty attributes object',
      },
      {
        new: [{ attributes: { type: 'Foo' }, Id: 'id' }],
        old: [{ attributes: { type: 'Bar' }, Id: 'id' }],
        description: 'type attributes do not match',
      },
      {
        new: [{ attributes: { type: 'type' }, Id: 'id' }],
        old: [],
        description: 'new has more than old',
      },
      {
        new: [],
        old: [{ attributes: { type: 'type' }, Id: 'id' }],
        description: 'old has more than new',
      },
      {
        new: [{ attributes: { type: 'type' }, Id: '1' }],
        old: [{ attributes: { type: 'type' }, Id: '2' }],
        description: 'different ids',
      },
      {
        new: [{ attributes: { type: 'type' }, Id: '1' }, { attributes: { type: 'type' }, Id: '2' }],
        old: [{ attributes: { type: 'type' }, Id: '1' }, { attributes: { type: 'type' }, Id: '3' }],
        description: 'different ids after the first',
      },
      {
        new: [{ attributes: { type: 'type' }, Id: '1' }],
        old: [{ Id: '1' }],
        description: 'old element does not contain attributes attribute',
      },
      {
        new: [{ attributes: { type: 'type' }, Id: '1' }],
        old: [{ attributes: {}, Id: '1' }],
        description: 'old element does not contain type attribute',
      },
      {
        new: [{ attributes: { type: 'type' }, Id: '1' }, { attributes: { type: 'Different Type' }, Id: '2' }],
        old: [{ attributes: { type: 'type' }, Id: '1' }, { attributes: { type: 'type' }, Id: '2' }],
        description: 'second elements types do not match',
      },
      {
        new: [{ attributes: { type: 'type' }, Id: '1' }, { attributes: { type: 'type' }, Id: '21' }],
        old: [{ attributes: { type: 'type' }, Id: '1' }, { attributes: { type: 'type' }, Id: '2' }],
        description: 'second elements ids do not match',
      },
    ].forEach((testCase) => {
      it(`should return false when ${testCase.description}`, () => {
        const result = updateAlertController.isValid(testCase.new, testCase.old);
        expect(result).to.be.false;
      });
    });
  });
});

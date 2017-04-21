const testModule = require('../../../src/components/routes/entity_update_webhook.js');
const sinon = require('sinon');
const expect = require('chai').expect;
const updateAlertController = require('../../../src/components/routeControllers/update_alert_controller.js');


describe('incoming web hook for opportunity update', () => {
  let webserver;
  let jsforceConn;
  let controller;

  beforeEach(() => {
    webserver = {
      post: sinon.stub(),
    };

    jsforceConn = {
    };
    controller = {
    };
    testModule(webserver, controller, jsforceConn);
  });

  it('should register a post event', () => {
    expect(webserver.post.calledOnce).to.be.true;
    expect(webserver.post.args[0][0]).to.equal('/salesforce/update');
    expect(webserver.post.args[0][1]).to.be.a('Function');
  });

  describe('webserver post callback', () => {
    let webserverPostCallback;
    let retrieveStub;
    let request;
    let response;

    beforeEach(() => {
      webserverPostCallback = webserver.post.args[0][1];
      retrieveStub = sinon.stub();
      jsforceConn.sobject = sinon.stub();
      jsforceConn.sobject.returns({ retrieve: retrieveStub });

      response = {
        status: sinon.stub(),
        send: sinon.stub(),
      };

      request = { body: {} };
      sinon.stub(updateAlertController, 'isValid');
      updateAlertController.isValid.returns(true);
    });

    afterEach(() => {
      updateAlertController.isValid.restore();
    });

    describe('request validation', () => {
      const newList = ['something'];
      const oldList = ['another thing'];
      beforeEach(() => {
        request.body.new = newList;
        request.body.old = oldList;
      });

      it('should return a successful status and message when controller.isValid returns true', () => {
        updateAlertController.isValid.withArgs(newList, oldList).returns(true);
        webserverPostCallback(request, response);
        expect(response.status.calledWith(200)).to.be.true;
        expect(response.send.calledWith('ok')).to.be.true;
      });

      it('should return a bad request status and message when controller.isValid returns false', () => {
        updateAlertController.isValid.withArgs(newList, oldList).returns(false);
        webserverPostCallback(request, response);
        expect(response.status.calledWith(400)).to.be.true;
        expect(response.send.calledWith('Bad Request')).to.be.true;
      });
    });

    it('should not retrieve a user if there is no owner id', () => {
      request.body.new = [{
        ownerId: null,
      }];
      request.body.old = [{
        ownerId: null,
      }];
      webserverPostCallback(request, response);
      expect(jsforceConn.sobject.notCalled).to.be.true;
    });

    describe('when ownder id exists', () => {
      beforeEach(() => {
        request.body.new = [{
          OwnerId: 1234,
          Name: 'really_nice_name2',
          Id: 'even_better_id',
        }];
        request.body.old = [{
          OwnerId: 1234,
          Name: 'really_nice_name',
          Id: 'even_better_id',
        }];
        webserverPostCallback(request, response);
      });

      it('should create sobject for User query', () => {
        expect(jsforceConn.sobject.calledOnce).to.be.true;
        expect(jsforceConn.sobject.args[0][0]).to.equal('User');
      });

      it('should retrieve user based off ownderId', () => {
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
          controller.spawn = sinon.stub().returns(bot);
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
          });

          afterEach(() => {
            delete process.env.base_url;
          });

          it('should not say anything on error', () => {
            conversationCallback(true, conversation);
            expect(conversation.say.notCalled).to.be.true;
          });

          it('should tell the user an opportunity has been updated and diff message on success', () => {
            conversationCallback(null, conversation);
            expect(conversation.say.called).to.be.true;
            const diff = '\nName was updated to: really_nice_name2';
            expect(conversation.say.args[0][0]).to.equal(`An opportunity you own has been updated!${diff}\n[really_nice_name2](niceurl.some-domain.ext/even_better_id)`);
          });
        });
      });
    });
  });
});

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
      use: sinon.spy(),
    };

    jsforceConn = {};
    controller = {};
    testModule(webserver, controller, jsforceConn);
  });

  it('should register parsing middleware', () => {
    expect(webserver.use.calledOnce).to.be.true;
    expect(webserver.use.args[0][0]).to.equal('/salesforce/update');
    expect(webserver.use.args[0][1]).to.be.an('Array');
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
    const newList = ['something', 'second something'];
    const oldList = ['another thing', 'second another'];

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
      request.body.new = newList;
      request.body.old = oldList;
      sinon.stub(updateAlertController, 'isValid');
      updateAlertController.isValid.returns(true);
      sinon.stub(updateAlertController, 'messageOwner');
    });

    afterEach(() => {
      updateAlertController.isValid.restore();
      updateAlertController.messageOwner.restore();
    });

    describe('request validation', () => {
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

    it('should call controller.messageOwner for each object in the list', () => {
      webserverPostCallback(request, response);
      expect(updateAlertController.messageOwner.calledTwice).to.be.true;
      expect(updateAlertController.messageOwner.args[0])
        .to.deep.equal([newList[0], oldList[0], controller, jsforceConn]);
      expect(updateAlertController.messageOwner.args[1])
        .to.deep.equal([newList[1], oldList[1], controller, jsforceConn]);
    });
  });
});

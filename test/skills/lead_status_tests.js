const sinon = require('sinon');
const expect = require('chai').expect;
const leadStatus = require('../../src/skills/lead_status.js');
const statusController = require('../../src/skillsControllers/status_controller.js');

describe('lead status', () => {
  let controller;
  let jsforceConn;

  beforeEach(() => {
    controller = { hears: sinon.spy() };
    jsforceConn = {};
    leadStatus(controller, jsforceConn);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['lead status (.*)']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let listenerCallback;
    let bot;
    let message;

    beforeEach(() => {
      bot = { reply: sinon.spy() };
      message = { match: [null, 'leadId'] };
      sinon.stub(statusController, 'replyWithStatus');
      listenerCallback = controller.hears.args[0][2];
    });

    afterEach(() => {
      statusController.replyWithStatus.restore();
    });

    it('should call status controller\'s replyWithStatus method', () => {
      listenerCallback(bot, message);
      expect(statusController.replyWithStatus.calledOnce).to.be.true;
      expect(statusController.replyWithStatus.calledWith('Lead', message.match[1], ['Name', 'Email'], bot, message, jsforceConn)).to.be.true;
    });
  });
});

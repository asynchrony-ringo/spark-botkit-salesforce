const sinon = require('sinon');
const expect = require('chai').expect;
const leadOwned = require('../../src/skills/lead_owned.js');
const ownedController = require('../../src/skillsControllers/owned_controller.js');


describe('lead owned', () => {
  const baseUrl = 'baseUrl/';
  let controller;
  let jsforceConn;

  beforeEach(() => {
    controller = { hears: sinon.spy() };

    jsforceConn = {};
    leadOwned(controller, jsforceConn);
    process.env.base_url = baseUrl;
  });

  afterEach(() => {
    delete process.env.base_url;
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['lead owned']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let listenerCallback;
    let bot;
    let message;


    beforeEach(() => {
      bot = { reply: sinon.spy() };
      message = { user: 'testuser' };
      sinon.stub(ownedController, 'replyWithStatus');
      listenerCallback = controller.hears.args[0][2];
    });

    afterEach(() => {
      ownedController.replyWithStatus.restore();
    });

    it('should call status controller\'s replyWithStatus method', () => {
      listenerCallback(bot, message);
      expect(ownedController.replyWithStatus.calledOnce).to.be.true;
      expect(ownedController.replyWithStatus.args[0]).to.deep.equal(['Lead', 'leads', bot, message, jsforceConn]);
    });
  });
});

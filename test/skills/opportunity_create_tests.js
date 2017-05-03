const sinon = require('sinon');
const expect = require('chai').expect;
const opportunityCreate = require('../../src/skills/opportunity_create.js');
const createController = require('../../src/skillsControllers/create_controller.js');

describe('opportunity create', () => {
  let controller;
  let jsforceConn;

  beforeEach(() => {
    controller = { hears: sinon.spy() };

    jsforceConn = { };
    opportunityCreate(controller, jsforceConn);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['opp create <(.*)> <(.*)> <(.*)>']);
    expect(controller.hears.args[0][1]).to.equal('direct_message');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let message;
    let listenerCallback;

    beforeEach(() => {
      bot = {
        reply: sinon.stub(),
      };
      message = {
        match: [
          'full expression',
          'oppName blah',
          'stageName blah',
          'closeDate blah',
        ],
        user: 'somebody@example.com',
      };

      sinon.stub(createController, 'replyWithStatus');

      listenerCallback = controller.hears.args[0][2];
      listenerCallback(bot, message);
    });

    afterEach(() => {
      createController.replyWithStatus.restore();
    });

    it('calls createController\'s replyWithStatus function', () => {
      expect(createController.replyWithStatus.calledOnce).to.be.true;
      expect(createController.replyWithStatus.args[0]).to.deep.equal([
        'Opportunity',
        {
          Name: 'oppName blah',
          StageName: 'stageName blah',
          CloseDate: 'closeDate blah',
        },
        'Opportunity', bot, message, jsforceConn]);
    });
  });
});

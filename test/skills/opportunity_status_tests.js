const sinon = require('sinon');
const expect = require('chai').expect;
const opportunityStatus = require('../../src/skills/opportunity_status.js');

describe('opportunity status', () => {
  const controller = { hears: sinon.spy() };
  const oppId = 'literallyAnything';
  let error = null;
  let opp = {};
  const retrieve = sinon.spy((id, callback) => {
    callback(error, opp);
  });
  const sobject = sinon.spy(() => ({ retrieve }));
  const jsforceConn = { sobject };

  beforeEach(() => {
    opportunityStatus(controller, jsforceConn);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['opp status (.*)']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let message;
    let listenerCallback;

    beforeEach(() => {
      bot = { reply: sinon.spy() };
      message = { match: [null, oppId] };
      listenerCallback = controller.hears.args[0][2];
    });

    it('calls jsforce connection\'s sobject retrieve method', () => {
      listenerCallback(bot, message);
      expect(sobject.calledOnce).to.be.true;
      expect(sobject.args[0][0]).to.equal('Opportunity');
      expect(retrieve.calledOnce).to.be.true;
      expect(retrieve.args[0][0]).to.equal(oppId);
      expect(retrieve.args[0][1]).to.be.a('function');
    });

    describe('when given a valid opportunity id', () => {
      beforeEach(() => {
        opp = {
          Name: 'Super Awesome Opportunity',
          StageName: 'Research',
          CloseDate: '11/13/1988',
        };

        process.env.base_url = 'awesomesauce.com/';
        listenerCallback(bot, message);
      });

      it('should reply with the opportunity details', () => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        const responseMessage = bot.reply.args[0][1];
        const messageParts = responseMessage.split('*');
        expect(messageParts.length).to.equal(4);
        expect(messageParts[0]).to.equal('Information for opportunity: [literallyAnything](awesomesauce.com/literallyAnything)\n');
        expect(messageParts[1]).to.equal(' Name: Super Awesome Opportunity\n');
        expect(messageParts[2]).to.equal(' Current stage: Research\n');
        expect(messageParts[3]).to.equal(' Close Date: 11/13/1988\n');
      });
    });

    describe('when given an invalid opportunity id', () => {
      beforeEach(() => {
        error = 'Error: tribbles!!';

        listenerCallback(bot, message);
      });
      it('should reply with an error message', () => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to retrieve your opportunity: literallyAnything. Error: tribbles!!');
      });
    });
  });
});

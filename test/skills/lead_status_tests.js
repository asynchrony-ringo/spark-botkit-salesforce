const sinon = require('sinon');
const expect = require('chai').expect;
const leadStatus = require('../../src/skills/lead_status.js');

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
    const leadId = 'leadId';
    const lead = {
      Name: 'Test Lead',
      Email: 'test@example.com',
    };
    let error = null;
    let bot;
    let message;
    let listenerCallback;
    let sobject;
    let retrieve;

    beforeEach(() => {
      bot = { reply: sinon.spy() };
      message = { match: [null, 'leadId'] };

      retrieve = sinon.spy((id, callback) => {
        callback(error, lead);
      });

      sobject = sinon.stub().returns({ retrieve });
      jsforceConn.sobject = sobject;

      listenerCallback = controller.hears.args[0][2];
      process.env.base_url = 'awesomesauce.com/';
    });

    afterEach(() => {
      delete process.env.base_url;
    });

    it('calls jsforce connection\'s sobject Lead method ', () => {
      listenerCallback(bot, message);
      expect(sobject.calledOnce).to.be.true;
      expect(sobject.args[0][0]).to.equal('Lead');
    });

    it('calls jsforce connection\'s retrieve method', () => {
      listenerCallback(bot, message);
      expect(retrieve.calledOnce).to.be.true;
      expect(retrieve.args[0][0]).to.deep.equal(leadId);
    });

    describe('when given a valid lead id', () => {
      it('should reply with the lead details', () => {
        listenerCallback(bot, message);
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        const responseMessage = bot.reply.args[0][1];
        const messageParts = responseMessage.split('*');
        expect(messageParts.length).to.equal(3);
        expect(messageParts[0]).to.equal(`Information for lead: [${leadId}](awesomesauce.com/${leadId})\n`);
        expect(messageParts[1]).to.equal(` Name: ${lead.Name}\n`);
        expect(messageParts[2]).to.equal(` Email: ${lead.Email}\n`);
      });
    });

    describe('when given an invalid lead id', () => {
      beforeEach(() => {
        error = 'Error: tribbles!!';
      });

      it('should reply with an error message', () => {
        listenerCallback(bot, message);
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        expect(bot.reply.args[0][1]).to.equal(`Sorry, I was unable to retrieve the lead: ${leadId}. ${error}`);
      });
    });
  });
});

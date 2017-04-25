const sinon = require('sinon');
const expect = require('chai').expect;
const campaignStatus = require('../../src/skills/campaign_status.js');

describe('campaign status', () => {
  let controller;
  let jsforceConn;

  beforeEach(() => {
    controller = { hears: sinon.spy() };
    jsforceConn = {};
    campaignStatus(controller, jsforceConn);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['campaign status (.*)']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    const campaignId = 'campaignId';
    let bot;
    let message;
    let error = null;
    let campaign = { };
    let listenerCallback;
    let sobject;
    let retrieve;

    beforeEach(() => {
      bot = { reply: sinon.spy() };

      message = { match: [null, campaignId] };

      retrieve = sinon.spy((id, callback) => {
        callback(error, campaign);
      });
      sobject = sinon.spy(() => ({ retrieve }));
      jsforceConn.sobject = sobject;

      listenerCallback = controller.hears.args[0][2];
    });

    it('calls jsforce connection\'s sobject method', () => {
      listenerCallback(bot, message);
      expect(sobject.calledOnce).to.be.true;
      expect(sobject.args[0][0]).to.equal('Campaign');
    });

    it('calls jsforce connection\'s retrieve method', () => {
      listenerCallback(bot, message);
      expect(retrieve.calledOnce).to.be.true;
      expect(retrieve.args[0][0]).to.deep.equal(campaignId);
    });

    describe('when given a valid campaign id', () => {
      beforeEach(() => {
        campaign = {
          Name: 'Test Campaign',
          Description: 'Test Description',
          StartDate: '2017-04-24',
          EndDate: '2017-05-24',
        };

        process.env.base_url = 'awesomesauce.com/';
        listenerCallback(bot, message);
      });

      it('should reply with the campaign details', () => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        const responseMessage = bot.reply.args[0][1];
        const messageParts = responseMessage.split('*');
        expect(messageParts.length).to.equal(5);
        expect(messageParts[0]).to.equal(`Information for campaign: [${campaignId}](awesomesauce.com/${campaignId})\n`);
        expect(messageParts[1]).to.equal(` Name: ${campaign.Name}\n`);
        expect(messageParts[2]).to.equal(` Description: ${campaign.Description}\n`);
        expect(messageParts[3]).to.equal(` Start Date: ${campaign.StartDate}\n`);
        expect(messageParts[4]).to.equal(` End Date: ${campaign.EndDate}\n`);
      });
    });

    describe('when given an invalid campaign id', () => {
      beforeEach(() => {
        error = 'Error: tribbles!!';

        listenerCallback(bot, message);
      });
      it('should reply with an error message', () => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        expect(bot.reply.args[0][1]).to.equal(`Sorry, I was unable to retrieve your campaign: ${campaignId}. ${error}`);
      });
    });
  });
});

const sinon = require('sinon');
const expect = require('chai').expect;
const opportunityCreate = require('../../src/skills/opportunity_create.js');

describe('opportunity create', () => {
  const baseUrl = 'baseUrl/';
  let controller;
  let jsforceConn;

  beforeEach(() => {
    controller = { hears: sinon.spy() };

    jsforceConn = { };
    opportunityCreate(controller, jsforceConn);
    process.env.base_url = baseUrl;
  });

  afterEach(() => {
    delete process.env.base_url;
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
    let create;

    beforeEach(() => {
      bot = {
        reply: sinon.stub(),
      };
      message = {
        match: [
          'full expression',
          'oppName blah',
          'stageName blah',
          'closeDate blah'],
      };
      create = sinon.stub();
      jsforceConn.sobject = sinon.stub().withArgs('Opportunity').returns({ create });

      listenerCallback = controller.hears.args[0][2];
      listenerCallback(bot, message);
    });

    it('should create sobject', () => {
      expect(create.calledOnce).to.be.true;
      expect(create.args[0][0]).to.deep.equal({
        Name: 'oppName blah',
        StageName: 'stageName blah',
        CloseDate: 'closeDate blah',
      });
      expect(create.args[0][1]).to.be.a('Function');
    });

    describe('create opportunity callback', () => {
      let createCallback;
      beforeEach(() => {
        createCallback = create.args[0][1];
      });

      describe('when there is an error', () => {
        beforeEach(() => {
          createCallback('error', null);
        });

        it('should return with an error', () => {
          expect(bot.reply.args[0][1]).to.equal('Error: error');
        });
      });

      describe('when it is successful', () => {
        beforeEach(() => {
          createCallback(null, { id: 'bogusId' });
        });

        it('should return success with link to created opportunity', () => {
          expect(bot.reply.args[0][1]).to.equal(`Success: [oppName blah](${baseUrl}bogusId)`);
        });
      });
    });
  });
});
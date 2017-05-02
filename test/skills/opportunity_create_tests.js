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
    expect(controller.hears.args[0][0]).to.deep.equal(['^opp create <(.*)> <(.*)> <(.*)>$']);
    expect(controller.hears.args[0][1]).to.equal('direct_message');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let message;
    let listenerCallback;
    let userCallback;
    let create;
    let execute;
    let find;

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
      create = sinon.stub();
      execute = sinon.spy((cb) => {
        userCallback = cb;
      });
      find = sinon.spy(() => ({ execute }));
      jsforceConn.sobject = sinon.stub();
      jsforceConn.sobject.withArgs('Opportunity').returns({ create });
      jsforceConn.sobject.withArgs('User').returns({ find });

      listenerCallback = controller.hears.args[0][2];
      listenerCallback(bot, message);
    });

    describe('user lookup', () => {
      it('calls jsforce query chain', () => {
        expect(find.calledOnce).to.be.true;
        expect(find.args[0][0]).to.deep.equal({ Email: 'somebody@example.com' });
        expect(execute.calledOnce).to.be.true;
        expect(execute.args[0][0]).to.be.a('Function');
      });

      describe('when successful', () => {
        beforeEach(() => {
          userCallback(null, [{ Id: 'userId' }]);
        });

        it('should create sobject', () => {
          expect(create.calledOnce).to.be.true;
          expect(create.args[0][0]).to.deep.equal({
            Name: 'oppName blah',
            StageName: 'stageName blah',
            CloseDate: 'closeDate blah',
            OwnerId: 'userId',
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

      describe('when unsuccessful', () => {
        beforeEach(() => {
          userCallback('Nooo!', null);
        });

        it('should return with an error', () => {
          expect(bot.reply.args[0][1]).to.equal('Error finding user: Nooo!');
        });
      });
    });
  });
});

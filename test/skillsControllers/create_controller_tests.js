const sinon = require('sinon');
const expect = require('chai').expect;
const createController = require('../../src/skillsControllers/create_controller.js');

describe('create controller ', () => {
  const table = 'TableName';
  const description = 'Entity';
  const entity = {
    field: 'value',
    Name: 'Great Name',
  };
  const userEmail = 'somebody@example.com';
  const baseUrl = 'yes.url/';
  let bot;
  let message;
  let create;
  let execute;
  let find;
  let jsforceConn;

  beforeEach(() => {
    bot = { reply: sinon.stub() };
    message = {
      user: userEmail,
    };
    create = sinon.stub();
    execute = sinon.stub();
    find = sinon.stub();

    jsforceConn = {};
    jsforceConn.sobject = sinon.stub();
    jsforceConn.sobject.withArgs(table).returns({ create });
    jsforceConn.sobject.withArgs('User').returns({ find });
    find.withArgs({ Email: userEmail }).returns({ execute });

    process.env.base_url = baseUrl;

    createController.replyWithStatus(table, entity, description, bot, message, jsforceConn);
  });

  afterEach(() => {
    delete process.env.base_url;
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
        const userCallback = execute.args[0][0];

        userCallback(null, [{ Id: 'userId' }]);
      });

      it('should create sobject with userId added as owner', () => {
        expect(create.calledOnce).to.be.true;
        const expectedEntity = { field: 'value', Name: 'Great Name', OwnerId: 'userId' };
        expect(create.args[0][0]).to.deep.equal(expectedEntity);
        expect(create.args[0][1]).to.be.a('Function');
      });

      describe('create entity callback', () => {
        let createCallback;
        beforeEach(() => {
          createCallback = create.args[0][1];
        });

        describe('when there is an error', () => {
          beforeEach(() => {
            createCallback('error', null);
          });

          it('should return with an error', () => {
            expect(bot.reply.args[0][1]).to.equal('Sorry, I could not create the Entity. error');
          });
        });

        describe('when it is successful', () => {
          beforeEach(() => {
            createCallback(null, { id: 'bogusId' });
          });

          it('should return success with link to created entity', () => {
            expect(bot.reply.args[0][1]).to.equal(`Success, Entity created: [bogusId](${baseUrl}/bogusId)`);
          });
        });
      });
    });

    describe('when unsuccessful', () => {
      beforeEach(() => {
        const userCallback = execute.args[0][0];
        userCallback('Nooo!', null);
      });

      it('should return with an error', () => {
        expect(bot.reply.args[0][1]).to.equal('Sorry, I could not create the Entity. Nooo!');
      });
    });
  });
});

const statusController = require('../../src/skillsControllers/status_controller.js');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('status controller', () => {
  const jsforceConn = {};
  let sobject;
  let error;
  let bot;
  let message;
  let retrieve;
  const entity = {
    AttributeOne: 'test 01',
    AttributeTwo: 'Get Creative!',
  };

  beforeEach(() => {
    bot = { reply: sinon.spy() };
    message = { match: [null, 'leadId'] };

    retrieve = sinon.spy((id, callback) => {
      callback(error, entity);
    });

    sobject = sinon.stub().returns({ retrieve });
    jsforceConn.sobject = sobject;
    process.env.base_url = 'awesomesauce.com/';
  });

  afterEach(() => {
    delete process.env.base_url;
  });

  it('should call jsforceConn\'s sobject method for the supplied object type', () => {
    statusController.replyWithStatus('entity', 'entity_id', ['AttributeOne', 'AttributeTwo'], bot, message, jsforceConn);
    expect(sobject.calledOnce).to.be.true;
    expect(sobject.args[0][0]).to.equal('entity');
  });

  it('calls jsforce connection\'s retrieve method', () => {
    statusController.replyWithStatus('entity', 'entity_id', ['AttributeOne', 'AttributeTwo'], bot, message, jsforceConn);
    expect(retrieve.calledOnce).to.be.true;
    expect(retrieve.args[0][0]).to.deep.equal('entity_id');
  });

  describe('when given a valid object id', () => {
    it('should reply with the object details', () => {
      statusController.replyWithStatus('entity', 'entity_id', ['AttributeOne', 'AttributeTwo'], bot, message, jsforceConn);
      expect(bot.reply.calledOnce).to.be.true;
      expect(bot.reply.args[0][0]).to.equal(message);
      const responseMessage = bot.reply.args[0][1];
      const messageParts = responseMessage.split('*');
      expect(messageParts.length).to.equal(3);
      expect(messageParts[0]).to.equal('Information for entity: [entity_id](awesomesauce.com/entity_id)\n');
      expect(messageParts[1]).to.equal(' Attribute One: test 01\n');
      expect(messageParts[2]).to.equal(' Attribute Two: Get Creative!\n');
    });
  });
});

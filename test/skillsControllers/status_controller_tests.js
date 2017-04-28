const statusController = require('../../src/skillsControllers/status_controller.js');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('status controller reply', () => {
  describe('replyWithStatus', () => {
    const jsforceConn = {};
    let sobject;
    let bot;
    let message;
    let retrieve;
    const entity = {
      AttributeOne: 'test 01',
      AttributeTwo: 'Get Creative!',
    };
    const entityAttributes = {
      AttributeOne: 'Attribute One',
      AttributeTwo: 'Attribute Two',
    };
    beforeEach(() => {
      bot = { reply: sinon.spy() };
      message = { match: [null, 'entity_id'] };

      retrieve = sinon.stub();
      sobject = sinon.stub().returns({ retrieve });
      jsforceConn.sobject = sobject;
      process.env.base_url = 'awesomesauce.com/';
      statusController.replyWithStatus('entity', 'entity_id', entityAttributes, bot, message, jsforceConn);
    });

    afterEach(() => {
      delete process.env.base_url;
    });

    it('should call jsforceConn\'s sobject method for the supplied object type', () => {
      expect(sobject.calledOnce).to.be.true;
      expect(sobject.args[0][0]).to.equal('entity');
    });

    it('calls jsforce connection\'s retrieve method', () => {
      expect(retrieve.calledOnce).to.be.true;
      expect(retrieve.args[0][0]).to.deep.equal('entity_id');
      expect(retrieve.args[0][1]).to.be.a('Function');
    });

    describe('retrieve callback', () => {
      let retrieveCallback;
      beforeEach(() => {
        retrieveCallback = retrieve.args[0][1];
      });

      it('should reply with the object details when retrieve is successfull', () => {
        retrieveCallback(null, entity);
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        const responseMessage = bot.reply.args[0][1];
        const messageParts = responseMessage.split('*');
        expect(messageParts.length).to.equal(3);
        expect(messageParts[0]).to.equal('Information for entity: [entity_id](awesomesauce.com/entity_id)\n');
        expect(messageParts[1]).to.equal(' Attribute One: test 01\n');
        expect(messageParts[2]).to.equal(' Attribute Two: Get Creative!\n');
      });

      [null, undefined, ''].forEach((blankValue) => {
        it('should give empty fields blank values when there is an empty value set', () => {
          retrieveCallback(null, { AttributeOne: 'a value', AttributeTwo: blankValue });
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          const responseMessage = bot.reply.args[0][1];
          const messageParts = responseMessage.split('*');
          expect(messageParts.length).to.equal(3);
          expect(messageParts[0]).to.equal('Information for entity: [entity_id](awesomesauce.com/entity_id)\n');
          expect(messageParts[1]).to.equal(' Attribute One: a value\n');
          expect(messageParts[2]).to.equal(' Attribute Two: \n');
        });
      });

      it('should give empty fields blank values when there is no value set', () => {
        retrieveCallback(null, { AttributeOne: 'a value' });
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        const responseMessage = bot.reply.args[0][1];
        const messageParts = responseMessage.split('*');
        expect(messageParts.length).to.equal(3);
        expect(messageParts[0]).to.equal('Information for entity: [entity_id](awesomesauce.com/entity_id)\n');
        expect(messageParts[1]).to.equal(' Attribute One: a value\n');
        expect(messageParts[2]).to.equal(' Attribute Two: \n');
      });

      it('should give field false value when value is false', () => {
        retrieveCallback(null, { AttributeOne: 'a value', AttributeTwo: false });
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        const responseMessage = bot.reply.args[0][1];
        const messageParts = responseMessage.split('*');
        expect(messageParts.length).to.equal(3);
        expect(messageParts[0]).to.equal('Information for entity: [entity_id](awesomesauce.com/entity_id)\n');
        expect(messageParts[1]).to.equal(' Attribute One: a value\n');
        expect(messageParts[2]).to.equal(' Attribute Two: false\n');
      });


      it('should reply with error message when retrieve is unsuccessful', () => {
        retrieveCallback('custom error', null);
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0]).to.deep.equal([message, 'Sorry, I was unable to retrieve the entity: entity_id. custom error']);
      });
    });
  });
});

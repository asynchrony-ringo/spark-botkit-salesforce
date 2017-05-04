const updateAlertDifferenceGatherer = require('./update_alert_difference_gatherer.js');

const validateEntity = entity => entity.attributes && entity.attributes.type && entity.Id;

const validateEntitiesConsistent = (newEntity, oldEntity) =>
  newEntity.Id === oldEntity.Id && newEntity.attributes.type === oldEntity.attributes.type;

const updateAlertController = {
  messageOwner: (newEntity, oldEntity, controller, jsforceConn) => {
    if (newEntity.OwnerId && oldEntity.CreatedDate) {
      jsforceConn.sobject('User').retrieve(newEntity.OwnerId, (userRetrievalError, user) => {
        if (userRetrievalError) {
          console.log(`Error retrieving user ${newEntity.OwnerId}:`, userRetrievalError);
          return;
        }
        const bot = controller.spawn({});

        bot.startPrivateConversation({ user: user.Email },
          (startConversationError, conversation) => {
            if (startConversationError) {
              console.log(`Error starting conversation with ${user.Email}:`, startConversationError);
              return;
            }
            const diff = updateAlertDifferenceGatherer.formatMessage(newEntity, oldEntity);
            conversation.say(`The ${newEntity.attributes.type} [${newEntity.Id}](${process.env.base_url}/${newEntity.Id}) has been updated!\n${diff}`);
          });
      });
    }
  },
  isValid: (newEntities, oldEntities) => {
    if (!Array.isArray(newEntities) || !Array.isArray(oldEntities)) {
      return false;
    }
    if (newEntities.length !== oldEntities.length) {
      return false;
    }
    for (let i = 0; i < newEntities.length; i += 1) {
      const oldEntity = oldEntities[i];
      const newEntity = newEntities[i];
      if (!validateEntity(newEntity)
        || !validateEntity(oldEntity)
        || !validateEntitiesConsistent(newEntity, oldEntity)) {
        return false;
      }
    }
    return true;
  },
};

module.exports = updateAlertController;

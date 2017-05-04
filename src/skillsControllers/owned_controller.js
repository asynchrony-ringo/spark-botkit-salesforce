const createMessage = (entities, description) => {
  const maxEntityCount = 10;

  if (entities.length === 0) {
    return `Found no ${description}.`;
  }

  let message;
  let entityList;
  if (entities.length <= maxEntityCount) {
    message = `Found ${entities.length} ${description}:\n`;
    entityList = entities;
  } else {
    message = `Found ${entities.length} ${description}. Here are the most recent ${maxEntityCount}:\n`;
    entityList = entities.slice(0, maxEntityCount);
  }

  entityList.forEach((entity) => {
    message += `* [${entity.Id}](${process.env.base_url}/${entity.Id}): ${entity.Name}\n`;
  });

  return message;
};

const ownedController = {
  replyWithStatus: (objectType, description, bot, message, jsforceConn) => {
    jsforceConn.sobject('User')
      .find({ Email: message.user })
      .execute((userError, users) => {
        if (userError) {
          bot.reply(message, `Sorry, I was unable to retrieve your assigned ${description}. ${userError}`);
          return;
        }

        const user = users[0];
        jsforceConn.sobject(objectType)
          .find({ OwnerId: user.Id })
          .sort({ CreatedDate: -1 })
          .execute((entitiesError, ownedEntities) => {
            if (entitiesError) {
              bot.reply(message, `Sorry, I was unable to retrieve your assigned ${description}. ${entitiesError}`);
              return;
            }

            bot.reply(message, createMessage(ownedEntities, description));
          });
      });
  },
};

module.exports = ownedController;

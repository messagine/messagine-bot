import { getChatId, getLanguage, IMessagineContext } from '../lib/common';
import { addUser, getUser } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';

const startCommand = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.start}`);
  ctx.mixpanel.people.set({
    first_name: ctx.from?.first_name,
    language_code: ctx.from?.language_code,
    last_name: ctx.from?.last_name,
    username: ctx.from?.username,
  });

  const chatId = getChatId(ctx);

  const user = await getUser(chatId);
  if (!user) {
    const language = getLanguage(ctx);
    const addUserPromise = addUser(chatId, language.lang);
    const messageParts = [
      'Welcome to Messagine Bot.',
      `To find new chat, type /${commandEnum.findChat} command.`,
      `Your language is ${language.name}, to change your language type /${commandEnum.setLanguage}.`,
    ];
    const message = messageParts.join(' ');
    const replyPromise = ctx.reply(message);
    return await Promise.all([addUserPromise, replyPromise]);
  } else {
    return await ctx.reply(`Welcome back. To find new chat, type /${commandEnum.findChat} command.`);
  }
};

export { startCommand };

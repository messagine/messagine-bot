import { getChatId, getLanguage, IMessagineContext } from '../lib/common';
import { addUser } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';

const startCommand = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.start}`);
  ctx.mixpanel.people.set({
    first_name: ctx.from?.first_name,
    language_code: ctx.from?.language_code,
    last_name: ctx.from?.last_name,
    username: ctx.from?.username,
  });

  const user = ctx.user;
  if (!user) {
    const chatId = getChatId(ctx);
    const language = getLanguage(ctx);
    const addUserPromise = addUser(chatId, language.lang);
    const replyPromise = ctx.reply(
      ctx.i18n.t('new_user', {
        findChatCommand: commandEnum.findChat,
        languageNativeName: language.native_name,
        setLanguageCommand: commandEnum.setLanguage,
      }),
    );
    return await Promise.all([addUserPromise, replyPromise]);
  } else {
    return await ctx.reply(ctx.i18n.t('welcome_back', { findChatCommand: commandEnum.findChat }));
  }
};

export { startCommand };

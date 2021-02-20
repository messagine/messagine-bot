import { getChatId, getLanguage, IMessagineContext } from '../lib/common';
import { addUser } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';
import { newUserReply, welcomeBackReply } from '../reply';

const startCommand = () => (ctx: IMessagineContext) => {
  return onStart(ctx);
};

const startAction = () => (ctx: IMessagineContext) => {
  return Promise.all([ctx.deleteMessage(), onStart(ctx), ctx.answerCbQuery()]);
};

async function onStart(ctx: IMessagineContext) {
  await ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.start}`);
  const user = ctx.user;
  if (!user) {
    const chatId = getChatId(ctx);
    const language = getLanguage(ctx);
    await ctx.mixpanel.people.set({
      first_name: ctx.from?.first_name,
      language_code: language.lang,
      last_name: ctx.from?.last_name,
      signup_date: new Date(),
      username: ctx.from?.username,
    });
    const addUserPromise = addUser(chatId, language.lang);
    const replyPromise = newUserReply(ctx, language.native_name);
    return Promise.all([addUserPromise, replyPromise]);
  } else {
    return welcomeBackReply(ctx);
  }
}

export { startAction, startCommand };

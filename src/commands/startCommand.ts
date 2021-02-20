import { getChatId, getLanguage, IMessagineContext } from '../lib/common';
import { addUser } from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';
import { newUserReply, welcomeBackReply } from '../reply';

const startCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.start}`);
  return Promise.all([mixPanelPromise, onStart(ctx)]);
};

const startAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${commandEnum.start}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), onStart(ctx), ctx.answerCbQuery()]);
};

function onStart(ctx: IMessagineContext) {
  const user = ctx.user;
  if (!user) {
    const chatId = getChatId(ctx);
    const language = getLanguage(ctx);
    const mixpanelPeopleSetPromise = ctx.mixpanel.people.set({
      first_name: ctx.from?.first_name,
      language_code: language.lang,
      last_name: ctx.from?.last_name,
      signup_date: new Date(),
      username: ctx.from?.username,
    });
    const addUserPromise = addUser(chatId, language.lang);
    const replyPromise = newUserReply(ctx, language.native_name);
    return Promise.all([mixpanelPeopleSetPromise, addUserPromise, replyPromise]);
  } else {
    return welcomeBackReply(ctx);
  }
}

export { startAction, startCommand };

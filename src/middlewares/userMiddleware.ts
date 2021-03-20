import { getChatId, getUserInfo, IMessagineContext } from '../lib/common';

const userMiddleware = async (ctx: IMessagineContext, next: any): Promise<void> => {
  if (ctx.message?.from?.is_bot) {
    return;
  }
  const chatId = getChatId(ctx);
  const userInfo = await getUserInfo(chatId);
  ctx.userState = userInfo.state;
  if (userInfo.lobby) {
    ctx.lobby = userInfo.lobby;
  } else if (userInfo.chat) {
    ctx.currentChat = userInfo.chat;
  }

  if (userInfo.user) {
    ctx.user = userInfo.user;
    ctx.i18n.locale(userInfo.user.languageCode);
    if (ctx.user.blocked || ctx.user.banned) {
      return;
    }
  }
  await next();
};

export { userMiddleware };

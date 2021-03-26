import Debug from 'debug';
import { getChatId, getUserInfo, IMessagineContext } from '../lib/common';
const debug = Debug('middleware:user');

const userMiddleware = async (ctx: IMessagineContext, next: any): Promise<void> => {
  if (ctx.message?.from?.is_bot) {
    debug('Rejected bot request');
    return;
  }
  const chatId = getChatId(ctx);
  const userInfo = await getUserInfo(ctx, chatId);
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
      debug('Rejected blocked/banned request');
      return;
    }
  }
  await next();
};

export { userMiddleware };

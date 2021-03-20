import { IMessagineContext } from '../lib/common';

const catcherMiddleware = async (ctx: IMessagineContext, next: any): Promise<void> => {
  try {
    await next();
  } catch (e) {
    await ctx.reply(e.message, e?.extra);
  }
};

export { catcherMiddleware };

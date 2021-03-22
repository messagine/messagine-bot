import { IMessagineContext } from '../lib/common';
import { DataHandler } from '../lib/dataHandler';

const dbMiddleware = async (ctx: IMessagineContext, next: any) => {
  ctx.db = new DataHandler();
  await ctx.db.connect();
  await next();
};

export { dbMiddleware };

import Debug from 'debug';
import { IMessagineContext } from '../lib/common';
const debug = Debug('middleware:responseTimeLogger');

const responseTimeLoggerMiddleware = async (_: IMessagineContext, next: any): Promise<void> => {
  const logStart = new Date();
  await next();
  const ms = new Date().getTime() - logStart.getTime();
  debug('Response time: %sms', ms);
};

export { responseTimeLoggerMiddleware };

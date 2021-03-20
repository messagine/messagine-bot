import { IMessagineContext } from '../lib/common';

const responseTimeLoggerMiddleware = async (_: IMessagineContext, next: any): Promise<void> => {
  const logStart = new Date();
  await next();
  const ms = new Date().getTime() - logStart.getTime();
  // tslint:disable-next-line: no-console
  console.log('Response time: %sms', ms);
};

export { responseTimeLoggerMiddleware };

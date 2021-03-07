import { Handler } from 'aws-lambda';
import { status, webhook } from './lib';
import { internalServerError } from './lib/responses';

export const statusHandler: Handler = async () => {
  try {
    return await status();
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.error(e.message);
    return internalServerError();
  }
};

export const webhookHandler: Handler = async (event: any) => {
  try {
    // tslint:disable-next-line: no-console
    console.debug(event);
    return await webhook(event);
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.error(e.message);
    return internalServerError();
  }
};

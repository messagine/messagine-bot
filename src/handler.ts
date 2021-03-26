import * as Sentry from '@sentry/node';
import { Handler } from 'aws-lambda';
import config from './config';
import { createChatJob, status, webhook } from './lib';
import { ok } from './lib/responses';

export const statusHandler: Handler = async () => {
  Sentry.init({ dsn: config.SENTRY_DSN, tracesSampleRate: 0.2, environment: config.NODE_ENV });
  const transaction = Sentry.startTransaction({
    name: 'Status Transaction',
    op: 'status',
  });
  try {
    return await status();
  } catch (e) {
    Sentry.captureException(e);
    return ok();
  } finally {
    transaction.finish();
  }
};

export const webhookHandler: Handler = async (event: any) => {
  const user = getTelegramUserForSentry(event);
  Sentry.init({ dsn: config.SENTRY_DSN, tracesSampleRate: 0.2, environment: config.NODE_ENV });
  Sentry.setUser(user);
  const transaction = Sentry.startTransaction({
    name: 'Webhook Transaction',
    op: 'webhook',
  });
  try {
    // tslint:disable-next-line: no-console
    console.debug(event);
    return await webhook(event);
  } catch (e) {
    Sentry.captureException(e);
    return ok();
  } finally {
    transaction.finish();
  }
};

export const createChatJobHandler: Handler = async () => {
  Sentry.init({ dsn: config.SENTRY_DSN, tracesSampleRate: 0.2, environment: config.NODE_ENV });
  const transaction = Sentry.startTransaction({
    name: 'Create Chat Job',
    op: 'createChatJob',
  });
  try {
    return await createChatJob();
  } catch (e) {
    Sentry.captureException(e);
    return ok();
  } finally {
    transaction.finish();
  }
};

function getTelegramUserForSentry(event: any): Sentry.User | null {
  const body = JSON.parse(event.body);
  if (body.message) {
    return body.message?.chat;
  }
  if (body.callback_query) {
    return body.callback_query?.message?.chat;
  }
  if (body.edited_message) {
    return body.edited_message?.chat;
  }
  return null;
}

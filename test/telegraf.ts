import test from 'ava';
import Sinon from 'sinon';
import sinon from 'sinon';
import Telegraf from 'telegraf';
import { Context as TelegrafContext } from 'telegraf';
import { Message } from 'telegraf/typings/telegram-types';
import { startCommand } from '../src/commands';
import { IMessagineContext } from '../src/lib/common';
import { DataHandler } from '../src/lib/dataHandler';
import User, { IUser } from '../src/lib/models/User';
import { dbMiddleware, userMiddleware } from '../src/middlewares';
import { FakeI18n, FakeMixpanel } from './fakes';

const BaseTextMessage: Message = {
  chat: { id: 1, type: 'private' },
  date: Date.now(),
  message_id: 1,
  text: 'foo',
};

function getUser(): IUser {
  const user = new User();
  user.chatId = 1;
  user.languageCode = 'en';
  return user;
}

let sandbox: Sinon.SinonSandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('handle new user start', async t => {
  const user = getUser();
  sandbox.stub(TelegrafContext.prototype, 'reply').resolves();
  sandbox.stub(DataHandler.prototype, 'connect').resolves();
  sandbox.stub(DataHandler.prototype, 'getUser').withArgs(1).resolves(null);
  sandbox.stub(DataHandler.prototype, 'findLobby').withArgs(1).resolves(null);
  sandbox.stub(DataHandler.prototype, 'findExistingChat').withArgs(1).resolves(null);
  sandbox.stub(DataHandler.prototype, 'addUser').withArgs(1, 'en').resolves(user);

  const bot = new Telegraf<IMessagineContext>('');
  bot.use(dbMiddleware);
  bot.use(async (ctx, next) => {
    ctx.mixpanel = new FakeMixpanel();
    ctx.i18n = new FakeI18n();
    await next();
  });
  bot.use(userMiddleware);
  bot.use(async (ctx, next) => {
    await next();
    t.is(ctx.chat?.id, 1);
    t.is(ctx.userState, 'idle');
  });

  bot.on('message', startCommand());
  await bot.handleUpdate({ message: BaseTextMessage, update_id: 1 });
});

test('handle existing user start', async t => {
  const user = getUser();

  sandbox.stub(TelegrafContext.prototype, 'reply').resolves();
  sandbox.stub(DataHandler.prototype, 'connect').resolves();
  sandbox.stub(DataHandler.prototype, 'getUser').withArgs(1).resolves(user);
  sandbox.stub(DataHandler.prototype, 'findLobby').withArgs(1).resolves(null);
  sandbox.stub(DataHandler.prototype, 'findExistingChat').withArgs(1).resolves(null);

  const bot = new Telegraf<IMessagineContext>('');
  bot.use(dbMiddleware);
  bot.use(async (ctx, next) => {
    ctx.mixpanel = new FakeMixpanel();
    ctx.i18n = new FakeI18n();
    await next();
  });
  bot.use(userMiddleware);
  bot.use(async (ctx, next) => {
    await next();
    t.is(ctx.chat?.id, 1);
    t.is(ctx.userState, 'idle');
  });

  bot.on('message', startCommand());
  await bot.handleUpdate({ message: BaseTextMessage, update_id: 1 });
});

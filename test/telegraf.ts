import test from 'ava';
import sinon from 'sinon';
import Telegraf, { Context as TelegrafContext } from 'telegraf';
import { Message } from 'telegraf/typings/telegram-types';
import { startCommand } from '../src/commands';
import { IMessagineContext } from '../src/lib/common';
import { DataHandler } from '../src/lib/dataHandler';
import User, { IUser } from '../src/lib/models/User';
import { dbMiddleware, userMiddleware } from '../src/middlewares';
import { fakeI18nMiddleware, fakeMixpanelMiddleware } from './fakes';

const BaseTextMessage: Message = {
  chat: { id: 1, type: 'private' },
  date: Date.now(),
  message_id: 1,
  text: 'foo',
};

const BotMessage: Message = {
  chat: { id: 1, type: 'private' },
  date: Date.now(),
  from: { id: 1, is_bot: true, first_name: 'Bot' },
  message_id: 1,
  text: 'foo',
};

function createBot() {
  const bot = new Telegraf<IMessagineContext>('');
  bot.use(dbMiddleware);
  bot.use(fakeMixpanelMiddleware);
  bot.use(fakeI18nMiddleware);
  bot.use(userMiddleware);
  return bot;
}

function getUser(): IUser {
  const user = new User();
  user.chatId = 1;
  user.languageCode = 'en';
  return user;
}

function getAddUserStub() {
  const user = getUser();
  const addUserStub = sandbox.stub(DataHandler.prototype, 'addUser');
  addUserStub.withArgs(1, 'en').resolves(user);
  return addUserStub;
}

function setupIdleUser() {
  sandbox.stub(DataHandler.prototype, 'findLobby').withArgs(1).resolves(null);
  sandbox.stub(DataHandler.prototype, 'findExistingChat').withArgs(1).resolves(null);
}

let sandbox: sinon.SinonSandbox;
let replyStub: sinon.SinonStub;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
  sandbox.stub(DataHandler.prototype, 'connect').resolves();
  replyStub = sandbox.stub(TelegrafContext.prototype, 'reply');
  replyStub.resolves();
});

test.afterEach(() => {
  sandbox.restore();
});

test('handle new user start', async t => {
  sandbox.stub(DataHandler.prototype, 'getUser').withArgs(1).resolves(null);
  setupIdleUser();
  const addUserStub = getAddUserStub();

  const bot = createBot();
  bot.use(async (ctx, next) => {
    await next();
    t.is(ctx.chat?.id, 1);
    t.is(ctx.userState, 'idle');
  });

  bot.on('message', startCommand());
  await bot.handleUpdate({ message: BaseTextMessage, update_id: 1 });
  sinon.assert.calledOnce(addUserStub);
});

test('handle existing user start', async t => {
  const user = getUser();

  sandbox.stub(DataHandler.prototype, 'getUser').withArgs(1).resolves(user);
  setupIdleUser();
  const addUserStub = getAddUserStub();

  const bot = createBot();
  bot.use(async (ctx, next) => {
    await next();
    t.is(ctx.chat?.id, 1);
    t.is(ctx.userState, 'idle');
  });

  bot.on('message', startCommand());
  await bot.handleUpdate({ message: BaseTextMessage, update_id: 1 });
  sinon.assert.notCalled(addUserStub);
});

test('reject bot', async t => {
  sandbox.stub(DataHandler.prototype, 'getUser').withArgs(1).resolves(null);
  const addUserStub = getAddUserStub();

  const bot = createBot();

  bot.on('message', startCommand());
  await bot.handleUpdate({ message: BotMessage, update_id: 1 });
  t.true(true);
  sinon.assert.notCalled(addUserStub);
  sinon.assert.notCalled(replyStub);
});

test('reject blocked user', async t => {
  const user = getUser();
  user.blocked = true;

  sandbox.stub(DataHandler.prototype, 'getUser').withArgs(1).resolves(user);
  setupIdleUser();
  const addUserStub = getAddUserStub();

  const bot = createBot();

  bot.on('message', startCommand());
  await bot.handleUpdate({ message: BotMessage, update_id: 1 });
  t.true(true);
  sinon.assert.notCalled(addUserStub);
  sinon.assert.notCalled(replyStub);
});

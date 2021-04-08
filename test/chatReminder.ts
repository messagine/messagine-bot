import test from 'ava';
import sinon from 'sinon';
import Telegraf, { Telegram } from 'telegraf';
import { getRelativeDays, IMessagineContext } from '../src/lib/common';
import { DataHandler } from '../src/lib/dataHandler';
import Chat, { IChat } from '../src/lib/models/Chat';
import Lobby, { ILobby } from '../src/lib/models/Lobby';
import User, { IUser } from '../src/lib/models/User';
import { chatReminderMiddleware, dbMiddleware } from '../src/middlewares';
import { fakeI18nMiddleware } from './fakes';

function getUser(): IUser {
  const user = new User();
  user.chatId = 1;
  user.languageCode = 'en';
  return user;
}

function stubRemindableUser() {
  const user = getUser();
  user.nextReminder = getRelativeDays(-1);
  sandbox.stub(DataHandler.prototype, 'getRemindableUsers').resolves([user]);
}

function createLobby(chatId: number, languageCode: string): ILobby {
  const lobby = new Lobby();
  lobby.chatId = chatId;
  lobby.languageCode = languageCode;
  return lobby;
}

function createChat(chatIds: number[], languageCode: string): IChat {
  const chat = new Chat();
  chat.chatIds = chatIds;
  chat.languageCode = languageCode;
  return chat;
}

function createBot() {
  const bot = new Telegraf<IMessagineContext>('');
  bot.use(dbMiddleware);
  bot.use(fakeI18nMiddleware);
  bot.use(chatReminderMiddleware);
  return bot;
}

let sandbox: sinon.SinonSandbox;
let clearReminderStub: sinon.SinonStub;
let addReminderStub: sinon.SinonStub;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
  sandbox.stub(DataHandler.prototype, 'connect').resolves();
  sandbox.stub(Telegram.prototype, 'sendMessage').resolves();
  clearReminderStub = sandbox.stub(DataHandler.prototype, 'clearReminder');
  addReminderStub = sandbox.stub(DataHandler.prototype, 'addReminder');
});

test.afterEach(() => {
  sandbox.restore();
});

test('handle not remindable users', async t => {
  sandbox.stub(DataHandler.prototype, 'getRemindableUsers').resolves(null);
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves(null);
  sandbox.stub(DataHandler.prototype, 'getAllChatUsers').resolves(null);

  const bot = createBot();
  await bot.handleUpdate({ update_id: 0 });

  t.true(true);
  sinon.assert.notCalled(clearReminderStub);
  sinon.assert.notCalled(addReminderStub);
});

test('handle idle user', async t => {
  stubRemindableUser();
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves(null);
  sandbox.stub(DataHandler.prototype, 'getAllChatUsers').resolves(null);

  const bot = createBot();
  await bot.handleUpdate({ update_id: 0 });

  t.true(true);
  sinon.assert.calledOnce(clearReminderStub);
  sinon.assert.calledOnce(addReminderStub);
});

test('handle lobby user', async t => {
  const lobby = createLobby(1, 'en');

  stubRemindableUser();
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves([lobby]);
  sandbox.stub(DataHandler.prototype, 'getAllChatUsers').resolves(null);

  const bot = createBot();
  await bot.handleUpdate({ update_id: 0 });

  t.true(true);
  sinon.assert.calledOnce(clearReminderStub);
  sinon.assert.calledOnce(addReminderStub);
});

test('handle chat user', async t => {
  const chat = createChat([1, 2], 'en');

  stubRemindableUser();
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves(null);
  sandbox.stub(DataHandler.prototype, 'getAllChatUsers').resolves([chat]);

  const bot = createBot();
  await bot.handleUpdate({ update_id: 0 });

  t.true(true);
  sinon.assert.calledOnce(clearReminderStub);
  sinon.assert.calledOnce(addReminderStub);
});

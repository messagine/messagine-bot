import test from 'ava';
import sinon from 'sinon';
import Telegraf, { Telegram } from 'telegraf';
import { IMessagineContext } from '../src/lib/common';
import { DataHandler } from '../src/lib/dataHandler';
import Chat from '../src/lib/models/Chat';
import Lobby, { ILobby } from '../src/lib/models/Lobby';
import PreviousChat from '../src/lib/models/PreviousChat';
import { createChatMiddleware, dbMiddleware } from '../src/middlewares';
import { fakeI18nMiddleware } from './fakes';

function createBot() {
  const bot = new Telegraf<IMessagineContext>('');
  bot.use(dbMiddleware);
  bot.use(fakeI18nMiddleware);
  bot.use(createChatMiddleware);
  return bot;
}

let sandbox: sinon.SinonSandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
  sandbox.stub(DataHandler.prototype, 'connect').resolves();
  sandbox.stub(Telegram.prototype, 'sendMessage').resolves();
});

test.afterEach(() => {
  sandbox.restore();
});

test('handle empty lobby', async t => {
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves(null);
  const chat = new Chat();
  chat.chatIds = [1, 2];
  chat.languageCode = 'en';
  const createChatStub = sandbox.stub(DataHandler.prototype, 'createChat');
  createChatStub.resolves(chat);

  const bot = createBot();
  bot.use(async (ctx, next) => {
    await next();
    t.assert('message' in ctx);
    sinon.assert.notCalled(createChatStub);
  });

  await bot.handleUpdate({ update_id: 0 });
});

test('handle multiple users without chat lobby', async t => {
  const lobby1 = new Lobby();
  lobby1.chatId = 1;
  lobby1.languageCode = 'en';
  const lobby2 = new Lobby();
  lobby2.chatId = 2;
  lobby2.languageCode = 'tr';
  const lobby3 = new Lobby();
  lobby3.chatId = 3;
  lobby3.languageCode = 'fr';
  const lobbies: ILobby[] = [lobby1, lobby2, lobby3];
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves(lobbies);
  sandbox.stub(DataHandler.prototype, 'getUsersPreviousChats').resolves(null);
  const chat = new Chat();
  chat.chatIds = [1, 2];
  chat.languageCode = 'en';
  const createChatStub = sandbox.stub(DataHandler.prototype, 'createChat');
  createChatStub.resolves(chat);

  const bot = createBot();
  bot.use(async (ctx, next) => {
    await next();
    t.assert('message' in ctx);
    sinon.assert.notCalled(createChatStub);
  });

  await bot.handleUpdate({ update_id: 0 });
});

test('handle users with chat', async t => {
  const lobby1 = new Lobby();
  lobby1.chatId = 1;
  lobby1.languageCode = 'en';
  const lobby2 = new Lobby();
  lobby2.chatId = 2;
  lobby2.languageCode = 'en';
  const lobbies: ILobby[] = [lobby1, lobby2];
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves(lobbies);
  sandbox.stub(DataHandler.prototype, 'getUsersPreviousChats').resolves(null);
  const leaveLobbyStub = sandbox.stub(DataHandler.prototype, 'leaveLobby');
  leaveLobbyStub.resolves(null);
  const chat = new Chat();
  chat.chatIds = [1, 2];
  chat.languageCode = 'en';
  const createChatStub = sandbox.stub(DataHandler.prototype, 'createChat');
  createChatStub.resolves(chat);

  const bot = createBot();
  bot.use(async (ctx, next) => {
    await next();
    t.assert('message' in ctx);
    sinon.assert.calledOnce(createChatStub);
    sinon.assert.calledTwice(leaveLobbyStub);
  });

  await bot.handleUpdate({ update_id: 0 });
});

test('handle users with previous chat', async t => {
  const lobby1 = new Lobby();
  lobby1.chatId = 1;
  lobby1.languageCode = 'en';
  const lobby2 = new Lobby();
  lobby2.chatId = 2;
  lobby2.languageCode = 'en';
  const lobbies: ILobby[] = [lobby1, lobby2];
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves(lobbies);
  const previousChat = new PreviousChat();
  previousChat.chatIds = [1, 2];
  previousChat.closedBy = 1;
  previousChat.languageCode = 'en';
  sandbox.stub(DataHandler.prototype, 'getUsersPreviousChats').resolves([previousChat]);
  const leaveLobbyStub = sandbox.stub(DataHandler.prototype, 'leaveLobby');
  leaveLobbyStub.resolves(null);
  const chat = new Chat();
  chat.chatIds = [1, 2];
  chat.languageCode = 'en';
  const createChatStub = sandbox.stub(DataHandler.prototype, 'createChat');
  createChatStub.resolves(chat);

  const bot = createBot();
  bot.use(async (ctx, next) => {
    await next();
    t.assert('message' in ctx);
    sinon.assert.notCalled(createChatStub);
  });

  await bot.handleUpdate({ update_id: 0 });
});

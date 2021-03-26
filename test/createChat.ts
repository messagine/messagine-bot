import test from 'ava';
import sinon from 'sinon';
import Telegraf, { Telegram } from 'telegraf';
import { IMessagineContext } from '../src/lib/common';
import { DataHandler } from '../src/lib/dataHandler';
import Chat, { IChat } from '../src/lib/models/Chat';
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
  const chat = createChat([1, 2], 'en');
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
  const lobby1 = createLobby(1, 'en');
  const lobby2 = createLobby(2, 'tr');
  const lobby3 = createLobby(3, 'fr');
  const lobbies: ILobby[] = [lobby1, lobby2, lobby3];
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves(lobbies);
  sandbox.stub(DataHandler.prototype, 'getUsersPreviousChats').resolves(null);
  const chat = createChat([1, 2], 'en');
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
  const lobby1 = createLobby(1, 'en');
  const lobby2 = createLobby(2, 'en');
  const lobbies: ILobby[] = [lobby1, lobby2];
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves(lobbies);
  sandbox.stub(DataHandler.prototype, 'getUsersPreviousChats').resolves(null);
  const leaveLobbyStub = sandbox.stub(DataHandler.prototype, 'leaveLobby');
  leaveLobbyStub.resolves(null);
  const chat = createChat([1, 2], 'en');
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

test('handle users with previous chat and chat', async t => {
  const lobby1 = createLobby(1, 'en');
  const lobby2 = createLobby(2, 'en');
  const lobby3 = createLobby(3, 'en');
  const lobbies: ILobby[] = [lobby1, lobby2, lobby3];
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves(lobbies);
  const previousChat = new PreviousChat();
  previousChat.chatIds = [1, 2];
  previousChat.closedBy = 1;
  previousChat.languageCode = 'en';
  sandbox.stub(DataHandler.prototype, 'getUsersPreviousChats').resolves([previousChat]);
  const leaveLobbyStub = sandbox.stub(DataHandler.prototype, 'leaveLobby');
  leaveLobbyStub.resolves(null);
  const chat = createChat([1, 3], 'en');
  const createChatStub = sandbox.stub(DataHandler.prototype, 'createChat');
  createChatStub.withArgs([1, 3], 'en').resolves(chat);

  const bot = createBot();
  bot.use(async (ctx, next) => {
    await next();
    t.assert('message' in ctx);
    sinon.assert.calledOnce(createChatStub);
    sinon.assert.calledTwice(leaveLobbyStub);
  });

  await bot.handleUpdate({ update_id: 0 });
});

test('handle users with multiple chats', async t => {
  const lobby1 = createLobby(1, 'en');
  const lobby2 = createLobby(2, 'en');
  const lobby3 = createLobby(3, 'de');
  const lobby4 = createLobby(4, 'de');
  const lobbies: ILobby[] = [lobby1, lobby2, lobby3, lobby4];
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves(lobbies);
  sandbox.stub(DataHandler.prototype, 'getUsersPreviousChats').resolves(null);
  const leaveLobbyStub = sandbox.stub(DataHandler.prototype, 'leaveLobby');
  leaveLobbyStub.resolves(null);
  const enChat = createChat([1, 2], 'en');
  const deChat = createChat([3, 4], 'de');
  const createChatStub = sandbox.stub(DataHandler.prototype, 'createChat');
  createChatStub.resolves(enChat).resolves(deChat);

  const bot = createBot();
  bot.use(async (ctx, next) => {
    await next();
    t.assert('message' in ctx);
    sinon.assert.calledTwice(createChatStub);
    sinon.assert.callCount(leaveLobbyStub, 4);
  });

  await bot.handleUpdate({ update_id: 0 });
});

test('handle users with previous chat', async t => {
  const lobby1 = createLobby(1, 'en');
  const lobby2 = createLobby(2, 'en');
  const lobbies: ILobby[] = [lobby1, lobby2];
  sandbox.stub(DataHandler.prototype, 'getAllLobbyUsers').resolves(lobbies);
  const previousChat = new PreviousChat();
  previousChat.chatIds = [1, 2];
  previousChat.closedBy = 1;
  previousChat.languageCode = 'en';
  sandbox.stub(DataHandler.prototype, 'getUsersPreviousChats').resolves([previousChat]);
  const leaveLobbyStub = sandbox.stub(DataHandler.prototype, 'leaveLobby');
  leaveLobbyStub.resolves(null);
  const chat = createChat([1, 2], 'en');
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

import test from 'ava';
import sinon from 'sinon';
import Telegraf, { Telegram } from 'telegraf';
import { IMessagineContext } from '../src/lib/common';
import { DataHandler } from '../src/lib/dataHandler';
import Chat from '../src/lib/models/Chat';
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

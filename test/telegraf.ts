import test from 'ava';
import { Telegraf } from 'telegraf';
import { IMessagineContext } from '../src/lib/common';

function createBot() {
  return new Telegraf<IMessagineContext>('TEST');
}

const BaseUpdate = {
  message: {
    chat: { id: 1, type: 'message' },
    date: Date.now(),
    from: { id: 42, first_name: 'bot', is_bot: true },
    message_id: 1,
  },
  update_id: 1,
};

test.cb('should provide chat and sender info', t => {
  const bot = createBot();
  bot.on('message', ctx => {
    t.is(ctx.from?.id, 42);
    t.is(ctx.chat?.id, 1);
    t.end();
  });
  bot.handleUpdate(BaseUpdate);
});

import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
const debug = Debug('message:on_voice');

const onVoiceMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_voice" message.');

  const chatId = getChatId(ctx);
  const messageVoice = ctx.message?.voice;
  if (!messageVoice) {
    throw new MessageTypeNotFoundError(chatId, 'voice');
  }

  const opponentChatId = await getOpponentChatId(chatId);
  return await ctx.tg.sendVoice(opponentChatId, messageVoice.file_id);
};

export { onVoiceMessage };

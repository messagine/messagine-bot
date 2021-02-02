import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getExistingChat, getOpponentChatIds } from '../lib/common';
const debug = Debug('message:on_voice');

const onVoiceMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_voice" message.');

  const chatId = getChatId(ctx);
  const messageVoice = ctx.message?.voice;
  if (!messageVoice) {
    throw new MessageTypeNotFoundError(chatId, 'voice');
  }

  const existingChat = await getExistingChat(chatId);
  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Promise<any>[] = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendVoice(opponentChatId, messageVoice.file_id);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onVoiceMessage };

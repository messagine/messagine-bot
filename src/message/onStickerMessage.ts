import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getExistingChat, getOpponentChatIds } from '../lib/common';
const debug = Debug('message:on_sticker');

const onStickerMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_sticker" message.');

  const chatId = getChatId(ctx);
  const messageSticker = ctx.message?.sticker;
  if (!messageSticker) {
    throw new MessageTypeNotFoundError(chatId, 'sticker');
  }

  const existingChat = await getExistingChat(chatId);
  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Promise<any>[] = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendMessage(opponentChatId, messageSticker.file_id);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onStickerMessage };

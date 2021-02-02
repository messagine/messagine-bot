import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
const debug = Debug('message:on_sticker');

const onStickerMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_sticker" message.');

  const chatId = getChatId(ctx);
  const messageSticker = ctx.message?.sticker;
  if (!messageSticker) {
    throw new MessageTypeNotFoundError(chatId, 'sticker');
  }

  const opponentChatId = await getOpponentChatId(chatId);
  return await ctx.tg.sendMessage(opponentChatId, messageSticker.file_id);
};

export { onStickerMessage };

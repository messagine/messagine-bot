import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { getOpponentChatIds } from '../lib/common';
import { findExistingChat } from '../lib/dataHandler';
import resource from '../resource';
const debug = Debug('bot:on_sticker');

const onStickerMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_sticker" command');

  const chatId = ctx.chat?.id;
  if (!chatId) {
    debug(resource.CHATID_NOT_FOUND);
    return await ctx.reply(resource.CHATID_NOT_FOUND);
  }

  const messageSticker = ctx.message?.sticker;
  if (!messageSticker) {
    debug('Message sticker not found.');
    return await ctx.reply('Message sticker not found.');
  }

  const existingChat = await findExistingChat(chatId);
  if (!existingChat) {
    debug(resource.CHAT_NOT_EXIST);
    return await ctx.reply(resource.CHAT_NOT_EXIST);
  }

  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Array<Promise<any>> = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendMessage(opponentChatId, messageSticker.file_id);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onStickerMessage };

import Debug from 'debug';
import { getOpponentChatIds } from '../lib/common';
import { findExistingChat } from '../lib/dataHandler';
import resource from '../resource';
const debug = Debug('message:on_contact');

// TODO: Fix after telegraf v4 upgrade
const onContactMessage = () => async (ctx: any) => {
  debug('Triggered "on_contact" command');

  const chatId = ctx.chat?.id;
  if (!chatId) {
    debug(resource.CHATID_NOT_FOUND);
    return await ctx.reply(resource.CHATID_NOT_FOUND);
  }

  const messageContact = ctx.message?.contact;
  if (!messageContact) {
    debug('Message contact not found.');
    return await ctx.reply('Message contact not found.');
  }

  const existingChat = await findExistingChat(chatId);
  if (!existingChat) {
    debug(resource.CHAT_NOT_EXIST);
    return await ctx.reply(resource.CHAT_NOT_EXIST);
  }

  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Array<Promise<any>> = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendContact(
      opponentChatId,
      messageContact.phone_number,
      messageContact.first_name,
      messageContact,
    );
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onContactMessage };

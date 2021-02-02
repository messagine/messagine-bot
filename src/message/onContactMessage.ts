import Debug from 'debug';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
const debug = Debug('message:on_contact');

// TODO: Fix after telegraf v4 upgrade
const onContactMessage = () => async (ctx: any) => {
  debug('Triggered "on_contact" message.');

  const chatId = getChatId(ctx);
  const messageContact = ctx.message?.contact;
  if (!messageContact) {
    throw new MessageTypeNotFoundError(chatId, 'contact');
  }

  const opponentChatId = await getOpponentChatId(chatId);
  return await ctx.tg.sendContact(
    opponentChatId,
    messageContact.phone_number,
    messageContact.first_name,
    messageContact,
  );
};

export { onContactMessage };

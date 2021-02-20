import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

// TODO: Fix after telegraf v4 upgrade
const onContactMessage = () => async (ctx: any) => {
  ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.contact}`);

  const chatId = getChatId(ctx);
  const messageContact = ctx.message?.contact;
  if (!messageContact) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.contact);
  }

  const opponentChatId = getOpponentChatId(ctx);
  return await ctx.tg.sendContact(
    opponentChatId,
    messageContact.phone_number,
    messageContact.first_name,
    messageContact,
  );
};

export { onContactMessage };

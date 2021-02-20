import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onLocationMessage = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.location}`);

  const chatId = getChatId(ctx);
  const messageLocation = ctx.message?.location;
  if (!messageLocation) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.location);
  }

  const opponentChatId = getOpponentChatId(ctx);
  const sendMessagePromise = ctx.tg.sendLocation(opponentChatId, messageLocation.latitude, messageLocation.longitude);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onLocationMessage };

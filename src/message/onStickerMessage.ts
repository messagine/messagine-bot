import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onStickerMessage = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.sticker}`);

  const chatId = getChatId(ctx);
  const messageSticker = ctx.message?.sticker;
  if (!messageSticker) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.sticker);
  }

  const opponentChatId = getOpponentChatId(ctx);
  const sendMessagePromise = ctx.tg.sendSticker(opponentChatId, messageSticker.file_id);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onStickerMessage };

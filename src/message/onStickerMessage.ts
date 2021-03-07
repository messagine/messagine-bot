import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onStickerMessage = () => (ctx: IMessagineContext) => {
  const chatId = getChatId(ctx);
  const messageSticker = ctx.message?.sticker;
  if (!messageSticker) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.sticker);
  }

  const fileId = messageSticker.file_id;
  const opponentChatId = getOpponentChatId(ctx);
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.sticker}`, {
    chatId,
    fileId,
    opponentChatId,
  });
  const sendMessagePromise = ctx.tg.sendSticker(opponentChatId, fileId);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onStickerMessage };

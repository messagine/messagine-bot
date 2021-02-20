import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onStickerMessage = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.sticker}`);

  const chatId = getChatId(ctx);
  const messageSticker = ctx.message?.sticker;
  if (!messageSticker) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.sticker);
  }

  const opponentChatId = getOpponentChatId(ctx);
  return await ctx.tg.sendMessage(opponentChatId, messageSticker.file_id);
};

export { onStickerMessage };

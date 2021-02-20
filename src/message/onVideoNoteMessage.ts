import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onVideoNoteMessage = () => async (ctx: IMessagineContext) => {
  await ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.videoNote}`);

  const chatId = getChatId(ctx);
  const messageVideoNote = ctx.message?.video_note;
  if (!messageVideoNote) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.videoNote);
  }

  const opponentChatId = getOpponentChatId(ctx);
  return ctx.tg.sendVideoNote(opponentChatId, messageVideoNote.file_id);
};

export { onVideoNoteMessage };

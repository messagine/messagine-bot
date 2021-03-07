import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onVideoNoteMessage = () => (ctx: IMessagineContext) => {
  const chatId = getChatId(ctx);
  const messageVideoNote = ctx.message?.video_note;
  if (!messageVideoNote) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.videoNote);
  }

  const fileId = messageVideoNote.file_id;
  const opponentChatId = getOpponentChatId(ctx);
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.videoNote}`, {
    chatId,
    fileId,
    opponentChatId,
  });
  const sendMessagePromise = ctx.tg.sendVideoNote(opponentChatId, fileId);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onVideoNoteMessage };

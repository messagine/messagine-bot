import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onVoiceMessage = () => (ctx: IMessagineContext) => {
  const chatId = getChatId(ctx);
  const messageVoice = ctx.message?.voice;
  if (!messageVoice) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.voice);
  }

  const fileId = messageVoice.file_id;
  const opponentChatId = getOpponentChatId(ctx);
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.voice}`, {
    chatId,
    fileId,
    opponentChatId,
  });
  const sendMessagePromise = ctx.tg.sendVoice(opponentChatId, fileId);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onVoiceMessage };

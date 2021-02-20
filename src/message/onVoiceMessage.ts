import { MessageTypeNotFoundError } from '../error';
import { getChatId, getOpponentChatId, IMessagineContext } from '../lib/common';
import { eventTypeEnum, messageTypeEnum } from '../lib/enums';

const onVoiceMessage = () =>  (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.message}.${messageTypeEnum.voice}`);

  const chatId = getChatId(ctx);
  const messageVoice = ctx.message?.voice;
  if (!messageVoice) {
    throw new MessageTypeNotFoundError(ctx, chatId, messageTypeEnum.voice);
  }

  const opponentChatId = getOpponentChatId(ctx);
  const sendMessagePromise = ctx.tg.sendVoice(opponentChatId, messageVoice.file_id);
  return Promise.all([mixPanelPromise, sendMessagePromise]);
};

export { onVoiceMessage };

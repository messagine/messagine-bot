import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { MessageTypeNotFoundError } from '../error';
import { getChatId, getExistingChat, getOpponentChatIds } from '../lib/common';
const debug = Debug('message:on_video_note');

const onVideoNoteMessage = () => async (ctx: TelegrafContext) => {
  debug('Triggered "on_video_note" message.');

  const chatId = getChatId(ctx);
  const messageVideoNote = ctx.message?.video_note;
  if (!messageVideoNote) {
    throw new MessageTypeNotFoundError(chatId, 'video note');
  }

  const existingChat = await getExistingChat(chatId);
  const opponentChatIds = getOpponentChatIds(existingChat, chatId);
  const opponentPromises: Promise<any>[] = [];
  opponentChatIds.forEach(opponentChatId => {
    const opponentPromise = ctx.tg.sendVideoNote(opponentChatId, messageVideoNote.file_id);
    opponentPromises.push(opponentPromise);
  });
  return await Promise.all(opponentPromises);
};

export { onVideoNoteMessage };

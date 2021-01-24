import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
import { getLanguage } from '../lib/common';
import { addUser, getUser } from '../lib/dataHandler';
import resource from '../resource';
const debug = Debug('command:start');

const startCommand = () => async (ctx: TelegrafContext) => {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    debug(resource.CHATID_NOT_FOUND);
    return await ctx.reply(resource.CHATID_NOT_FOUND);
  }

  const user = await getUser(chatId);
  if (!user) {
    debug(`Triggered "start" command with message.`);
    const language = getLanguage(ctx);
    const addUserPromise = addUser(chatId, language.lang);
    const messageParts = [
      'Welcome to Every Chat Bot.',
      'To find new chat, type /find_chat command.',
      `Your language is ${language.name}, to change your language type /set_language.`,
    ];
    const message = messageParts.join(' ');
    const replyPromise = ctx.reply(message);
    return await Promise.all([addUserPromise, replyPromise]);
  } else {
    return await ctx.reply('Welcome back. To find new chat, type /find_chat command.');
  }
};

export { startCommand };

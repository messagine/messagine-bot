import Debug from 'debug';
import Telegraf, { Extra } from 'telegraf';
import TelegrafI18n from 'telegraf-i18n';
// tslint:disable-next-line: no-var-requires
const TelegrafMixpanel = require('telegraf-mixpanel');
// tslint:disable-next-line: no-var-requires
const rateLimit = require('telegraf-ratelimit');
import { BotCommand } from 'telegraf/typings/telegram-types';
import {
  aboutAction,
  aboutCommand,
  cancelFindAction,
  cancelFindCommand,
  changeLanguageAction,
  deleteMessageAction,
  exitChatAction,
  exitChatCommand,
  exitChatSureAction,
  findChatAction,
  findChatCommand,
  helpAction,
  helpCommand,
  sayHiAction,
  showAllLanguagesAction,
  showTopLanguagesAction,
  showTopLanguagesCommand,
  startAction,
  startCommand,
} from '../commands';
import config from '../config';
import { InvalidNumberOfOpponentError } from '../error';
import {
  onAnimationMessage,
  onContactMessage,
  onDocumentMessage,
  onEditedMessage,
  onInvalidMessage,
  onLocationMessage,
  onPhotoMessage,
  onStickerMessage,
  onTextMessage,
  onVenueMessage,
  onVideoMessage,
  onVideoNoteMessage,
  onVoiceMessage,
} from '../message';
import resource from '../resource';
import { getChatId, IMessagineContext } from './common';
import {
  connect,
  createPreviousChat,
  deleteChat,
  findExistingChat,
  findLobby,
  getUser,
  leaveLobby,
  userBlockedChange,
} from './dataHandler';
import { actionEnum, commandEnum, eventTypeEnum, userStateEnum } from './enums';
import { ok } from './responses';
const debug = Debug('lib:telegram');
import path from 'path';
import { exitChatToOpponent } from '../reply';

const bot = new Telegraf<IMessagineContext>(config.BOT_TOKEN);
const mixpanel = new TelegrafMixpanel(config.MIXPANEL_TOKEN);
const i18n = new TelegrafI18n({
  defaultLanguage: config.DEFAULT_LANGUAGE_CODE,
  defaultLanguageOnMissing: true, // implies allowMissing = true
  directory: path.resolve(__dirname, '../locales'),
});

async function botUtils() {
  await connect();
  const limitConfig = {
    limit: 3,
    onLimitExceeded: (ctx: IMessagineContext) => ctx.reply('Please slow down'),
    window: 3000,
  };

  bot.use(Telegraf.log());
  bot.use(mixpanel.middleware());
  bot.use(i18n.middleware());
  bot.use(chatMemberMiddleware);
  bot.use(userMiddleware);
  bot.use(catcher);
  bot.use(logger);
  bot.use(rateLimit(limitConfig));

  const changeLanguageRegex = new RegExp(`${actionEnum.changeLanguage}:(.+)`);

  bot
    .command(commandEnum.start, startCommand())
    .command(commandEnum.about, aboutCommand())
    .command(commandEnum.findChat, findChatCommand())
    .command(commandEnum.setLanguage, showTopLanguagesCommand())
    .command(commandEnum.exitChat, exitChatCommand())
    .command(commandEnum.cancelFind, cancelFindCommand())
    .command(commandEnum.help, helpCommand())
    .action(commandEnum.help, helpAction())
    .action(commandEnum.start, startAction())
    .action(commandEnum.about, aboutAction())
    .action(commandEnum.findChat, findChatAction())
    .action(commandEnum.setLanguage, showTopLanguagesAction())
    .action(actionEnum.allLanguages, showAllLanguagesAction())
    .action(changeLanguageRegex, changeLanguageAction())
    .action(commandEnum.exitChat, exitChatAction())
    .action(actionEnum.exitChatSure, exitChatSureAction())
    .action(commandEnum.cancelFind, cancelFindAction())
    .action(actionEnum.deleteMessage, deleteMessageAction())
    .action(actionEnum.sayHi, sayHiAction())
    .on('animation', onAnimationMessage())
    .on('contact', onContactMessage())
    .on('document', onDocumentMessage())
    .on('venue', onVenueMessage())
    .on('location', onLocationMessage())
    .on('photo', onPhotoMessage())
    .on('sticker', onStickerMessage())
    .on('text', onTextMessage())
    .on('video', onVideoMessage())
    .on('video_note', onVideoNoteMessage())
    .on('voice', onVoiceMessage())
    .on('edited_message', onEditedMessage())
    .on('game', onInvalidMessage('game'))
    .on('poll', onInvalidMessage('poll'));
}

async function localBot() {
  debug('Bot is running in development mode at http://localhost:3000');

  bot.webhookReply = false;

  const botInfo = await bot.telegram.getMe();
  bot.options.username = botInfo.username;

  // tslint:disable-next-line: no-console
  console.info('Server has initialized bot username: ', botInfo.username);

  debug(`deleting webhook`);
  await bot.telegram.deleteWebhook();

  debug(`starting polling`);
  bot.start();
}

export async function status() {
  await syncWebhook();
  await syncCommands();

  return ok('Listening to bot events...');
}

async function syncWebhook() {
  if (!config.ENDPOINT_URL) {
    throw new Error('ENDPOINT_URL is not set.');
  }
  if (!config.WEBHOOK_PATH) {
    throw new Error('WEBHOOK_PATH is not set.');
  }

  const getWebhookInfo = await bot.telegram.getWebhookInfo();
  const expectedWebhookUrl = `${config.ENDPOINT_URL}/${config.WEBHOOK_PATH}`;

  if (getWebhookInfo.url !== expectedWebhookUrl) {
    debug(`deleting webhook`);
    await bot.telegram.deleteWebhook();
    debug(`setting webhook to ${expectedWebhookUrl}`);
    await bot.telegram.setWebhook(expectedWebhookUrl);
  }
}

async function syncCommands() {
  const myCommands = await bot.telegram.getMyCommands();
  const commandsSetProperly = checkCommands(myCommands);
  if (!commandsSetProperly) {
    debug(`setting new commands`);
    await bot.telegram.setMyCommands(commands);
  }
}

// TODO: get i18n texts with default language
const commands: BotCommand[] = [
  { command: commandEnum.findChat, description: resource.FIND_CHAT_COMMAND_DESC },
  { command: commandEnum.exitChat, description: resource.EXIT_CHAT_COMMAND_DESC },
  { command: commandEnum.setLanguage, description: resource.SET_LANGUAGE_COMMAND_DESC },
  { command: commandEnum.cancelFind, description: resource.CANCEL_FIND_COMMAND_DESC },
  { command: commandEnum.help, description: resource.HELP_COMMAND_DESC },
  { command: commandEnum.about, description: resource.ABOUT_COMMAND_DESC },
];

function checkCommands(existingCommands: BotCommand[]) {
  const commandsLength = commands.length;
  if (existingCommands.length !== commandsLength) {
    return false;
  }
  for (let i = 0; i < commandsLength; i++) {
    const command = commands[i];
    const existingCommand = existingCommands[i];
    if (command.command !== existingCommand.command) {
      return false;
    }
    if (command.description !== existingCommand.description) {
      return false;
    }
  }
  return true;
}

export async function webhook(event: any) {
  bot.webhookReply = true;
  // call bot commands and middlware
  await botUtils();

  const body = JSON.parse(event.body);
  await bot.handleUpdate(body);
  return ok('Success');
}

export function toArgs(ctx: IMessagineContext) {
  const regex = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]+)?$/i;
  const parts = regex.exec(ctx.message!.text!.trim());
  if (!parts) {
    return [];
  }
  return !parts[3] ? [] : parts[3].split(/\s+/).filter(arg => arg.length);
}

export const MARKDOWN = Extra.markdown(true);

export const NO_PREVIEW = MARKDOWN.webPreview(false);

export const hiddenCharacter = '\u200b';

export const logger = async (_: IMessagineContext, next: any): Promise<void> => {
  const logStart = new Date();
  await next();
  const ms = new Date().getTime() - logStart.getTime();
  // tslint:disable-next-line: no-console
  console.log('Response time: %sms', ms);
};

const catcher = async (ctx: IMessagineContext, next: any): Promise<void> => {
  try {
    await next();
  } catch (e) {
    await ctx.reply(e.message, e?.extra);
  }
};

const chatMemberMiddleware = async (ctx: any, next: any): Promise<void> => {
  if (ctx?.update?.my_chat_member) {
    const chatId = ctx.update.my_chat_member.chat.id;
    const newStatus = ctx.update.my_chat_member.new_chat_member.status;
    if (newStatus === 'kicked') {
      await onUserLeft(ctx, chatId);
    } else if (newStatus === 'member') {
      await onUserReturned(ctx, chatId);
    }
    return;
  }
  await next();
};

async function onUserLeft(ctx: any, chatId: number) {
  const chatIdInfo = await getChatIdInfo(chatId);
  const promises: Promise<any>[] = [];
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${actionEnum.userLeft}`);
  promises.push(mixPanelPromise);
  if (chatIdInfo.user) {
    ctx.i18n.locale(chatIdInfo.user.languageCode);
    const userBlockPromise = userBlockedChange(chatId, true);
    promises.push(userBlockPromise);
  }
  if (chatIdInfo.lobby) {
    const leaveLobbyPromise = leaveLobby(chatId);
    promises.push(leaveLobbyPromise);
  }
  if (chatIdInfo.chat) {
    const chatIds = chatIdInfo.chat.chatIds;
    const opponentChatIds = chatIds.filter(id => chatId !== id);
    if (opponentChatIds.length !== 1) {
      throw new InvalidNumberOfOpponentError(ctx, chatId, opponentChatIds);
    }
    const opponentChatId = opponentChatIds[0];
    const deleteChatPromise = deleteChat(chatIdInfo.chat.id);
    const previousChatCreatePromise = createPreviousChat(chatIdInfo.chat, chatId);
    const sendMessageToOpponentPromise = exitChatToOpponent(ctx, opponentChatId);
    promises.push(deleteChatPromise);
    promises.push(previousChatCreatePromise);
    promises.push(sendMessageToOpponentPromise);
  }
  return await Promise.all(promises);
}

async function onUserReturned(ctx: any, chatId: number) {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${actionEnum.userLeft}`);
  const userBlockPromise = userBlockedChange(chatId, false);
  return await Promise.all([mixPanelPromise, userBlockPromise]);
}

async function getChatIdInfo(chatId: number) {
  const userPromise = getUser(chatId);
  const lobbyPromise = findLobby(chatId);
  const existingChatPromise = findExistingChat(chatId);

  const checkResults = await Promise.all([userPromise, lobbyPromise, existingChatPromise]);

  const user = checkResults[0];
  const lobby = checkResults[1];
  const chat = checkResults[2];

  let state: string;
  if (lobby) {
    state = userStateEnum.lobby;
  } else if (chat) {
    state = userStateEnum.chat;
  } else {
    state = userStateEnum.idle;
  }

  return {
    chat,
    lobby,
    state,
    user,
  };
}

const userMiddleware = async (ctx: IMessagineContext, next: any): Promise<void> => {
  if (ctx.message?.from?.is_bot) {
    return;
  }
  const chatId = getChatId(ctx);
  const chatIdInfo = await getChatIdInfo(chatId);
  ctx.userState = chatIdInfo.state;
  if (chatIdInfo.lobby) {
    ctx.lobby = chatIdInfo.lobby;
  } else if (chatIdInfo.chat) {
    ctx.currentChat = chatIdInfo.chat;
  }

  if (chatIdInfo.user) {
    ctx.user = chatIdInfo.user;
    ctx.i18n.locale(chatIdInfo.user.languageCode);
    if (ctx.user.blocked) {
      return;
    }
  }
  await next();
};

if (config.IS_DEV) {
  // tslint:disable-next-line: no-console
  console.log('isDev', config.IS_DEV);
  startDevelopment();
}

async function startDevelopment() {
  await syncCommands();
  await localBot();
  await botUtils();
  await bot.launch();
}

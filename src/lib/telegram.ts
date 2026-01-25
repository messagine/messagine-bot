import Debug from 'debug';
import Telegraf, { Extra, Markup } from 'telegraf';
import TelegrafI18n from 'telegraf-i18n';
// tslint:disable-next-line: no-var-requires
const TelegrafMixpanel = require('telegraf-mixpanel');
// tslint:disable-next-line: no-var-requires
const rateLimit = require('telegraf-ratelimit');
import { BotCommand } from 'telegraf/typings/telegram-types';
import { DataHandler } from './dataHandler';
import { ILobby } from './models/Lobby';
import { IPreviousChat } from './models/PreviousChat';
import {
  aboutAction,
  aboutCommand,
  adminChatCommand,
  banCommand,
  cancelFindAction,
  cancelFindCommand,
  changeLanguageAction,
  deleteMessageAction,
  detailCommand,
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
  unbanCommand,
} from '../commands';
import config from '../config';
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
import { IMessagineContext, onRateLimitExceeded } from './common';
import { actionEnum, adminCommandEnum, commandEnum, userStateEnum } from './enums';
import { IUser } from './models/User';
import { ok } from './responses';
const debug = Debug('lib:telegram');
import path from 'path';
import {
  catcherMiddleware,
  chatMemberMiddleware,
  dbMiddleware,
  responseTimeLoggerMiddleware,
  userMiddleware,
} from '../middlewares';

export const bot = new Telegraf<IMessagineContext>(config.BOT_TOKEN);
const mixpanel = new TelegrafMixpanel(config.MIXPANEL_TOKEN);
const i18n = new TelegrafI18n({
  defaultLanguage: config.DEFAULT_LANGUAGE_CODE,
  defaultLanguageOnMissing: true, // implies allowMissing = true
  directory: path.resolve(__dirname, '../locales'),
});

export function setupBot() {
  const limitConfig = {
    limit: 3,
    onLimitExceeded: onRateLimitExceeded,
    window: 3000,
  };

  bot.use(dbMiddleware);
  bot.use(Telegraf.log());
  bot.use(mixpanel.middleware());
  bot.use(i18n.middleware());
  bot.use(chatMemberMiddleware);
  bot.use(userMiddleware);
  bot.use(catcherMiddleware);
  bot.use(responseTimeLoggerMiddleware);
  bot.use(rateLimit(limitConfig));

  const changeLanguageRegex = new RegExp(`${actionEnum.changeLanguage}:(.+)`);
  const adminChatCommandRegex = new RegExp(`/${adminCommandEnum.adminChat} (.+)`);
  const banCommandRegex = new RegExp(`/${adminCommandEnum.ban} (.+)`);
  const detailCommandRegex = new RegExp(`/${adminCommandEnum.detail} (.+)`);
  const unbanCommandRegex = new RegExp(`/${adminCommandEnum.unban} (.+)`);

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
    .hears(adminChatCommandRegex, adminChatCommand())
    .hears(banCommandRegex, banCommand())
    .hears(detailCommandRegex, detailCommand())
    .hears(unbanCommandRegex, unbanCommand())
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
  debug('Server has initialized bot username: ', botInfo.username);

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

export async function syncWebhook() {
  if (!config.ENDPOINT_URL) {
    throw new Error('ENDPOINT_URL is not set.');
  }
  if (!config.WEBHOOK_PATH) {
    throw new Error('WEBHOOK_PATH is not set.');
  }

  const getWebhookInfo = await bot.telegram.getWebhookInfo();
  const cleanPath = config.WEBHOOK_PATH.startsWith('/') ? config.WEBHOOK_PATH.substring(1) : config.WEBHOOK_PATH;
  const expectedWebhookUrl = `${config.ENDPOINT_URL}/${cleanPath}`;

  if (getWebhookInfo.url !== expectedWebhookUrl) {
    debug(`deleting webhook`);
    await bot.telegram.deleteWebhook();
    debug(`setting webhook to ${expectedWebhookUrl}`);
    await bot.telegram.setWebhook(expectedWebhookUrl);
  }
}

export async function syncCommands() {
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
  debug(JSON.stringify(event));
  bot.webhookReply = true;
  // call bot commands and middlware

  const body = JSON.parse(event.body);
  await bot.handleUpdate(body);
  return ok('Success');
}

export async function createChatJob() {
  const debug = Debug('job:createChat');
  debug('Create chat job started.');

  const db = new DataHandler();
  await db.connect();

  const lobbyUsers = await db.getAllLobbyUsers();
  if (!lobbyUsers || lobbyUsers.length === 0) {
    debug('Lobby users not found.');
    return ok('No lobby users');
  }

  const allChatIds = lobbyUsers.map(u => u.chatId);
  const allPreviousChats = await db.getUsersPreviousChats(allChatIds);
  const languageGroups = groupLobbyByLanguage(lobbyUsers);
  debug(`${lobbyUsers.length} lobby users found with ${languageGroups.length} language group.`);

  const processedChatIds: number[] = [];
  const promises: Promise<any>[] = [];

  for (const languageGroup of languageGroups) {
    if (languageGroup.lobbyUsers.length <= 1) {
      debug(`${languageGroup.languageCode} lobby doesn't have enough lobby user.`);
      continue;
    }
    const chatIds = languageGroup.lobbyUsers.map(u => u.chatId);
    for (const chatId of chatIds) {
      if (processedChatIds.includes(chatId)) {
        continue;
      }
      processedChatIds.push(chatId);

      const opponent = findOpponentForChat(chatId, chatIds, processedChatIds, allPreviousChats);
      if (!opponent) {
        debug(`Opponent not found for ${languageGroup.languageCode} lobby user.`);
        continue;
      }

      processedChatIds.push(opponent);
      const createChatPromise = createSingleChatDirect(db, [chatId, opponent], languageGroup.languageCode);
      promises.push(createChatPromise);
    }
  }

  await Promise.all(promises);
  return ok('Success');
}

function groupLobbyByLanguage(lobbyUsers: ILobby[]) {
  const groups: { [key: string]: ILobby[] } = {};
  for (const user of lobbyUsers) {
    if (!groups[user.languageCode]) {
      groups[user.languageCode] = [];
    }
    groups[user.languageCode].push(user);
  }
  return Object.keys(groups).map(key => ({ languageCode: key, lobbyUsers: groups[key] }));
}

function findOpponentForChat(
  chatId: number,
  chatIds: number[],
  processedChatIds: number[],
  allPreviousChats: IPreviousChat[] | null,
): number | undefined {
  const previousOpponents = getPreviousOpponents(chatId, allPreviousChats);
  const available = chatIds.filter(
    id => id !== chatId && !processedChatIds.includes(id) && !previousOpponents.includes(id),
  );
  return available[0];
}

function getPreviousOpponents(chatId: number, allPreviousChats: IPreviousChat[] | null): number[] {
  const previousOpponents: number[] = [];
  if (!allPreviousChats) {
    return previousOpponents;
  }
  for (const previousChat of allPreviousChats) {
    if (!previousChat.chatIds.includes(chatId)) {
      continue;
    }
    const opponents = previousChat.chatIds.filter(id => id !== chatId);
    if (opponents.length === 1) {
      previousOpponents.push(opponents[0]);
    }
  }
  return previousOpponents;
}

async function createSingleChatDirect(db: DataHandler, chatIds: number[], languageCode: string): Promise<void> {
  const debug = Debug('job:createChat');
  if (chatIds.length !== 2) {
    debug(`Invalid number of chat IDs: ${chatIds.length}`);
    return;
  }

  await db.createChat(chatIds, languageCode);

  const chatStartMessage = i18n.t(languageCode, 'chat_start', { exitChatCommand: commandEnum.exitChat });
  const sayHiButton = Markup.callbackButton(i18n.t(languageCode, 'say_hi'), actionEnum.sayHi);
  const exitChatButton = Markup.callbackButton(i18n.t(languageCode, 'exit_chat_command_desc'), commandEnum.exitChat);
  const keyboard = Markup.inlineKeyboard([[sayHiButton, exitChatButton]]).extra();

  for (const chatId of chatIds) {
    await db.leaveLobby(chatId);
    try {
      await bot.telegram.sendMessage(chatId, chatStartMessage, keyboard);
    } catch (err: any) {
      debug(`Failed to send chat start message to ${chatId}: ${err.message}`);
    }
  }
  debug(`Chat created for ${languageCode}.`);
}

export async function chatReminderJob() {
  const debug = Debug('job:chatReminder');
  debug('Chat reminder job started.');

  const db = new DataHandler();
  await db.connect();

  const [remindableUsers, lobbyUsers, chats] = await Promise.all([
    db.getRemindableUsers(),
    db.getAllLobbyUsers(),
    db.getAllChatUsers(),
  ]);

  if (!remindableUsers || remindableUsers.length === 0) {
    debug('Remindable users not found.');
    return ok('No remindable users');
  }

  debug(`${remindableUsers.length} remindable users found.`);

  const lobbyChatIds = lobbyUsers ? lobbyUsers.map(l => l.chatId) : [];
  const chatChatIds: number[] = [];
  if (chats) {
    for (const chat of chats) {
      chatChatIds.push(...chat.chatIds);
    }
  }

  const promises: Promise<any>[] = [];
  for (const user of remindableUsers) {
    const userState = getUserStateForReminder(user.chatId, lobbyChatIds, chatChatIds);
    const sendReminderPromise = sendReminderDirect(db, user, userState);
    promises.push(sendReminderPromise);
  }

  await Promise.all(promises);
  return ok('Success');
}

function getUserStateForReminder(chatId: number, lobbyChatIds: number[], chatChatIds: number[]): string {
  if (lobbyChatIds.includes(chatId)) {
    return userStateEnum.lobby;
  } else if (chatChatIds.includes(chatId)) {
    return userStateEnum.chat;
  } else {
    return userStateEnum.idle;
  }
}

async function sendReminderDirect(db: DataHandler, user: IUser, state: string): Promise<void> {
  const debug = Debug('job:chatReminder');
  const languageCode = user.languageCode;

  await db.clearReminder(user.chatId);
  await db.addReminder(user.chatId, state);

  let message: string;
  let keyboard: any;

  const findChatButton = Markup.callbackButton(i18n.t(languageCode, 'find_chat_command_desc'), commandEnum.findChat);
  const setLanguageButton = Markup.callbackButton(
    i18n.t(languageCode, 'set_language_command_desc'),
    commandEnum.setLanguage,
  );
  const sayHiButton = Markup.callbackButton(i18n.t(languageCode, 'say_hi'), actionEnum.sayHi);

  switch (state) {
    case userStateEnum.idle:
      message = i18n.t(languageCode, 'idle_reminder');
      keyboard = Markup.inlineKeyboard([[findChatButton]]).extra();
      break;
    case userStateEnum.lobby:
      message = i18n.t(languageCode, 'lobby_reminder');
      keyboard = Markup.inlineKeyboard([[setLanguageButton]]).extra();
      break;
    case userStateEnum.chat:
      message = i18n.t(languageCode, 'chat_reminder');
      keyboard = Markup.inlineKeyboard([[sayHiButton]]).extra();
      break;
    default:
      debug(`Invalid state: ${state}`);
      return;
  }

  try {
    await bot.telegram.sendMessage(user.chatId, message, keyboard);
    debug(`Reminder sent to ${user.chatId}.`);
  } catch (err: any) {
    debug(`Failed to send reminder to ${user.chatId}: ${err.message}`);
  }
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

if (config.IS_DEV) {
  debug('isDev', config.IS_DEV);
  startDevelopment();
}

async function startDevelopment() {
  await syncCommands();
  await localBot();
  setupBot();
  await bot.launch();
}

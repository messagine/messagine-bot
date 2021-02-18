import Debug from 'debug';
import Telegraf, { Extra } from 'telegraf';
import TelegrafI18n from 'telegraf-i18n';
// tslint:disable-next-line: no-var-requires
const TelegrafMixpanel = require('telegraf-mixpanel');
import { BotCommand } from 'telegraf/typings/telegram-types';
import {
  aboutCommand,
  exitChatCommand,
  exitLobbyCommand,
  findChatCommand,
  helpCommand,
  languageMenuMiddleware,
  startCommand,
  switchLanguageCommand,
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
import { getChatId, IMessagineContext } from './common';
import { connect, getUser } from './dataHandler';
import { commandEnum } from './enums';
import { ok } from './responses';
const debug = Debug('lib:telegram');
import path from 'path';

const bot = new Telegraf<IMessagineContext>(config.BOT_TOKEN);
const mixpanel = new TelegrafMixpanel(config.MIXPANEL_TOKEN);
const i18n = new TelegrafI18n({
  defaultLanguage: config.DEFAULT_LANGUAGE_CODE,
  defaultLanguageOnMissing: true, // implies allowMissing = true
  directory: path.resolve(__dirname, '../locales'),
});

async function botUtils() {
  await connect();
  const languageMenu = languageMenuMiddleware();

  bot.use(Telegraf.log());
  bot.use(mixpanel.middleware());
  bot.use(i18n.middleware());
  bot.use(userMiddleware);
  bot.use(languageMenu);
  bot.use(catcher);
  bot.use(logger);

  bot
    .command(commandEnum.start, startCommand())
    .command(commandEnum.about, aboutCommand())
    .command(commandEnum.findChat, findChatCommand())
    .command(commandEnum.switchLanguage, switchLanguageCommand(languageMenu))
    .command(commandEnum.exitChat, exitChatCommand())
    .command(commandEnum.exitLobby, exitLobbyCommand())
    .command(commandEnum.help, helpCommand())
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

const commands: BotCommand[] = [
  { command: commandEnum.findChat, description: resource.FIND_CHAT_COMMAND_DESC },
  { command: commandEnum.exitChat, description: resource.EXIT_CHAT_COMMAND_DESC },
  { command: commandEnum.switchLanguage, description: resource.SWITCH_LANGUAGE_COMMAND_DESC },
  { command: commandEnum.exitLobby, description: resource.EXIT_LOBBY_COMMAND_DESC },
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await next();
  const ms = new Date().getTime() - logStart.getTime();
  // tslint:disable-next-line: no-console
  console.log('Response time: %sms', ms);
};

const catcher = async (ctx: IMessagineContext, next: any): Promise<void> => {
  try {
    await next();
  } catch (e) {
    await ctx.reply(e.message);
  }
};

const userMiddleware = async (ctx: IMessagineContext, next: any): Promise<void> => {
  const chatId = getChatId(ctx);
  const user = await getUser(chatId);
  if (user) {
    ctx.user = user;
    ctx.i18n.locale(user.languageCode);
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

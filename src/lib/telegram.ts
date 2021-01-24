import Debug from 'debug';
import Telegraf, { Context as TelegrafContext, Extra } from 'telegraf';
import { BotCommand } from 'telegraf/typings/telegram-types';
import {
  cancelFindCommand,
  exitChatCommand,
  findChatCommand,
  languageMenuMiddleware,
  setLanguageCommand,
  startCommand,
} from '../commands';
import config from '../config';
import {
  onAnimationMessage,
  onContactMessage,
  onDocumentMessage,
  onInvalidMessage,
  onLocationMessage,
  onPhotoMessage,
  onStickerMessage,
  onTextMessage,
  onVideoMessage,
  onVoiceMessage,
} from '../message';
import commandEnum from './commandEnum';
import { connect } from './dataHandler';
import { ok } from './responses';
const debug = Debug('lib:telegram');

export const bot = new Telegraf(config.BOT_TOKEN);

async function botUtils() {
  await connect();
  const languageMenu = languageMenuMiddleware();

  bot.use(Telegraf.log());
  bot.use(logger);
  bot.use(languageMenu);

  bot
    .command(commandEnum.start, startCommand())
    .command(commandEnum.findChat, findChatCommand())
    .command(commandEnum.setLanguage, setLanguageCommand(languageMenu))
    .command(commandEnum.exitChat, exitChatCommand())
    .command(commandEnum.cancelFind, cancelFindCommand())
    .on('animation', onAnimationMessage())
    .on('contact', onContactMessage())
    .on('document', onDocumentMessage())
    .on('location', onLocationMessage())
    .on('photo', onPhotoMessage())
    .on('sticker', onStickerMessage())
    .on('text', onTextMessage())
    .on('video', onVideoMessage())
    .on('voice', onVoiceMessage())
    .on('game', onInvalidMessage('game'))
    .on('poll', onInvalidMessage('poll'))
    .on('venue', onInvalidMessage('venue'));
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
  await bot.start();
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
  { command: commandEnum.findChat, description: 'Find Chat' },
  { command: commandEnum.exitChat, description: 'Exit Current Chat' },
  { command: commandEnum.setLanguage, description: 'Set Language' },
  { command: commandEnum.cancelFind, description: 'Cancel Find Find' },
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

export function toArgs(ctx: TelegrafContext) {
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

export const logger = async (_: TelegrafContext, next: any): Promise<void> => {
  const logStart = new Date();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await next();
  const ms = new Date().getTime() - logStart.getTime();
  // tslint:disable-next-line: no-console
  console.log('Response time: %sms', ms);
};

if (config.IS_DEV) {
  // tslint:disable-next-line: no-console
  console.log('isDev', config.IS_DEV);

  localBot().then(() => {
    // call bot commands and middlware
    botUtils().then(() => {
      // launch bot
      bot.launch();
    });
  });
}

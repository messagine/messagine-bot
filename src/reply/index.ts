import _ from 'lodash';
import { Markup } from 'telegraf';
import { CallbackButton, InlineKeyboardButton } from 'telegraf/typings/markup';
import { getAllLanguages, getTopLanguages, IMessagineContext } from '../lib/common';
import { actionEnum, commandEnum, userStateEnum } from '../lib/enums';
import { ILanguage } from '../lib/models/Language';

export const startCallbackButton = (ctx: IMessagineContext) =>
  Markup.callbackButton(ctx.i18n.t('start_command_desc'), commandEnum.start);

export const exitChatCallbackButton = (ctx: IMessagineContext) =>
  Markup.callbackButton(ctx.i18n.t('exit_chat_command_desc'), commandEnum.exitChat);

export const findChatCallbackButton = (ctx: IMessagineContext) =>
  Markup.callbackButton(ctx.i18n.t('find_chat_command_desc'), commandEnum.findChat);

export const cancelFindCallbackButton = (ctx: IMessagineContext) =>
  Markup.callbackButton(ctx.i18n.t('cancel_find_command_desc'), commandEnum.cancelFind);

export const setLanguageCallbackButton = (ctx: IMessagineContext) =>
  Markup.callbackButton(ctx.i18n.t('set_language_command_desc'), commandEnum.setLanguage);

export const aboutCallbackButton = (ctx: IMessagineContext) =>
  Markup.callbackButton(ctx.i18n.t('about_command_desc'), commandEnum.about);

export const helpCallbackButton = (ctx: IMessagineContext) =>
  Markup.callbackButton(ctx.i18n.t('help_command_desc'), commandEnum.help);

export const websiteUrlButton = (ctx: IMessagineContext) =>
  Markup.urlButton(ctx.i18n.t('our_website'), 'https://messaginebot.com');

export const contactUrlButton = (ctx: IMessagineContext) =>
  Markup.urlButton(ctx.i18n.t('contact'), 'https://messaginebot.com/contact');

export function lobbyWaitReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('lobby_wait'),
    Markup.inlineKeyboard([
      [cancelFindCallbackButton(ctx)],
      [setLanguageCallbackButton(ctx), helpCallbackButton(ctx)],
    ]).extra(),
  );
}

export function activeChatReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('active_chat'),
    Markup.inlineKeyboard([[exitChatCallbackButton(ctx), helpCallbackButton(ctx)]]).extra(),
  );
}

export function cancelFindReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('cancel_find'),
    Markup.inlineKeyboard([[findChatCallbackButton(ctx), helpCallbackButton(ctx)]]).extra(),
  );
}

export function exitChatAreYouSureReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('exit_chat_are_you_sure'),
    Markup.inlineKeyboard([
      Markup.callbackButton(ctx.i18n.t('yes'), actionEnum.exitChatSure),
      Markup.callbackButton(ctx.i18n.t('no'), actionEnum.deleteMessage),
    ]).extra(),
  );
}

export function exitChatReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('exit_chat'),
    Markup.inlineKeyboard([[findChatCallbackButton(ctx), helpCallbackButton(ctx)]]).extra(),
  );
}

export function exitChatToOpponent(ctx: IMessagineContext, opponentChatId: number) {
  return ctx.tg.sendMessage(
    opponentChatId,
    ctx.i18n.t('exit_chat_opponent'),
    Markup.inlineKeyboard([[findChatCallbackButton(ctx), helpCallbackButton(ctx)]]).extra(),
  );
}

export function chatStartReply(ctx: IMessagineContext, chatId: number) {
  return ctx.tg.sendMessage(
    chatId,
    ctx.i18n.t('chat_start', { exitChatCommand: commandEnum.exitChat }),
    Markup.inlineKeyboard([
      [Markup.callbackButton(ctx.i18n.t('say_hi'), actionEnum.sayHi), exitChatCallbackButton(ctx)],
    ]).extra(),
  );
}

export function hiSendReply(ctx: IMessagineContext) {
  return ctx.reply(ctx.i18n.t('said_hi', { exitChatCommand: commandEnum.exitChat }));
}

export function sayHiReply(ctx: IMessagineContext, chatId: number) {
  return ctx.tg.sendMessage(chatId, ctx.i18n.t('hi_message', { exitChatCommand: commandEnum.exitChat }));
}

function helpButtons(ctx: IMessagineContext): InlineKeyboardButton[][] {
  return [[getStateSpecificButton(ctx)], [setLanguageCallbackButton(ctx), aboutCallbackButton(ctx)]];
}

function getStateSpecificButton(ctx: IMessagineContext): CallbackButton {
  switch (ctx.userState) {
    case userStateEnum.idle:
      return findChatCallbackButton(ctx);
    case userStateEnum.lobby:
      return cancelFindCallbackButton(ctx);
    case userStateEnum.chat:
      return exitChatCallbackButton(ctx);
    default:
      throw new Error('Invalid state error.');
  }
}

export function helpReply(ctx: IMessagineContext) {
  const buttons = helpButtons(ctx);
  return ctx.reply(ctx.i18n.t('help_reply'), Markup.inlineKeyboard(buttons).extra());
}

export function languageNotChangedInChatReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('language_not_changed_in_chat'),
    Markup.inlineKeyboard([[exitChatCallbackButton(ctx), helpCallbackButton(ctx)]]).extra(),
  );
}

export function newUserReply(ctx: IMessagineContext, languageNativeName: string) {
  const buttons: InlineKeyboardButton[][] = [
    [findChatCallbackButton(ctx), setLanguageCallbackButton(ctx)],
    [aboutCallbackButton(ctx), helpCallbackButton(ctx)],
    [websiteUrlButton(ctx), contactUrlButton(ctx)],
  ];

  return ctx.replyWithHTML(
    ctx.i18n.t('new_user', { helpCommand: commandEnum.help, languageNativeName }),
    Markup.inlineKeyboard(buttons).extra(),
  );
}

export function welcomeBackReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('welcome_back'),
    Markup.inlineKeyboard([[findChatCallbackButton(ctx), helpCallbackButton(ctx)]]).extra(),
  );
}

export function aboutReply(
  ctx: IMessagineContext,
  numberOfActiveChats: number,
  numberOfLobbyUsers: number,
  numberOfMyPreviousChats: number,
  numberOfPreviousChats: number,
  numberOfUsers: number,
) {
  return ctx.replyWithHTML(
    ctx.i18n.t('about_reply', {
      numberOfActiveChats,
      numberOfLobbyUsers,
      numberOfMyPreviousChats,
      numberOfPreviousChats,
      numberOfUsers,
    }),
    Markup.inlineKeyboard([[websiteUrlButton(ctx), contactUrlButton(ctx)], [helpCallbackButton(ctx)]]).extra(),
  );
}

export function userNotFoundReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('user_not_found'),
    Markup.inlineKeyboard([[startCallbackButton(ctx), helpCallbackButton(ctx)]]).extra(),
  );
}

function mapLanguagesToButtons(languages: ILanguage[]): InlineKeyboardButton[][] {
  const languageChunks = _.chunk(languages, 2);

  const buttons: InlineKeyboardButton[][] = [];
  languageChunks.forEach(languageChunk => {
    const buttonChunk: InlineKeyboardButton[] = [];
    languageChunk.forEach(language => {
      const buttonText = language.lang + ' - ' + language.native_name;
      const buttonData = actionEnum.changeLanguage + ':' + language.lang;
      buttonChunk.push(Markup.callbackButton(buttonText, buttonData));
    });
    buttons.push(buttonChunk);
  });

  return buttons;
}

export function showTopLanguagesReply(ctx: IMessagineContext) {
  const languages = getTopLanguages();
  const buttons = mapLanguagesToButtons(languages);
  buttons.push([Markup.callbackButton(ctx.i18n.t('show_all_languages_button'), actionEnum.allLanguages)]);

  return ctx.reply(ctx.i18n.t('top_languages'), Markup.inlineKeyboard(buttons).extra());
}

export function showAllLanguagesReply(ctx: IMessagineContext) {
  const languages = getAllLanguages();
  const buttons = mapLanguagesToButtons(languages);
  buttons.push([Markup.callbackButton(ctx.i18n.t('show_top_languages_button'), commandEnum.setLanguage)]);

  return ctx.reply(ctx.i18n.t('all_languages'), Markup.inlineKeyboard(buttons).extra());
}

export function languageSelectedReply(ctx: IMessagineContext, selectedLanguage: string) {
  return ctx.reply(
    ctx.i18n.t('language_selected', { selectedLanguage }),
    Markup.inlineKeyboard([[getStateSpecificButton(ctx), helpCallbackButton(ctx)]]).extra(),
  );
}

export function languageNotChangedReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('language_not_changed'),
    Markup.inlineKeyboard([[getStateSpecificButton(ctx), helpCallbackButton(ctx)]]).extra(),
  );
}

export function cancelFindNotLobbyReply(ctx: IMessagineContext) {
  return ctx.reply(ctx.i18n.t('cancel_find_not_lobby'));
}

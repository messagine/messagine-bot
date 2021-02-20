import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/markup';
import { IMessagineContext } from '../lib/common';
import { commandEnum, userStateEnum } from '../lib/enums';

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
    Markup.inlineKeyboard([[cancelFindCallbackButton(ctx)], [helpCallbackButton(ctx)]]).extra(),
  );
}

export function activeChatReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('active_chat'),
    Markup.inlineKeyboard([[exitChatCallbackButton(ctx)], [helpCallbackButton(ctx)]]).extra(),
  );
}

export function cancelFindReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('cancel_find'),
    Markup.inlineKeyboard([[findChatCallbackButton(ctx)], [helpCallbackButton(ctx)]]).extra(),
  );
}

export function exitChatReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('exit_chat'),
    Markup.inlineKeyboard([[findChatCallbackButton(ctx)], [helpCallbackButton(ctx)]]).extra(),
  );
}

export function exitChatToOpponent(ctx: IMessagineContext, opponentChatId: number) {
  return ctx.tg.sendMessage(
    opponentChatId,
    ctx.i18n.t('exit_chat_opponent'),
    Markup.inlineKeyboard([[findChatCallbackButton(ctx)], [helpCallbackButton(ctx)]]).extra(),
  );
}

export function chatStartReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('chat_start'),
    Markup.inlineKeyboard([[exitChatCallbackButton(ctx)], [helpCallbackButton(ctx)]]).extra(),
  );
}

export function chatStartToOpponent(ctx: IMessagineContext, opponentChatId: number) {
  return ctx.tg.sendMessage(
    opponentChatId,
    ctx.i18n.t('chat_start'),
    Markup.inlineKeyboard([[exitChatCallbackButton(ctx)], [helpCallbackButton(ctx)]]).extra(),
  );
}

function helpButtons(ctx: IMessagineContext, userState: string) {
  const buttons: InlineKeyboardButton[][] = [];
  if (userState === userStateEnum.idle) {
    buttons.push([findChatCallbackButton(ctx)]);
  }
  if (userState === userStateEnum.lobby) {
    buttons.push([cancelFindCallbackButton(ctx)]);
  }
  if (userState === userStateEnum.chat) {
    buttons.push([exitChatCallbackButton(ctx)]);
  }
  buttons.push([setLanguageCallbackButton(ctx)]);
  buttons.push([aboutCallbackButton(ctx)]);
  return buttons;
}

export function helpReply(ctx: IMessagineContext, userState: string) {
  const buttons = helpButtons(ctx, userState);
  return ctx.reply(ctx.i18n.t('help_reply'), Markup.inlineKeyboard(buttons).extra());
}

export function languageNotChangedInChatReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('language_not_changed_in_chat'),
    Markup.inlineKeyboard([[exitChatCallbackButton(ctx)], [helpCallbackButton(ctx)]]).extra(),
  );
}

export function newUserReply(ctx: IMessagineContext, languageNativeName: string) {
  const buttons: InlineKeyboardButton[][] = [
    [findChatCallbackButton(ctx), setLanguageCallbackButton(ctx)],
    [aboutCallbackButton(ctx), websiteUrlButton(ctx), contactUrlButton(ctx)],
  ];

  return ctx.replyWithHTML(
    ctx.i18n.t('new_user', { helpCommand: commandEnum.help, languageNativeName }),
    Markup.inlineKeyboard(buttons).extra(),
  );
}

export function welcomeBackReply(ctx: IMessagineContext) {
  return ctx.reply(
    ctx.i18n.t('welcome_back'),
    Markup.inlineKeyboard([[findChatCallbackButton(ctx)], [helpCallbackButton(ctx)]]).extra(),
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
    Markup.inlineKeyboard([[startCallbackButton(ctx)], [helpCallbackButton(ctx)]]).extra(),
  );
}

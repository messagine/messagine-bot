import _ from 'lodash';
import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/markup';
import { findLanguageSafe, getAllLanguages, getChatId, getTopLanguages, IMessagineContext } from '../lib/common';
import { setLanguage } from '../lib/dataHandler';
import { actionEnum, commandEnum, eventTypeEnum, userStateEnum } from '../lib/enums';
import { ILanguage } from '../lib/models/Language';
import { findChatCallbackButton, helpCallbackButton, languageNotChangedInChatReply } from '../reply';

const showTopLanguagesCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.setLanguage}`);
  return Promise.all([mixPanelPromise, showTopLanguages(ctx)]);
};

const showTopLanguagesAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${commandEnum.setLanguage}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), showTopLanguages(ctx), ctx.answerCbQuery()]);
};

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

async function showTopLanguages(ctx: IMessagineContext) {
  const languages = getTopLanguages();
  const buttons = mapLanguagesToButtons(languages);
  buttons.push([Markup.callbackButton(ctx.i18n.t('show_all_languages_button'), actionEnum.allLanguages)]);

  return ctx.reply(ctx.i18n.t('top_languages'), Markup.inlineKeyboard(buttons).extra());
}

const showAllLanguagesAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${actionEnum.allLanguages}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), showAllLanguages(ctx), ctx.answerCbQuery()]);
};

async function showAllLanguages(ctx: IMessagineContext) {
  const languages = getAllLanguages();
  const buttons = mapLanguagesToButtons(languages);
  buttons.push([Markup.callbackButton(ctx.i18n.t('show_top_languages_button'), commandEnum.setLanguage)]);

  return ctx.reply(ctx.i18n.t('all_languages'), Markup.inlineKeyboard(buttons).extra());
}

const changeLanguageAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${actionEnum.changeLanguage}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), changeLanguage(ctx), ctx.answerCbQuery()]);
};

async function changeLanguage(ctx: IMessagineContext) {
  if (ctx?.match === undefined || ctx?.match?.length !== 2) {
    await ctx.reply(ctx.i18n.t('invalid_language'));
    return;
  }

  const newLanguageCode: string = ctx?.match[1];
  const chatId = getChatId(ctx);
  const previousLanguageCode = ctx.user?.languageCode;
  if (newLanguageCode === previousLanguageCode) {
    await ctx.reply(ctx.i18n.t('language_not_changed'));
    return;
  }

  if (ctx.userState === userStateEnum.chat) {
    await languageNotChangedInChatReply(ctx);
    return;
  }

  if (ctx.user) {
    ctx.user.languageCode = newLanguageCode;
  }
  ctx.i18n.locale(newLanguageCode);
  const mixpanelPeopleSetPromise = ctx.mixpanel.people.set({ language_code: newLanguageCode });

  const newLanguage = findLanguageSafe(ctx, newLanguageCode);
  const setLanguagePromise = setLanguage(chatId, newLanguageCode);
  const answerQueryPromise = ctx.answerCbQuery();
  const replyPromise = ctx.reply(
    ctx.i18n.t('language_selected', { selectedLanguage: newLanguage.native_name }),
    Markup.inlineKeyboard([[findChatCallbackButton(ctx)], [helpCallbackButton(ctx)]]).extra(),
  );
  const promises = [mixpanelPeopleSetPromise, setLanguagePromise, answerQueryPromise, replyPromise];
  await Promise.all(promises);
}

export { showTopLanguagesCommand, showTopLanguagesAction, showAllLanguagesAction, changeLanguageAction };

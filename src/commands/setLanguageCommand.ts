import _ from 'lodash';
import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/markup';
import { findLanguageSafe, getAllLanguages, getChatId, getTopLanguages, IMessagineContext } from '../lib/common';
import { findExistingChat, setLanguage } from '../lib/dataHandler';
import { actionEnum, commandEnum, eventTypeEnum } from '../lib/enums';
import { ILanguage } from '../lib/models/Language';
import { languageNotChangedInChatReply } from '../reply';

const showTopLanguagesCommand = () => (ctx: IMessagineContext) => {
  return showTopLanguages(ctx);
};

const showTopLanguagesAction = () => (ctx: IMessagineContext) => {
  return Promise.all([ctx.deleteMessage(), showTopLanguages(ctx), ctx.answerCbQuery()]);
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
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.setLanguage}`);
  const languages = getTopLanguages();
  const buttons = mapLanguagesToButtons(languages);
  buttons.push([Markup.callbackButton('All >>', actionEnum.allLanguages)]);

  return ctx.reply('Top Languages', Markup.inlineKeyboard(buttons).extra());
}

const showAllLanguagesAction = () => (ctx: IMessagineContext) => {
  return Promise.all([ctx.deleteMessage(), showAllLanguages(ctx), ctx.answerCbQuery()]);
};

async function showAllLanguages(ctx: IMessagineContext) {
  const languages = getAllLanguages();
  const buttons = mapLanguagesToButtons(languages);
  buttons.push([Markup.callbackButton('<< Top', commandEnum.setLanguage)]);

  return ctx.reply('All Languages', Markup.inlineKeyboard(buttons).extra());
}

const changeLanguageAction = () => (ctx: IMessagineContext) => {
  return Promise.all([ctx.deleteMessage(), changeLanguage(ctx), ctx.answerCbQuery()]);
};

async function changeLanguage(ctx: IMessagineContext) {
  if (ctx?.match === undefined || ctx?.match?.length !== 2) {
    await ctx.reply('Invalid language');
    return;
  }

  const newLanguageCode: string = ctx?.match[1];
  const chatId = getChatId(ctx);
  const previousLanguageCode = ctx.user?.languageCode;
  if (newLanguageCode === previousLanguageCode) {
    await ctx.reply(ctx.i18n.t('language_not_changed'));
    return;
  }

  const existingChat = await findExistingChat(chatId);
  if (existingChat) {
    await languageNotChangedInChatReply(ctx);
    return;
  }

  if (ctx.user) {
    ctx.user.languageCode = newLanguageCode;
  }
  ctx.i18n.locale(newLanguageCode);
  ctx.mixpanel.people.set({ language_code: newLanguageCode });

  const newLanguage = findLanguageSafe(ctx, newLanguageCode);
  const setLanguagePromise = setLanguage(chatId, newLanguageCode);
  const answerQueryPromise = ctx.answerCbQuery();
  const replyPromise = ctx.reply(ctx.i18n.t('language_selected', { selectedLanguage: newLanguage.native_name }));
  const promises = [setLanguagePromise, answerQueryPromise, replyPromise];
  await Promise.all(promises);
}

export { showTopLanguagesCommand, showTopLanguagesAction, showAllLanguagesAction, changeLanguageAction };

import { findLanguageSafe, getChatId, getParamFromInput, IMessagineContext } from '../lib/common';
import { setLanguage, updateLobbyLanguage } from '../lib/dataHandler';
import { actionEnum, commandEnum, eventTypeEnum, userStateEnum } from '../lib/enums';
import {
  languageNotChangedInChatReply,
  languageNotChangedReply,
  languageSelectedReply,
  showAllLanguagesReply,
  showTopLanguagesReply,
} from '../reply';

const showTopLanguagesCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.setLanguage}`);
  return Promise.all([mixPanelPromise, showTopLanguages(ctx)]);
};

const showTopLanguagesAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${commandEnum.setLanguage}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), showTopLanguages(ctx), ctx.answerCbQuery()]);
};

function showTopLanguages(ctx: IMessagineContext) {
  return showTopLanguagesReply(ctx);
}

const showAllLanguagesAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${actionEnum.allLanguages}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), showAllLanguages(ctx), ctx.answerCbQuery()]);
};

function showAllLanguages(ctx: IMessagineContext) {
  return showAllLanguagesReply(ctx);
}

const changeLanguageAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${actionEnum.changeLanguage}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), changeLanguage(ctx), ctx.answerCbQuery()]);
};

function changeLanguage(ctx: IMessagineContext) {
  const newLanguageCode = getParamFromInput(ctx);
  const chatId = getChatId(ctx);
  const previousLanguageCode = ctx.user?.languageCode;
  if (newLanguageCode === previousLanguageCode) {
    return languageNotChangedReply(ctx);
  }

  if (ctx.userState === userStateEnum.chat) {
    return languageNotChangedInChatReply(ctx);
  }

  if (ctx.user) {
    ctx.user.languageCode = newLanguageCode;
  }
  ctx.i18n.locale(newLanguageCode);

  const newLanguage = findLanguageSafe(ctx, newLanguageCode);
  const mixpanelPeopleSetPromise = ctx.mixpanel.people.set({ language_code: newLanguageCode });
  const setLanguagePromise = setLanguage(chatId, newLanguageCode);
  const replyPromise = languageSelectedReply(ctx, newLanguage.native_name);

  const promises: Promise<any>[] = [mixpanelPeopleSetPromise, setLanguagePromise, replyPromise];

  if (ctx.lobby) {
    const lobbyUpdatePromise = updateLobbyLanguage(chatId, newLanguageCode);
    promises.push(lobbyUpdatePromise);
  }

  return Promise.all(promises);
}

export { showTopLanguagesCommand, showTopLanguagesAction, showAllLanguagesAction, changeLanguageAction };

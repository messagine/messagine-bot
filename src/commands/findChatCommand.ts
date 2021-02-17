import { getChatId, IMessagineContext } from '../lib/common';
import {
  addToLobby,
  createChat,
  findExistingChat,
  findLobby,
  findOpponentInLobby,
  leaveLobby,
} from '../lib/dataHandler';
import { commandEnum, eventTypeEnum } from '../lib/enums';

const findChatCommand = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.findChat}`);

  const chatId = getChatId(ctx);
  const lobbyPromise = findLobby(chatId);
  const existingChatPromise = findExistingChat(chatId);
  const checkResults = await Promise.all([lobbyPromise, existingChatPromise]);

  const lobby = checkResults[0];
  if (lobby) {
    await ctx.reply(
      ctx.i18n.t('lobby_wait', {
        cancelFindCommand: commandEnum.cancelFind,
        setLanguageCommand: commandEnum.setLanguage,
      }),
    );
    return;
  }

  const existingChat = checkResults[1];
  if (existingChat) {
    await ctx.reply(ctx.i18n.t('active_chat', { exitChatCommand: commandEnum.exitChat }));
    return;
  }

  const user = ctx.user;
  if (!user) {
    await ctx.reply(ctx.i18n.t('user_not_found', { startCommand: commandEnum.start }));
    return;
  }

  const opponent = await findOpponentInLobby(chatId, user.languageCode);

  if (opponent) {
    const chatStartMessage = ctx.i18n.t('chat_start', { exitChatCommand: commandEnum.exitChat });

    const leaveCurrentUserLobbyPromise = leaveLobby(chatId);
    const leaveOpponentUserLobbyPromise = leaveLobby(opponent.chatId);
    const createChatPromise = createChat(chatId, opponent.chatId, user.languageCode);
    const chatStartToCurrentUserPromise = ctx.reply(chatStartMessage);
    const chatStartToOpponentUserPromise = ctx.tg.sendMessage(opponent.chatId, chatStartMessage);

    return await Promise.all([
      leaveCurrentUserLobbyPromise,
      leaveOpponentUserLobbyPromise,
      createChatPromise,
      chatStartToCurrentUserPromise,
      chatStartToOpponentUserPromise,
    ]);
  } else {
    const addToLobbyPromise = addToLobby(chatId, user.languageCode);
    const lobbyMessagePromise = ctx.reply(
      ctx.i18n.t('lobby_wait', {
        cancelFindCommand: commandEnum.cancelFind,
        setLanguageCommand: commandEnum.setLanguage,
      }),
    );

    return await Promise.all([addToLobbyPromise, lobbyMessagePromise]);
  }
};

export { findChatCommand };

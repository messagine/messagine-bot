import { TelegrafContext } from "telegraf/typings/context";
import { getChatId } from "../lib/common";
import { DataHandler } from "../lib/dataHandler";

const cancel_find = () => async (ctx: TelegrafContext) => {
	let dataHandler = new DataHandler();
	const chatId = getChatId(ctx);
  const leaveLobbyPromise = dataHandler.leaveLobby(chatId);
  const leftMessagePromise = ctx.reply('Find chat cancelled. To find new chat, type /find_chat command.');

  await Promise.all([leaveLobbyPromise, leftMessagePromise]);
};

export { cancel_find };

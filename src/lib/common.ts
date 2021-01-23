import { TelegrafContext } from "telegraf/typings/context";
import config from "../config";
import { IChat } from "./models/Chat";
import { ILanguage } from "./models/Language";

const debug = require("debug")("common");

export function getChatId(ctx: TelegrafContext): number {
  const chatId = ctx.chat?.id;
  if (chatId) {
    return chatId;
  } else {
    ctx.reply("Chat Id not found. Check your security settings.");
    debug("Chat Id not found.");
    throw new Error("Invalid chat id.");
  }
}

export function getLanguageCode(ctx: TelegrafContext): string {
  const language_code = ctx.from?.language_code;
  if (language_code) {
    return language_code;
  } else {
    debug("Language code not found.");
    return config.DEFAULT_LANGUAGE_CODE;
  }
}

export function getOpponentChatIds(chat: IChat, chatId: number): number[] {
  const chatIds = chat.chatIds;
  const opponentChatIds = chatIds.filter(id => chatId !== id);
  return opponentChatIds;
}

export function mapLanguagesToRecords(languages: ILanguage[]): Record<string, string> {
	return languages.reduce(function(map, obj) {
    map[obj.lang] = obj.name;
    return map;
	}, {});
}
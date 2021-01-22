import { TelegrafContext } from "telegraf/typings/context";
import config from "../config";

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
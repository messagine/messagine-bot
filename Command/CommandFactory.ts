import TelegramBot from 'node-telegram-bot-api';
import { DataHandler } from '../src/DataHandler';
import { CancelFindCommand } from './CancelFindCommand';
import { CommandBase } from './CommandBase';
import { FindChatCommand } from './FindChatCommand';
import { InvalidCommand } from './InvalidCommand';
import { ListLanguagesCommand } from './ListLanguagesCommand';
import { SetLanguageCommand } from './SetLanguageCommand';
import { SetLanguageParameterCommand } from './SetLanguageParameterCommand';
import { StartCommand } from './StartCommand';

export class CommandFactory {
  public commander(dataHandler: DataHandler, bot: TelegramBot, chatId: number, msgText: string, languageCode: string): CommandBase {
    if (msgText.match(/\/start/)) return new StartCommand(dataHandler, bot, chatId, languageCode);

    const setLanguageMatch = msgText.match(/\/set_language (.+)/)
    if (setLanguageMatch) {
      const newLanguageCode = (setLanguageMatch[1]).toLowerCase();
      return new SetLanguageParameterCommand(dataHandler, bot, chatId, languageCode, newLanguageCode);
    }

    if (msgText.match(/\/set_language/)) return new SetLanguageCommand(dataHandler, bot, chatId, languageCode);

    if (msgText.match(/\/list_languages/)) return new ListLanguagesCommand(dataHandler, bot, chatId, languageCode);

    if (msgText.match(/\/find_chat/)) return new FindChatCommand(dataHandler, bot, chatId, languageCode);

    if (msgText.match(/\/exit_chat/)) return new FindChatCommand(dataHandler, bot, chatId, languageCode);

    if (msgText.match(/\/cancel_find/)) return new CancelFindCommand(dataHandler, bot, chatId, languageCode);

    return new InvalidCommand(dataHandler, bot, chatId, languageCode);
  }
}
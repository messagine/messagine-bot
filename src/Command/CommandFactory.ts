import { DataHandler } from '../DataHandler';
import { TelegramHandler } from '../TelegramHandler';
import { CancelFindCommand } from './CancelFindCommand';
import { CommandBase } from './CommandBase';
import { FindChatCommand } from './FindChatCommand';
import { InvalidCommand } from './InvalidCommand';
import { ListLanguagesCommand } from './ListLanguagesCommand';
import { SetLanguageCommand } from './SetLanguageCommand';
import { SetLanguageParameterCommand } from './SetLanguageParameterCommand';
import { StartCommand } from './StartCommand';

export class CommandFactory {
  public commander(dataHandler: DataHandler, telegramHandler: TelegramHandler, chatId: number, msgText: string, languageCode: string): CommandBase {
    if (msgText.match(/\/start/)) return new StartCommand(dataHandler, telegramHandler, chatId, languageCode);

    const setLanguageMatch = msgText.match(/\/set_language (.+)/)
    if (setLanguageMatch) {
      const newLanguageCode = (setLanguageMatch[1]).toLowerCase();
      return new SetLanguageParameterCommand(dataHandler, telegramHandler, chatId, languageCode, newLanguageCode);
    }

    if (msgText.match(/\/set_language/)) return new SetLanguageCommand(dataHandler, telegramHandler, chatId, languageCode);

    if (msgText.match(/\/list_languages/)) return new ListLanguagesCommand(dataHandler, telegramHandler, chatId, languageCode);

    if (msgText.match(/\/find_chat/)) return new FindChatCommand(dataHandler, telegramHandler, chatId, languageCode);

    if (msgText.match(/\/exit_chat/)) return new FindChatCommand(dataHandler, telegramHandler, chatId, languageCode);

    if (msgText.match(/\/cancel_find/)) return new CancelFindCommand(dataHandler, telegramHandler, chatId, languageCode);

    return new InvalidCommand(dataHandler, telegramHandler, chatId, languageCode);
  }
}
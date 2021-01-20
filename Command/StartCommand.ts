import { CommandBase } from './CommandBase';

export class StartCommand extends CommandBase {
  public async _execute() {
    if (this.newUser) {
      await this.bot.sendMessage(this.chatId, 'Welcome back. To find new chat, type /find_chat command.');
    } else {
      await this.dataHandler.addUser(this.chatId, this.languageCode);
      await this.bot.sendMessage(this.chatId, `Welcome to Every Chat Bot. To find new chat, type /find_chat. Your language is ${this.languageCode}, to change your language type /set_language`);
    }
  }
}

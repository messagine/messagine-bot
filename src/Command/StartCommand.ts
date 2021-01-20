import { CommandBase } from './CommandBase';

export class StartCommand extends CommandBase {
  public async _execute() {
    let startMessage: string;
    if (this.newUser) {
      startMessage = `Welcome to Every Chat Bot. To find new chat, type /find_chat. Your language is ${this.languageCode}, to change your language type /set_language`;
    } else {
      startMessage = 'Welcome back. To find new chat, type /find_chat command.';
    }
    await this.telegramHandler.sendMessage(this.chatId, startMessage);
  }
}

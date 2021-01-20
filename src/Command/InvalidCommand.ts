import { CommandBase } from './CommandBase';

export class InvalidCommand extends CommandBase {
  public async _execute(): Promise<any> {
    await this.telegramHandler.sendMessage(this.chatId, 'Unsupported command.');
  }
}
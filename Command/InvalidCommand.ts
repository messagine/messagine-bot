import { CommandBase } from './CommandBase';

export class InvalidCommand extends CommandBase {
  public async execute(): Promise<any> {
    await this.bot.sendMessage(this.chatId, 'Unsupported command.');
  }
}
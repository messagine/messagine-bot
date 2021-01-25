import { TelegrafContext } from 'telegraf/typings/context';
import commandEnum from '../lib/commandEnum';
import resource from '../resource';

const helpCommand = () => async (ctx: TelegrafContext) => {
  const messageParts = [
    `/${commandEnum.findChat}: ${resource.FIND_CHAT_COMMAND_DESC}`,
    `/${commandEnum.exitChat}: ${resource.EXIT_CHAT_COMMAND_DESC}`,
    `/${commandEnum.setLanguage}: ${resource.SET_LANGUAGE_COMMAND_DESC}`,
    `/${commandEnum.cancelFind}: ${resource.CANCEL_FIND_COMMAND_DESC}`,
    `/${commandEnum.help}: ${resource.HELP_COMMAND_DESC}`,
  ];
  const message = messageParts.join('\n');
  return ctx.reply(message);
};

export { helpCommand };

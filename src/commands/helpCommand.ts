import { IMessagineContext } from '../lib/common';
import { commandEnum, eventTypeEnum } from '../lib/enums';
import resource from '../resource';

const helpCommand = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.help}`);
  const messageParts = [
    `/${commandEnum.findChat}: ${resource.FIND_CHAT_COMMAND_DESC}`,
    `/${commandEnum.exitChat}: ${resource.EXIT_CHAT_COMMAND_DESC}`,
    `/${commandEnum.setLanguage}: ${resource.SET_LANGUAGE_COMMAND_DESC}`,
    `/${commandEnum.cancelFind}: ${resource.CANCEL_FIND_COMMAND_DESC}`,
    `/${commandEnum.help}: ${resource.HELP_COMMAND_DESC}`,
    `/${commandEnum.stats}: ${resource.STATS_COMMAND_DESC}`,
  ];
  const message = messageParts.join('\n');
  return ctx.reply(message);
};

export { helpCommand };

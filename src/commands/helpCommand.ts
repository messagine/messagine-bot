import { IMessagineContext } from '../lib/common';
import { commandEnum, eventTypeEnum } from '../lib/enums';

const helpCommand = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.help}`);
  const messageParts = [
    `/${commandEnum.findChat}: ${ctx.i18n.t('find_chat_command_desc')}`,
    `/${commandEnum.exitChat}: ${ctx.i18n.t('exit_chat_command_desc')}`,
    `/${commandEnum.switchLanguage}: ${ctx.i18n.t('switch_language_command_desc')}`,
    `/${commandEnum.exitLobby}: ${ctx.i18n.t('exit_lobby_command_desc')}`,
    `/${commandEnum.help}: ${ctx.i18n.t('help_command_desc')}`,
    `/${commandEnum.about}: ${ctx.i18n.t('about_command_desc')}`,
  ];
  const message = messageParts.join('\n');
  return ctx.reply(message);
};

export { helpCommand };

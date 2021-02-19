import { IMessagineContext } from '../lib/common';
import { commandEnum, eventTypeEnum } from '../lib/enums';

const helpCommand = () => async (ctx: IMessagineContext) => {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.help}`);
  const messageParts = [
    `/${commandEnum.findChat}: ${ctx.i18n.t('find_chat_command_desc')}`,
    `/${commandEnum.exitChat}: ${ctx.i18n.t('exit_chat_command_desc')}`,
    `/${commandEnum.setLanguage}: ${ctx.i18n.t('set_language_command_desc')}`,
    `/${commandEnum.cancelFind}: ${ctx.i18n.t('cancel_find_command_desc')}`,
    `/${commandEnum.help}: ${ctx.i18n.t('help_command_desc')}`,
    `/${commandEnum.about}: ${ctx.i18n.t('about_command_desc')}`,
  ];
  const message = messageParts.join('\n');
  return ctx.reply(message);
};

export { helpCommand };

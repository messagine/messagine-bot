import { IMessagineContext } from '../lib/common';
import { commandEnum, eventTypeEnum, userStateEnum } from '../lib/enums';
import { helpReply } from '../reply';

const helpCommand = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.help}`);
  return Promise.all([mixPanelPromise, onHelp(ctx)]);
};

const helpAction = () => (ctx: IMessagineContext) => {
  const mixPanelPromise = ctx.mixpanel.track(`${eventTypeEnum.action}.${commandEnum.help}`);
  return Promise.all([mixPanelPromise, ctx.deleteMessage(), onHelp(ctx), ctx.answerCbQuery()]);
};

async function onHelp(ctx: IMessagineContext) {
  return helpReply(ctx, ctx.userState || userStateEnum.idle);
}

export { helpAction, helpCommand };

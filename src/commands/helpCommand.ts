import { IMessagineContext } from '../lib/common';
import { commandEnum, eventTypeEnum, userStateEnum } from '../lib/enums';
import { helpReply } from '../reply';

const helpCommand = () => (ctx: IMessagineContext) => {
  return onHelp(ctx);
};

const helpAction = () => (ctx: IMessagineContext) => {
  return Promise.all([ctx.deleteMessage(), onHelp(ctx), ctx.answerCbQuery()]);
};

async function onHelp(ctx: IMessagineContext) {
  ctx.mixpanel.track(`${eventTypeEnum.command}.${commandEnum.help}`);
  return helpReply(ctx, ctx.userState || userStateEnum.idle);
}

export { helpAction, helpCommand };

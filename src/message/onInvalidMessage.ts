import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
const debug = Debug('message:on_invalid');

const onInvalidMessage = (type: string) => async (ctx: TelegrafContext) => {
  debug(`Triggered invalid ${type} type.`);
  return await ctx.reply('Invalid input.');
};

export { onInvalidMessage };

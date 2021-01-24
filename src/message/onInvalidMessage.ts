import Debug from 'debug';
import { TelegrafContext } from 'telegraf/typings/context';
const debug = Debug('bot:on_invalid_command');

const onInvalidMessage = (type: string) => async (ctx: TelegrafContext) => {
  debug(`Triggered invalid ${type} type.`);
  return await ctx.reply('Invalid input.');
};

export { onInvalidMessage };

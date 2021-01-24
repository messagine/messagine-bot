import { TelegrafContext } from 'telegraf/typings/context';

const debug = require('debug')('bot:on_invalid');

const on_invalid = (type: string) => async (ctx: TelegrafContext) => {
	debug(`Triggered invalid ${type} type.`);
	await ctx.reply('Invalid input.');

	return;
};

export { on_invalid };

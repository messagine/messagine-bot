import { TelegrafContext } from 'telegraf/typings/context';

const debug = require('debug')('bot:greeting_text');

const greeting = () => (ctx: TelegrafContext) => {
	debug('Triggered "greeting" text command');

	const messageId = ctx.message?.message_id;
	const userName = ctx.from?.last_name ? `${ctx.from.first_name} ${ctx.from.last_name}` : ctx.from?.first_name;
	const text = `Hello, ${userName} (user_id: ${ctx.from?.id})! \n Your Message id is: ${messageId}`;

	return ctx.reply(text, { reply_to_message_id: messageId });
};

export { greeting };

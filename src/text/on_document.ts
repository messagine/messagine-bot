import { TelegrafContext } from 'telegraf/typings/context';
import { findExistingChatSafe, getChatId, getMessageDocument, getOpponentChatIds } from '../lib/common';

const debug = require('debug')('bot:on_document');

const on_document = () => async (ctx: TelegrafContext) => {
	debug('Triggered "on_document" command');

	const chatId = getChatId(ctx);
	const messageDocument = getMessageDocument(ctx);
	const existingChat = await findExistingChatSafe(ctx);

	const opponentChatIds = getOpponentChatIds(existingChat, chatId);
	const opponentPromises: Promise<any>[] = [];
	opponentChatIds.forEach(opponentChatId => {
		const opponentPromise = ctx.telegram.sendMessage(opponentChatId, messageDocument.file_id);
		opponentPromises.push(opponentPromise);
	});
	await Promise.all(opponentPromises);

	return;
};

export { on_document };

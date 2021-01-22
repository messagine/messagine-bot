import { status, webhook } from "./src/lib";
import { Handler } from 'aws-lambda';
import { internalServerError } from "./src/lib/responses";

export const statusHandler: Handler = async () => {
	try {
		return await status();
	} catch (e) {
		console.error(e.message);
		return internalServerError();
	}
};

export const webhookHandler: Handler = async (event: any) => {
	try {
		return await webhook(event);
	} catch (e) {
		console.error(e.message);
		return internalServerError();
	}
};
const debug = require("debug")("bot:about_command");

const about = () => (ctx: any) => {
	const author = "Harun Sokullu";
	const name = "every-chat-bot";
	const homepage = "https://github.com/suphero/every-chat-bot";
	const version = "1.0.0";
	
	const message = `*${name} ${version}*\n${author}\n${homepage}`;
	debug(`Triggered "about" command with message \n${message}`);

	return ctx.replyWithMarkdown(message);
};

export { about };

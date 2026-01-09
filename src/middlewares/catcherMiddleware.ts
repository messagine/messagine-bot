import { IMessagineContext } from '../lib/common';

const catcherMiddleware = async (ctx: IMessagineContext, next: any): Promise<void> => {
  try {
    await next();
  } catch (e) {
    // Log error details server-side for debugging
    console.error('Error in bot handler:', {
      error: e,
      message: e.message,
      stack: e.stack,
      chatId: ctx.chat?.id,
    });

    // Send generic error message to user (do not expose internal details)
    await ctx.reply(
      ctx.i18n?.t('error_occurred') || 'An error occurred. Please try again later.',
      e?.extra
    );
  }
};

export { catcherMiddleware };

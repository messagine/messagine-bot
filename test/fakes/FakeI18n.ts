import Debug from 'debug';
import { IMessagineContext } from '../../src/lib/common';
const debug = Debug('fake:i18n');

class FakeI18n {
  public t(resourceKey: any, templateData: any) {
    debug('t', resourceKey, templateData);
  }
  public locale(language: string) {
    debug('t', language);
  }
}

const fakeI18nMiddleware = async (ctx: IMessagineContext, next: any) => {
  ctx.i18n = new FakeI18n();
  await next();
};

export { fakeI18nMiddleware };

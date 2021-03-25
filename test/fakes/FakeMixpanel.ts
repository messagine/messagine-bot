import Debug from 'debug';
import { IMessagineContext } from '../../src/lib/common';
import { FakeMixpanelPeople } from './FakeMixpanelPeople';
const debug = Debug('fake:mixpanel');

class FakeMixpanel {
  public people: FakeMixpanelPeople;
  constructor() {
    this.people = new FakeMixpanelPeople();
  }
  public track(eventName: any, props: any) {
    debug('track', eventName, props);
    return;
  }
}

const fakeMixpanelMiddleware = async (ctx: IMessagineContext, next: any) => {
  ctx.mixpanel = new FakeMixpanel();
  await next();
};

export { fakeMixpanelMiddleware };

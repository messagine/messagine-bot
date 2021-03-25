import Debug from 'debug';
const debug = Debug('fake:mixpanelPeople');
export class FakeMixpanelPeople {
  public set(key: any, value: any) {
    debug('set', key, value);
  }
}

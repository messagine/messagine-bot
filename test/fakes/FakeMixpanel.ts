import { FakeMixpanelPeople } from './FakeMixpanelPeople';

export class FakeMixpanel {
  public people: FakeMixpanelPeople;
  constructor() {
    this.people = new FakeMixpanelPeople();
  }
  public track(_eventName: any, _props: any) {
    return;
  }
}

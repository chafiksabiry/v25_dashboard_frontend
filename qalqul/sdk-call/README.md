Please see @qalqul/sdk-call-demo for its usage

##### Usage:

~~~~
import { Manager } from '@qalqul/sdk-call';

const settings = {
  agent: {
    username: 'ahmed',
    password: '123123123',
    name: 'Ahmed Chijai',
    sipAddress: 'sip:ahmed@okta.qalqul.io',
  },
  server: {
    realm: 'okta.qalqul.io',
    ws: 'wss://okta.qalqul.io:10443',
  }
}

Manager.Client.connect(settings).then(client => {
  this.client = client;
  this.subscription = this.client.subscribe(call => {
    // now do whatever you want to do with it.
  })
})
~~~~

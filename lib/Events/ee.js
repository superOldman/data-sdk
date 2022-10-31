import EventEmitter from '@/Events/EventEmitter.js'
import {addSinglePageEvent } from '@/Events/addEvent'
var spa = new EventEmitter();
var sdk = new EventEmitter();
var ee = {};

ee.spa = spa;

ee.sdk = sdk;

ee.initSystemEvent = function () {
  addSinglePageEvent(function (url) {
    spa.emit('switch', url);
  });
};

ee.EVENT_LIST = {
  spaSwitch: ['spa', 'switch'],
  sdkAfterInitPara: ['sdk', 'afterInitPara'],
  sdkBeforeInit: ['sdk', 'beforeInit'],
  sdkAfterInit: ['sdk', 'afterInit']
};

export default ee
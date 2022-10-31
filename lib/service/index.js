import AjaxSender from './AjaxSender'
import BeaconSender from './BeaconSender'
import ImageSender from './ImageSender'
import { indexOf,isSupportCors } from '@/utils/index'



function getSendType(data) {
  var supportedSendTypes = ['image', 'ajax', 'beacon'];
  var sendType = supportedSendTypes[0];

  if (data.config && indexOf(supportedSendTypes, data.config.send_type) > -1) {
    sendType = data.config.send_type;
  } else {
    sendType = sd.para.send_type;
  }

  if (sendType === 'beacon' && isSupportBeaconSend() === false) {
    sendType = 'image';
  }

  if (sendType === 'ajax' && isSupportCors() === false) {
    sendType = 'image';
  }

  return sendType;
}

export function getSender(data) {
  var sendType = getSendType(data);
  switch (sendType) {
    case 'image':
      return new ImageSender(data);
    case 'ajax':
      return new AjaxSender(data);
    case 'beacon':
      return new BeaconSender(data);
    default:
      return new ImageSender(data);
  }
}
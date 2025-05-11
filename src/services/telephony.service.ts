import { config } from '../config';
const { Vonage } = require('@vonage/server-sdk');
// import fs from 'fs';
// import path from 'path';

// const privateKey = fs.readFileSync(path.resolve(__dirname, '../../private.key'));

export class TelephonyService {
  private vonage = new Vonage({
    applicationId: config.vonage.applicationId,
    privateKey: config.vonage.privateKey,
  });

  async initiateCall(to: string, audioUrl: string): Promise<any> {
    console.log('Initiating call to:', to);
    const result = await this.vonage.voice.createOutboundCall({
      to: [
        {
          type: 'phone',
          number: to,
        },
      ],
      from: {
        type: 'phone',
        number: config.vonage.phoneNumber,
      },
      ncco: [
        {
          "action": "talk",
          "language": "en-US",
          "style": "7",
          "premium": false,
          "text": "Wake up, this is your daily reminder call, you message wil play in three.. two.. one..",
        },
        {
          "action": "stream",
          "streamUrl": [`${config.serverUrl}/audio/audio2mp3.mp3`],
          "level": 1,
          "bargeIn": false,
        }
      ],
    })

    return result; 
  }
}
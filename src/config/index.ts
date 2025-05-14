import { application } from "express";

require('dotenv').config()

interface Config {
  vonage: {
    applicationId: string;
    apiKey: string;
    privateKey: string;
    phoneNumber: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  aws: {
    s3Bucket: string;
    region: string;
  };
  serverUrl: string;
}

export const config: Config = {
  vonage: {
    applicationId: process.env.VONAGE_APPLICATION_ID || '',
    apiKey: process.env.VONAGE_API_KEY || '',
    privateKey: process.env.VONAGE_PRIVATE_KEY || '',
    phoneNumber: process.env.VONAGE_PHONE_NUMBER || ''
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    // password: process.env.REDIS_PASSWORD || ''
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
  },
  aws: {
    s3Bucket: process.env.AWS_S3_BUCKET || 'remindme-audio',
    region: process.env.AWS_REGION || 'us-east-1'
  },
  serverUrl: process.env.SERVER_URL || ''
};
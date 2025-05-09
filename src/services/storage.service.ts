import { S3 } from 'aws-sdk';
import { config } from '../config';

export class StorageService {
  private s3 = new S3({
    region: config.aws.region
  });

  async uploadAudio(file: Express.Multer.File, userId: string): Promise<string> {
    const params = {
      Bucket: config.aws.s3Bucket,
      Key: `audio/${userId}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private'
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  getSignedUrl(key: string): string {
    return this.s3.getSignedUrl('getObject', {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Expires: 300 // 5 minutes
    });
  }
}
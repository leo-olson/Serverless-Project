//import { CreateSignedURLRequest } from '../requests/CreateSignedURL';
import * as AWS from 'aws-sdk';
//import * as AWSXRay from 'aws-xray-sdk';
//const XAWS = AWSXRay.captureAWS(AWS);

export default class TodosStorage {
    constructor(
        private readonly todosStorage = process.env.ATTACHMENTS_S3_BUCKET,
        private readonly s3 = new AWS.S3({ signatureVersion: 'v4'})
    ) {}

    getBucketName() {
        return this.todosStorage;
    }

    getPresignedUploadURL(bucketName : string, attachmentId : string) {
        console.log({bucketName:bucketName})
        return this.s3.getSignedUrl('putObject', 
        {
            Bucket: bucketName,
            Key: attachmentId,
            Expires: 300
          });
    }
}
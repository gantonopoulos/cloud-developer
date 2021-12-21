import * as AWS from "aws-sdk";
import {createLogger} from "../utils/logger";
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('AttachmentAccess')

export class AttachmentAccess {
        
    constructor(
        private readonly s3Client = new XAWS.S3({signatureVersion: 'v4'})
    )
    {}
    
    async getUploadUrl(todoId: string): Promise<string> {
        logger.info(`Generating signed-url for Todo with Id[${todoId}]:`)
        const urlExpiration:Number = Number(process.env.SIGNED_URL_EXPIRATION)
        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: process.env.ATTACHMENT_S3_BUCKET,
            Key: todoId,
            Expires: urlExpiration
        })

        logger.info('Generated Signed-url:\n'+url)
        return url;
    }
}



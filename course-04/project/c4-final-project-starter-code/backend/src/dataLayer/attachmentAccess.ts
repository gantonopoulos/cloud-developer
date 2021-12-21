import * as AWS from "aws-sdk";
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

export class AttachmentAccess {
        
    constructor(
        private readonly s3Client = new XAWS.S3({signatureVersion: 'v4'})
    )
    {}
    
    async getUploadUrl(todoId: string): Promise<string> {
        console.log('Generating signed-url for:'+todoId)
        const urlExpiration:Number = Number(process.env.SIGNED_URL_EXPIRATION)
        const url = this.s3Client.getSignedUrl('putObject', {
            Bucket: process.env.ATTACHMENT_S3_BUCKET,
            Key: todoId,
            Expires: urlExpiration
        })
        
        console.log('Generated Signed-url:\n'+url)
        return url;
    }
}



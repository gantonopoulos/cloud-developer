import {AttachmentAccess} from "../dataLayer/attachmentAccess";


const attachmentAccess = new AttachmentAccess()

export async function getUploadUrl(todoId:string):Promise<string>{
    return await attachmentAccess.getUploadUrl(todoId);
}
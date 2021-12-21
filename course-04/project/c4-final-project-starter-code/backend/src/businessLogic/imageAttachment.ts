import {AttachmentAccess} from "../dataLayer/attachmentAccess";
import {createLogger} from "../utils/logger";

const logger = createLogger('AttachmentAccess')

const attachmentAccess = new AttachmentAccess()

export async function getUploadUrl(todoId:string):Promise<string>{
    logger.info(`Generate signed-url for todoId :[${todoId}]`)
    return await attachmentAccess.getUploadUrl(todoId);
}
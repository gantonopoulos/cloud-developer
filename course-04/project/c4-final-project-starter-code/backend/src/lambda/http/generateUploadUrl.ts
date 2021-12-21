import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import {cors, httpErrorHandler} from 'middy/middlewares'

import {getUploadUrl} from "../../businessLogic/imageAttachment";
import {createLogger} from "../../utils/logger";

const logger = createLogger('generateUploadUrl')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info(`Received request to generate an upload url`)
        const todoId = event.pathParameters.todoId
        if (!todoId) {
            const error = 'Missing TodoId parameter'
            logger.error(`Request failed`, error)
            return {statusCode: 404, body: error}
        }
        
        const response = await getUploadUrl(todoId).then((url) => {
            return {
                statusCode: 201,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    "uploadUrl": url
                })
            }
        }).catch((error) => {
            logger.error(`Request failed`, error)
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            }
        })
        return response as APIGatewayProxyResult
    }
)

handler
    .use(
        cors({
            credentials: true
        }))
    .use(httpErrorHandler())
    
import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import {cors, httpErrorHandler} from 'middy/middlewares'

import {deleteTodo} from '../../businessLogic/todos'
import {getUserId} from "../../auth/utils";
import {createLogger} from "../../utils/logger";

const logger = createLogger('deleteTodo')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info(`Received request to delete Todo`)
        const todoId = event.pathParameters.todoId
        if (!todoId) {
            const error = 'Missing TodoId parameter'
            logger.error(`Request failed`, error)
            return {statusCode: 404, body: error}
        }
        
        try {
            const originatingUserId: string =  getUserId(event)
            await deleteTodo(todoId, originatingUserId)
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: ''
            }

        } catch (e) {
            logger.error(`Request failed`, e)
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: ''
            }
        }
    }
)

handler
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )


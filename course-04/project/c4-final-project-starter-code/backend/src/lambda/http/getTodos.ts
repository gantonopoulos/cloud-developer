import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import {cors, httpErrorHandler} from 'middy/middlewares'
import {getTodosForUser} from "../../businessLogic/todos";
import {createLogger} from "../../utils/logger";
import {getUserId} from "../../auth/utils";

const logger = createLogger('getTodos')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info(`Received get Todos request`)
        try {
            const requestingUserId: string = getUserId(event)
            const todos = await getTodosForUser(requestingUserId);

            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    items: todos
                })
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
    })

handler.use(
    cors({
        credentials: true
    })
).use(httpErrorHandler())

import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'

import {updateTodo} from '../../businessLogic/todos'
import {UpdateTodoRequest} from '../../requests/UpdateTodoRequest'
import {cors, httpErrorHandler} from "middy/middlewares";
import {createLogger} from "../../utils/logger";
import {getUserId} from "../../auth/utils";

const logger = createLogger('updateTodo')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info('Received Update todo request')
        const todoId = event.pathParameters.todoId

        if (!todoId) {
            const error = 'Missing TodoId parameter'
            logger.error(`Request failed`, error)
            return {statusCode: 404, body: error}
        }
        const updatedItemData: UpdateTodoRequest = JSON.parse(event.body)
        if (!updatedItemData) {
            const error = 'Malformed update request payload'
            logger.error(`Request failed`, error)
            return {statusCode: 404, body: error}
        }
        try {
            const requestingUserId: string = getUserId(event)
            await updateTodo(todoId, requestingUserId, updatedItemData)

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

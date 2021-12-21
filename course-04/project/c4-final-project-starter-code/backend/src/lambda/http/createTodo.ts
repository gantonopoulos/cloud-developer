import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import {cors, httpErrorHandler} from 'middy/middlewares'
import {CreateTodoRequest} from '../../requests/CreateTodoRequest'
import {createTodo} from '../../businessLogic/todos'
import {createLogger} from "../../utils/logger";
import {getUserId} from "../../auth/utils";

const logger = createLogger('createTodo')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info(`Received request to create Todo`)
        const createTodoRequest: CreateTodoRequest = JSON.parse(event.body)
        if (!createTodoRequest) {
            const error = 'Missing CreateTodoRequest data'
            logger.error(`Creation failed`, error)
            return {statusCode: 404, body: error}
        }
        logger.info(`Request Data:${JSON.stringify(createTodoRequest)}`)

        try {
            let originatingUserId: string = getUserId(event);
            const newItem = await createTodo(createTodoRequest, originatingUserId)
            return {
                statusCode: 201,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({item: newItem})
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

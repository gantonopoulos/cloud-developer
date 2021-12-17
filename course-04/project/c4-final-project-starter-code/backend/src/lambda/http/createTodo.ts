import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import {getToken} from "../utils";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const createTodoRequest: CreateTodoRequest = JSON.parse(event.body)
      
      // TODO: Implement creating a new TODO item
      const jwtToken = getToken(event.headers.Authorization)
      console.log('Received JWT Token:' + jwtToken);
      const newItem = await createTodo(createTodoRequest, jwtToken);
      
      return {
          statusCode: 201,
          headers: {
              'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
              newItem
          })
      }
  }
)

handler.use(
  cors({
    credentials: true
  })
)

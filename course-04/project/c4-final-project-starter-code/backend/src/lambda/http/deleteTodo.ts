import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import {deleteTodo} from '../../businessLogic/todos'
import {getToken} from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Remove a TODO item by id
      const todoId = event.pathParameters.todoId
      if(!todoId){
          return {
              statusCode: 401,
              body:'Missing TodoId parameter'}
      }
      const jwtToken = getToken(event.headers.Authorization)

      await deleteTodo(todoId, jwtToken)

      return {
          statusCode: 200,
          headers: {
              'Access-Control-Allow-Origin': '*'
          },
          body: ''
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


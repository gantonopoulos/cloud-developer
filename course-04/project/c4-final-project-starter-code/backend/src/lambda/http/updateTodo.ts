import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
//import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import {getToken} from '../utils'
import {cors} from "middy/middlewares";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      console.log('Reading Update target ID')
      const todoId = event.pathParameters.todoId
      if(!todoId){
              return { 
                  statusCode: 401,
                  body:'Missing TodoId parameter'}
          }
      console.log('Parsing update request!')
      const updatedItemData: UpdateTodoRequest = JSON.parse(event.body)
      console.log('Update request parsed:'+updatedItemData)
      
      const jwtToken = getToken(event.headers.Authorization)

      // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
      await updateTodo(todoId, updatedItemData, jwtToken)

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
  // .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

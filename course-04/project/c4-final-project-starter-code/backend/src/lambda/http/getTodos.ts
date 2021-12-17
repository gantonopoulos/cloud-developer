import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import {getAllTodos} from "../../businessLogic/todos";

// import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
// import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      // Write your code here
      const todos = await getAllTodos();

      return{
          statusCode:200,
          headers:{
              'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
              items:todos
          })
      }
  })
  
handler.use(
  cors({
    credentials: true
  })
)

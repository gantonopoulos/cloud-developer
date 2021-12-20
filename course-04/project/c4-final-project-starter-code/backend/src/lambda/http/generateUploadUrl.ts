import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import {getUploadUrl} from "../../businessLogic/imageAttachment";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const todoId = event.pathParameters.todoId
      console.log(`Upload-url for:${todoId} requested!`)
      // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
      const url = await getUploadUrl(todoId);

      return {
          statusCode: 201,
          headers: {
              'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
              "uploadUrl": url
          })
      }
  }
)

handler
    .use(
        cors({
            credentials: true
        }))
    .use(httpErrorHandler())
    
import {
  APIGatewayTokenAuthorizerEvent,
  CustomAuthorizerResult
} from 'aws-lambda'
import 'source-map-support/register'

import {verify, decode, Jwt} from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

import {JwksClient} from "../../auth/JwksClient";
import {extractTokenFromHeaderAuthInfo} from "../../auth/utils";

const logger = createLogger('auth')

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  
  try {
    if(!event)
      logger.error('Unexpected Authorizer type. Expected [APIGatewayTokenAuthorizerEvent]')
    
    logger.info('Authorizing a user', event.authorizationToken)
    const jwtToken:JwtPayload = await verifyToken(extractTokenFromHeaderAuthInfo(event.authorizationToken))
    logger.info('User was authorized')

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(token: string): Promise<JwtPayload> {
  const decodedToken: Jwt = decode(token, {complete: true}) as Jwt;

  logger.info(`Verifying token:[${token}]\n using kid:[${decodedToken.header.kid}]`)
  const certificate = await JwksClient.getCertificateFor(decodedToken.header.kid)
  return verify(token, certificate, {algorithms: ["RS256"]}) as JwtPayload
}



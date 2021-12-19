import {
  APIGatewayTokenAuthorizerEvent,
  CustomAuthorizerResult
} from 'aws-lambda'
import 'source-map-support/register'

import {verify, decode, Jwt} from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

import {getToken} from "../utils";
import {JwksClient} from "../../auth/JwksClient";

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://gantonopoulos.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  
  try {
    if(!event)
      logger.error('Unexpected Authorizer type. Expected [APIGatewayTokenAuthorizerEvent]')
    
    logger.info('Authorizing a user', event.authorizationToken)
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

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

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  console.log('Extracting token from header' + authHeader)
  const token = getToken(authHeader) 
  const decodedToken:Jwt = decode(token,{complete: true}) as Jwt;


  console.log(`Verifying token:[${token}]\n using kid:[${decodedToken.header.kid}]`)
  const jwksClient:JwksClient = new JwksClient();
  const verificationKeys = await jwksClient.downloadJwksVerificationKeys(jwksUrl)
  
  const certificate = jwksClient.getCertificateFor(decodedToken.header.kid, verificationKeys)
  console.log(`\n using certificate:[${certificate}]`)
  return verify(token, certificate, {algorithms: ["RS256"]}) as JwtPayload
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
}



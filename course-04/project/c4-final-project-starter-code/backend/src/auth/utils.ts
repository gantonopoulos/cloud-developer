import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'
import {APIGatewayProxyEvent} from "aws-lambda";

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  return parseUserId(extractTokenFromHeaderAuthInfo(event.headers.Authorization))
}

export function extractTokenFromHeaderAuthInfo(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')

  if(split.length != 2)
    throw new Error('Malformed Bearer Token!')

  return split[1]
}
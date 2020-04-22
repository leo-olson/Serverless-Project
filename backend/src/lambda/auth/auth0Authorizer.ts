import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'

import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
//import { Jwt } from '../../../../standby/auth/Jwt'


const logger = createLogger('auth')

//const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'

const auth0Secret = process.env.AUTH_0_SECRET


export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = verifyToken(event.authorizationToken)
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


function verifyToken (authHeader:string) : JwtPayload{
  // function verifyToken (authHeader:string){
      if (!authHeader)
          throw new Error('No authentication header')
  
      if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')
  

      const split = authHeader.split(' ')
      const token = split[1]

      return verify(token, auth0Secret) as JwtPayload

  }

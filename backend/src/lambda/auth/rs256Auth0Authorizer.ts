import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJRY9htWytYHlfMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi00dnp3LTVrci5hdXRoMC5jb20wHhcNMjAwNDIwMTYwNTMwWhcNMzMx
MjI4MTYwNTMwWjAhMR8wHQYDVQQDExZkZXYtNHZ6dy01a3IuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2/f1UloLHIga33kLta1DUqUN
I6mlwymCiFEL16fGqGG7VfGat+03p9MSeHnXfVC6LrXVHp7zIGyb/ksmLH/4MoXr
zXj38dKZmOffbSMVIbgBJRM0dbmLupodA17qs8BdPGFhHWXn2EmnsMd9/mksDwPn
1efWAmojt+Q9DX1rYvUe2XPR1EZw5B8tq4GMM3CEXnpSspg+EodPHdSb0lx2ux6z
pNfTM4ZyeP+Z8AyoGQKimN5GdfWtK0rrdSa3GHJ0lHdII3r4zjhn4FqDLNRm0KkH
AgdCb8bJBBBOuAM/QqBPft+Fbt166VHO0ZlF9cCzwACHSZs9G4IPMrHBSeETPwID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ5EaTfSAwSjwYbNqXS
013i4UeJbDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAEfxM9r7
FV6Y4EnZg2tFGmPqwig4gQfF3WZKoyflstp1kZ5UKM7yrufZuuihSB5KEziRdd/0
9IC1RmPOJyVbnmteXAoKxxb9BP9/uUzRKS1gwqNPLuFY5xeYM4/8H/MubLWKlNsE
TnBmwDJUghmM+lFEYlt7NYaqUn7PRK4u26j9f8FzeODU3dBmyRV/Bmo/3pnxXY1K
+Xrwutax8UiY6VN33dAMDyZblLk1gzTaDLMBS7AJl0IjZy4vr+b4Jqet9p/H9TR5
JViQQCZo6ZfXWN05QfuREo/H48WHFWjDmECYfXR3lNU/Lmo79SMxg8UW7JO9fRv1
+0++P9ChMScOBC8=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

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
    console.log('User authorized', e.message)

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

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}
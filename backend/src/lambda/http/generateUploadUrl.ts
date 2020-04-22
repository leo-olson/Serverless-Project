import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
//import {parseUserId } from '../../auth/utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.ATTACHMENTS_S3_BUCKET


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const todoId = event.pathParameters.todoId
  //const authorization = event.headers.Authorization
  //const split = authorization.split(' ')
  //const jwtToken = split[1]
  //const userId = parseUserId(jwtToken)

  const attachmentId = uuid.v4()

  logger.info("Generating upload URL:", {
    todoId: todoId,
    attachmentId: attachmentId
  });

  const url = getUploadUrl(attachmentId)
  logger.info("Url acquired", {url:url});
  await updateTodoAttachmentUrl(todoId,attachmentId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

  async function updateTodoAttachmentUrl(todoId: string, attachmentUrl: string){

      logger.info(`Updating todoId ${todoId} with attachmentUrl ${attachmentUrl}`)

      await docClient.update({
          TableName: todosTable,
          Key: {
              "todoId": todoId
          },
          UpdateExpression: "set attachmentUrl = :attachmentUrl",
          ExpressionAttributeValues: {
              ":attachmentUrl": `https://${bucketName}.s3.amazonaws.com/${attachmentUrl}`
          }
      }).promise();
  }

  function getUploadUrl(attachmentId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: attachmentId,
      Expires: 300
    })
  }

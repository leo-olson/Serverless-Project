import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS from 'aws-sdk'

import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

const uuid = require('uuid/v4')

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Processing event", {event: event.body})
  const todoId = uuid()

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const userId = parseUserId(jwtToken)
  
  const item = await createTodo(userId, event, todoId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }

}

async function createTodo(userId: string, event: any, todoId: string) {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const item = {
    userId,
    todoId,
    ...newTodo,
  }
  logger.info('Storing new item: ', item)

  await docClient
    .put({
      TableName: todosTable,
      Item: item
    })
    .promise()
  return item
}
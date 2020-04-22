import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import * as AWS from 'aws-sdk'

import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  logger.info("Processing event", {event: event.body});
  const todoId = event.pathParameters.todoId
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const userId = parseUserId(jwtToken)
  logger.info("Processing event", {userId: userId});

  const validTodoId = await todoExists(todoId)
  logger.info("Processing event", {validTodoId: validTodoId});

  if (!validTodoId){
    return{
      statusCode:404,
      headers:{
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }   

  await deleteTodo(todoId);

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}

async function deleteTodo(todoId: string) {
  await docClient.delete({
      TableName: todosTable,
      Key: {
          "todoId": todoId
      }
  }).promise();
  logger.info("Delete Done", {todoId: todoId});
}

async function todoExists(todoId: string){
  const result = await docClient
    .get({
      TableName: todosTable,
      Key:{
        todoId: todoId
      }
    })
    .promise()

    console.log('Get todo: ', result)
    return !!result.Item
}
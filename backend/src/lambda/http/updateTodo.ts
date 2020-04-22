import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'
import { parseUserId } from '../../auth/utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const todoId = event.pathParameters.todoId
  logger.info(`Updating todoId ${todoId}`)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const userId = parseUserId(jwtToken)
  const validTodoId = await todoExists(todoId)

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

  await updateTodo(todoId, userId, updatedTodo);

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
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

async function updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest){
  logger.info("Updating To Do", {
      todoId: todoId,
      updatedTodo: updatedTodo
  });

  await docClient.update({
      TableName: todosTable,
      Key: {
          "todoId": todoId,
          "userId": userId
      },
      UpdateExpression: "set #todoName = :name, done = :done, dueDate = :dueDate",
      ExpressionAttributeNames: {
          "#todoName": "name"
      },
      ExpressionAttributeValues: {
          ":name": updatedTodo.name,
          ":done": updatedTodo.done,
          ":dueDate": updatedTodo.dueDate
      }
  }).promise()
  logger.info("Update Done")

}
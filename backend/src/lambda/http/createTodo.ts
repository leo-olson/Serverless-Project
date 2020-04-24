import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')


import { createTodo } from '../../businessLogic/todos';



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Processing event", {event: event.body})
  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  
  const item = await createTodo(event, newTodo);
  logger.info("Item Created", {item:item})
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: item
    })
  };
}


import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { generateUploadUrl } from '../../businessLogic/todos'
import { updateTodoAttachmentUrl } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')
import * as uuid from 'uuid';


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  logger.info("Processing event", {event: event.body});
  const attachmentId = uuid.v4()
  const url = await generateUploadUrl(event, attachmentId);

  logger.info("Returning url", {url: url});
  await updateTodoAttachmentUrl(event, attachmentId)


  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

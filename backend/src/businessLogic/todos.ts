import 'source-map-support/register';
import * as uuid from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';

import TodosAccess from '../dataLayer/todosAccess';
import TodosStorage from '../dataLayer/todosStorage'
import { parseUserId } from '../auth/utils';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger'
const logger = createLogger('generateUploadUrl')

const todosAccess = new TodosAccess();
const todosStorage = new TodosStorage();

export async function getTodos(event: APIGatewayProxyEvent) {
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken)
    
    
    return await todosAccess.getTodos(userId);
}

export async function createTodo(event: APIGatewayProxyEvent,createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4();
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken)
    const createdAt = new Date(Date.now()).toISOString();


    const item = {
        userId,
        todoId,
        createdAt,
        done: false,
        //attachmentUrl: `https://${todosStorage.getBucketName()}.s3.amazonaws.com/${todoId}`,
        ...createTodoRequest,
    }

    await todosAccess.createTodo(item);

    return item;
    }

export async function deleteTodo(event: APIGatewayProxyEvent) {
    const todoId = event.pathParameters.todoId;
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken)

    if (!(await todosAccess.getTodoCheck(todoId, userId))) {
        return false;
    }

    await todosAccess.deleteTodo(todoId, userId);

    return true;
}

export async function updateTodo(event: APIGatewayProxyEvent,updateTodoRequest: UpdateTodoRequest) {

    const todoId = event.pathParameters.todoId;
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken)

    if (!(await todosAccess.getTodoCheck(todoId, userId))) {
    return false;
    }

    await todosAccess.updateTodo(todoId, userId, updateTodoRequest);

    return true;
}

export async function generateUploadUrl(event: APIGatewayProxyEvent, attachmentId: string) {
    logger.info("generateurl event body", {event: event.body});
    const bucket = todosStorage.getBucketName()
    const todoId = event.pathParameters.todoId
    logger.info("Processing event", {id: todoId});

    

    return todosStorage.getPresignedUploadURL(bucket,attachmentId);
}

export async function updateTodoAttachmentUrl(event: APIGatewayProxyEvent, attachmentId:string){

    const todoId = event.pathParameters.todoId
    const bucket = todosStorage.getBucketName()

    
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken)

    logger.info(`Updating todoId ${todoId} with attachmentUrl ${attachmentId}`)

    await todosAccess.updateTodoAttachmentUrl(todoId,userId, bucket, attachmentId)


}
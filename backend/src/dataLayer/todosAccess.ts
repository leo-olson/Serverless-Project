import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const XAWS = AWSXRay.captureAWS(AWS);

export default class TodosAccess {
  constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly userIdIndex = process.env.USERID_INDEX
  ) {}

  async getTodos(userId) {
    const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise();

    return result.Items;
}

  async createTodo(item) {
      await this.docClient.put({
          TableName: this.todosTable,
          Item: item
      }).promise();
  }

  async deleteTodo(todoId, userId) {
      await this.docClient.delete({
          TableName: this.todosTable,
          Key: {
              todoId,
              userId
          }
      }).promise();
  }

  async getTodoCheck(todoId, userId) {
      const result = await this.docClient.get({
          TableName: this.todosTable,
          Key: {
              todoId,
              userId
          }
      }).promise();

      return result.Item;
  }

  async updateTodo(todoId, userId, updatedTodo) {
      await this.docClient.update({
          TableName: this.todosTable,
          Key: {
              todoId,
              userId
          },
          UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
          ExpressionAttributeValues: {
              ':n': updatedTodo.name,
              ':due': updatedTodo.dueDate,
              ':d': updatedTodo.done
          },
          ExpressionAttributeNames: {
              '#name': 'name',
              '#dueDate': 'dueDate',
              '#done': 'done'
          }
      }).promise();
  }

  async updateTodoAttachmentUrl(todoId: string, userId: string, bucketName, attachmentUrl: string){ 
    
    await this.docClient.update({
        TableName: this.todosTable,
        Key: {
            "todoId": todoId,
            userId
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
            ":attachmentUrl": `https://${bucketName}.s3.amazonaws.com/${attachmentUrl}`
        }
    }).promise();
    }

}



import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {TodoItem, TodoItemKey} from "../models/TodoItem";
import {TodoUpdate} from "../models/TodoUpdate";
import * as AWS from "aws-sdk"
import {createLogger} from "../utils/logger";
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodoAccess')

export class TodoAccess {

    constructor(
        private readonly dynamoDbClient=  new XAWS.DynamoDB.DocumentClient()
    ) {      
    }
    
    async getTodo(withKey:TodoItemKey): Promise<TodoItem> {
        logger.info('Querying todo [Id,UserId] :[' + withKey.todoId + "," + withKey.userId + "]")
        const queryResult = await this.dynamoDbClient
            .query({
                TableName: process.env.TODOS_TABLE,
                KeyConditionExpression:"todoId = :todoIdToGet and userId = :userIdToGet",
                ExpressionAttributeValues:{
                    ":todoIdToGet":withKey.todoId,
                    ":userIdToGet":withKey.userId
                }
            })
            .promise()

        return queryResult.Items[0] as TodoItem;
    }
    
    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info(`Querying Todos for User [${userId}]`)
        const queryResult = await this.dynamoDbClient
            .query({
                TableName: process.env.TODOS_TABLE,
                KeyConditionExpression:"userId = :userIdToGet",
                ExpressionAttributeValues:{
                    ":userIdToGet":userId
                }
            })
            .promise()
        
        return queryResult.Items as TodoItem[];
    }

    async createTodo(todoItem: TodoItem) {
        logger.info(`Creating Todo item with Id:[${todoItem.todoId}]`)
        await this.dynamoDbClient.put({
            TableName: process.env.TODOS_TABLE,
            Item: todoItem
        }).promise()

        return todoItem
    }

    async updateTodo(keyOfItemToUpdate:TodoItemKey, updatedItemData: TodoUpdate) {
        logger.info(`Updating Todo item with Id:[${keyOfItemToUpdate.todoId}]`)
        const updateParams:DocumentClient.UpdateItemInput = {
            TableName: process.env.TODOS_TABLE,
            Key: {
                'todoId': keyOfItemToUpdate.todoId,
                'userId': keyOfItemToUpdate.userId
            },
            ExpressionAttributeNames:{
                "#n":"name"
            },
            UpdateExpression: "SET #n = :updatedName, dueDate=:updatedDueDate, done=:updatedDone",
            ExpressionAttributeValues: {
                ":updatedName": updatedItemData.name,
                ":updatedDueDate": updatedItemData.dueDate,
                ":updatedDone": updatedItemData.done
            },
            ReturnValues: "ALL_NEW"
        }

        logger.info('Sending update params' + JSON.stringify(updateParams))
        await this.dynamoDbClient.update(updateParams).promise()
    }

    async deleteTodo(keyOfItemToUpdate:TodoItemKey) {

        logger.info('Deleting Todo item ' + keyOfItemToUpdate.todoId)
        const deleteItemInput:DocumentClient.DeleteItemInput = {
            TableName: process.env.TODOS_TABLE,
            Key: {
                'todoId': keyOfItemToUpdate.todoId,
                'userId': keyOfItemToUpdate.userId
            },
        }

        logger.info('Sending delete params' + JSON.stringify(deleteItemInput))
        await this.dynamoDbClient.delete(deleteItemInput).promise()
    }
}
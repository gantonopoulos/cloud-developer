import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {TodoItem, TodoItemKey} from "../models/TodoItem";
import {TodoUpdate} from "../models/TodoUpdate";

export class TodoAccess {

    constructor(
        private readonly dynamoDbClient: DocumentClient= new DocumentClient()
    ) {      
    }
    
    async getAllTodos(): Promise<TodoItem[]> {
        console.log('Getting all TODO items!')
        const todos = await this.dynamoDbClient
            .scan({
                TableName: process.env.TODOS_TABLE,
                IndexName: process.env.TODOS_CREATED_AT_INDEX,
            })
            .promise()
        console.log('Found '+todos.Count+' items!')
        return todos.Items as TodoItem[];
    }

    async createTodo(todoItem: TodoItem) {
        console.log('Creating TODO item ' + todoItem.todoId)
        await this.dynamoDbClient.put({
            TableName: process.env.TODOS_TABLE,
            Item: todoItem
        }).promise()

        return todoItem
    }

    async updateTodo(keyOfItemToUpdate:TodoItemKey, updatedItemData: TodoUpdate) {

        console.log('Updating TODO item ' + keyOfItemToUpdate.todoId)
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

        console.log('Sending update params' + JSON.stringify(updateParams))
        await this.dynamoDbClient.update(updateParams).promise()
    }

    async deleteTodo(keyOfItemToUpdate:TodoItemKey) {

        console.log('Updating TODO item ' + keyOfItemToUpdate.todoId)
        const deleteItemInput:DocumentClient.DeleteItemInput = {
            TableName: process.env.TODOS_TABLE,
            Key: {
                'todoId': keyOfItemToUpdate.todoId,
                'userId': keyOfItemToUpdate.userId
            },
        }

        console.log('Sending update params' + JSON.stringify(deleteItemInput))
        await this.dynamoDbClient.delete(deleteItemInput).promise()
    }
}
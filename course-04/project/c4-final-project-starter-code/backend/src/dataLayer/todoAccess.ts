import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {TodoItem} from "../models/TodoItem";

 

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
}
import * as uuid from 'uuid'
import {TodoItem, TodoItemKey} from "../models/TodoItem";
import {TodoAccess} from "../dataLayer/todoAccess";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {parseUserId} from "../auth/utils";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";

const todoAccess = new TodoAccess();

export async function getAllTodos(): Promise<TodoItem[]> {
    return await todoAccess.getAllTodos()
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {

    const itemId = uuid.v4()
    const userId = parseUserId(jwtToken)
    console.log('User Id '+userId+' identified. ')
    const creationDate: Date = new Date();

    return await todoAccess.createTodo({
        todoId: itemId,
        userId: userId,
        createdAt: creationDate.toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl:`https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${itemId}`
    })
}


export async function updateTodo( todoIdToUpdate:string, updateRequest:UpdateTodoRequest, jwtToken: string)
{
    const keyOfItemToUpdate:TodoItemKey = {
        todoId : todoIdToUpdate,
        userId: parseUserId(jwtToken)
    }
    
    const updatedItemData: TodoUpdate = {
        name:updateRequest.name,
        dueDate:updateRequest.dueDate,
        done:updateRequest.done
    }
    await todoAccess.updateTodo(keyOfItemToUpdate, updatedItemData)
}

export async function deleteTodo( todoIdToUpdate:string, jwtToken: string)
{
    const keyOfItemToUpdate:TodoItemKey = {
        todoId : todoIdToUpdate,
        userId: parseUserId(jwtToken)
    }
    await todoAccess.deleteTodo(keyOfItemToUpdate)
}


export async function todoExists(todoIdToUpdate: string, jwtToken: string): Promise<TodoItem> {
    const keyOfItemToUpdate: TodoItemKey = {
        todoId: todoIdToUpdate,
        userId: parseUserId(jwtToken)
    }
    return await todoAccess.getTodo(keyOfItemToUpdate);
}

export async function getTodosForUser(jwtToken: string): Promise<TodoItem[]> {
    return await todoAccess.getTodosForUser(parseUserId(jwtToken));
}
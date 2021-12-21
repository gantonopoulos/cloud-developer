import * as uuid from 'uuid'
import {TodoItem, TodoItemKey} from "../models/TodoItem";
import {TodoAccess} from "../dataLayer/todoAccess";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";
import {createLogger} from "../utils/logger";

const logger = createLogger('TodoAccess')

const todoAccess = new TodoAccess();

export async function createTodo(createTodoRequest: CreateTodoRequest, requestingUserID: string): Promise<TodoItem> {
    const itemId = uuid.v4()
    logger.info(`Updating Todo with ID:[${itemId}] for user with ID:[${requestingUserID}]`)
    const creationDate: Date = new Date();

    return await todoAccess.createTodo({
        todoId: itemId,
        userId: requestingUserID,
        createdAt: creationDate.toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl:`https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${itemId}`
    })
}

export async function todoExists(keyOfItemToUpdate:TodoItemKey): Promise<boolean> {
    const todo = await todoAccess.getTodo(keyOfItemToUpdate);
    return !!todo
}

export async function updateTodo(todoIdToUpdate: string, userId: string, updateRequest: UpdateTodoRequest)
{
    logger.info(`Updating Todo with Id:[${todoIdToUpdate}]`)
    const keyOfItemToUpdate:TodoItemKey = {
        todoId : todoIdToUpdate,
        userId: userId
    }
    
    const updatedItemData: TodoUpdate = {
        name:updateRequest.name,
        dueDate:updateRequest.dueDate,
        done:updateRequest.done
    }

    if(!await todoExists(keyOfItemToUpdate))
        throw new Error(`Could not locate Todo with Id:[${todoIdToUpdate}]`)
    await todoAccess.updateTodo(keyOfItemToUpdate, updatedItemData)
}

export async function deleteTodo( todoIdToDelete:string, userIdToDelete: string)
{
    logger.info(`Deleting Todo with ID:[${todoIdToDelete}]`)
    const keyOfItemToUpdate:TodoItemKey = {
        todoId : todoIdToDelete,
        userId: userIdToDelete
    }
    await todoAccess.deleteTodo(keyOfItemToUpdate)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting Todos for user with Id:[${userId}]`)
    return await todoAccess.getTodosForUser(userId);
}


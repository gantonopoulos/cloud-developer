import * as uuid from 'uuid'
import {TodoItem} from "../models/TodoItem";
import {TodoAccess} from "../dataLayer/todoAccess";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {parseUserId} from "../auth/utils";

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
        attachmentUrl:"TBD"
    })
}
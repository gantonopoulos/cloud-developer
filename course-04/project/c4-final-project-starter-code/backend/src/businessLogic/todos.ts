import {TodoItem} from "../models/TodoItem";
import {TodoAccess} from "../dataLayer/todoAccess";

const todoAccess = new TodoAccess();

export async function getAllTodos(): Promise<TodoItem[]> {
    return await todoAccess.getAllTodos()
}
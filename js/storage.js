export function saveTodoToStorage(todoItem) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.push(todoItem);
    localStorage.setItem('todos', JSON.stringify(todos));
}

export function saveTodosToStorage() {
    const items = document.querySelectorAll('.list-group-item');
    const todos = Array.from(items).map(item => item.todoItem);
    localStorage.setItem('todos', JSON.stringify(todos));
}

export function removeItemFromStorage(item) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const title = item.querySelector('h5').innerText;
    const description = item.querySelector('p').innerText;
    const endDate = item.todoItem.endDate;
    const priority = item.todoItem.priority;

    const updatedTodos = todos.filter(todo =>
        !(todo.title === title && todo.description === description && todo.endDate === endDate && todo.priority === priority)
    );

    localStorage.setItem('todos', JSON.stringify(updatedTodos));
}

export function getTodosFromStorage() {
    return JSON.parse(localStorage.getItem('todos')) || [];
}

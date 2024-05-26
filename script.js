document.addEventListener('DOMContentLoaded', () => {
    const openAddModalButton = document.getElementById('open-add-modal-btn');
    const saveButton = document.getElementById('save-btn');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const endDateInput = document.getElementById('end-date');

    openAddModalButton.addEventListener('click', () => {
        clearInputs();
        $('#todoModal').modal('show');
    });

    saveButton.addEventListener('click', addTodo);

    function addTodo() {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const endDate = endDateInput.value;

        if (title && description && endDate) {
            const todoItem = { id: generateId(), title, description, endDate, status: 'todo' };
            addTodoToDOM(todoItem);
            saveTodoToStorage(todoItem);
            $('#todoModal').modal('hide');
        } else {
            alert('Please fill in all fields');
        }
    }

    function addTodoToDOM(todoItem) {
        const { id, title, description, endDate, status } = todoItem;
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.id = id;
        li.innerHTML = `
            <h5>${title}</h5>
            <p>${description}</p>
        `;
        document.querySelector(`#${status} .list-group`).appendChild(li);
        li.todoItem = todoItem;
    }

    function saveTodoToStorage(todoItem) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.push(todoItem);
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function clearInputs() {
        titleInput.value = '';
        descriptionInput.value = '';
        endDateInput.value = '';
    }

    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
});

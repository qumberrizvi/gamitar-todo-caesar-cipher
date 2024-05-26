document.addEventListener('DOMContentLoaded', () => {
    const openAddModalButton = document.getElementById('open-add-modal-btn');
    const saveButton = document.getElementById('save-btn');
    const updateButton = document.getElementById('update-btn');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const endDateInput = document.getElementById('end-date');
    const modalTitle = document.getElementById('todoModalLabel');
    let currentEditItem = null;

    openAddModalButton.addEventListener('click', () => {
        clearInputs();
        saveButton.classList.remove('d-none');
        updateButton.classList.add('d-none');
        modalTitle.textContent = 'Add To-Do';
        $('#todoModal').modal('show');
    });

    saveButton.addEventListener('click', addTodo);
    updateButton.addEventListener('click', updateTodo);

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

    function updateTodo() {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const endDate = endDateInput.value;

        if (title && description && endDate) {
            const todoItem = { id: currentEditItem.id, title, description, endDate, status: currentEditItem.status };
            currentEditItem.title = title;
            currentEditItem.description = description;
            currentEditItem.endDate = endDate;
            updateTodoInDOM(currentEditItem);
            saveTodosToStorage();
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
            <div>
                <button class="btn btn-sm btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit" onclick="editItem(this)">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" data-toggle="tooltip" data-placement="top" title="Delete" onclick="deleteItem(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        document.querySelector(`#${status} .list-group`).appendChild(li);
        li.todoItem = todoItem;
        $('[data-toggle="tooltip"]').tooltip();
    }

    function updateTodoInDOM(todoItem) {
        const items = document.querySelectorAll('.list-group-item');
        items.forEach(item => {
            if (item.todoItem === todoItem) {
                item.querySelector('h5').textContent = todoItem.title;
                item.querySelector('p').textContent = todoItem.description;
            }
        });
    }

    function saveTodoToStorage(todoItem) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.push(todoItem);
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    window.saveTodosToStorage = function() {
        const items = document.querySelectorAll('.list-group-item');
        const todos = Array.from(items).map(item => item.todoItem);
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    window.editItem = function(btn) {
        const item = btn.parentNode.parentNode;
        const todoItem = item.todoItem;
        titleInput.value = todoItem.title;
        descriptionInput.value = todoItem.description;
        endDateInput.value = todoItem.endDate;
        saveButton.classList.add('d-none');
        updateButton.classList.remove('d-none');
        currentEditItem = todoItem;
        modalTitle.textContent = 'Update To-Do';
        $('#todoModal').modal('show');
    }

    window.deleteItem = function(btn) {
        const item = btn.parentNode.parentNode;
        // Hide the tooltip
        $(btn).tooltip('hide');
        item.parentNode.removeChild(item);
        removeItemFromStorage(item);
    }

    function clearInputs() {
        titleInput.value = '';
        descriptionInput.value = '';
        endDateInput.value = '';
    }

    function removeItemFromStorage(item) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const title = item.querySelector('h5').innerText;
        const description = item.querySelector('p').innerText;
        const endDate = item.todoItem.endDate;

        const updatedTodos = todos.filter(todo =>
            !(todo.title === title &&
                todo.description === description &&
                todo.endDate === endDate)
        );

        localStorage.setItem('todos', JSON.stringify(updatedTodos));
    }

    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
});

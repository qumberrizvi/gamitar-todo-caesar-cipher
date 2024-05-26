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

    // Load initial data from local storage
    let storedData = JSON.parse(localStorage.getItem('todos')) || [];
    const sampleAddedFlag = localStorage.getItem('sampleAdded');

    // Add sample data if no data found in local storage and sample data has not been added yet
    if (storedData.length === 0 && !sampleAddedFlag) {
        storedData = [
            { id: generateId(), title: 'Sample To-Do', description: 'This is a sample to-do item', endDate: '2024-12-31', status: 'todo' },
            { id: generateId(), title: 'Sample Doing', description: 'This is a sample doing item', endDate: '2024-12-31', status: 'doing' },
            { id: generateId(), title: 'Sample Done', description: 'This is a sample done item', endDate: '2024-12-31', status: 'done' }
        ];
        localStorage.setItem('todos', JSON.stringify(storedData));
        localStorage.setItem('sampleAdded', 'true'); // Set flag to indicate sample data has been added
    }

    storedData.forEach(item => addTodoToDOM(item));
    checkEmptyColumns();

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
        checkEmptyColumns();
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
        checkEmptyColumns();
    }

    function addTodoToDOM(todoItem) {
        const { id, title, description, endDate, status } = todoItem;
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.id = id;
        li.setAttribute('draggable', 'true');
        li.setAttribute('ondragstart', 'drag(event)');
        li.innerHTML = `
            <h5>${title}</h5>
            <p>${description}</p>
            <div>
                <button class="btn btn-sm btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit" onclick="editItem(this)">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-warning" data-toggle="tooltip" data-placement="top" title="Doing" onclick="moveTo('doing', this)" style="${status === 'doing' || status === 'done' ? 'display:none;' : ''}">
                    <i class="fas fa-tasks"></i>
                </button>
                <button class="btn btn-sm btn-success" data-toggle="tooltip" data-placement="top" title="Done" onclick="moveTo('done', this)" style="${status === 'done' ? 'display:none;' : ''}">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-danger" data-toggle="tooltip" data-placement="top" title="Delete" onclick="deleteItem(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        document.getElementById(status).appendChild(li);
        li.todoItem = todoItem;
        $('[data-toggle="tooltip"]').tooltip();
        checkEmptyColumns();
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

    window.moveTo = function(listId, btn) {
        const item = btn.parentNode.parentNode;
        document.getElementById(listId).appendChild(item);
        item.todoItem.status = listId;
        updateItemButtons(item, listId);
        saveTodosToStorage();
        checkEmptyColumns();
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
        checkEmptyColumns();
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

    window.allowDrop = function(ev) {
        ev.preventDefault();
    }

    window.drag = function(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    }

    window.drop = function(ev, status) {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text");
        const item = document.getElementById(data);
        document.getElementById(status).appendChild(item);
        item.todoItem.status = status;
        updateItemButtons(item, status);
        saveTodosToStorage();
        checkEmptyColumns();
    }

    function updateItemButtons(item, status) {
        const doingButton = item.querySelector('.btn-warning');
        const doneButton = item.querySelector('.btn-success');
        const editButton = item.querySelector('.btn-secondary');

        if (status === 'todo') {
            doingButton.style.display = 'inline-block';
            doneButton.style.display = 'inline-block';
            editButton.style.display = 'inline-block';
        } else if (status === 'doing') {
            doingButton.style.display = 'none';
            doneButton.style.display = 'inline-block';
            editButton.style.display = 'inline-block';
        } else if (status === 'done') {
            doingButton.style.display = 'none';
            doneButton.style.display = 'none';
            editButton.style.display = 'none';
        }
    }

    function checkEmptyColumns() {
        const columns = ['todo', 'doing', 'done'];
        columns.forEach(columnId => {
            const column = document.getElementById(columnId);
            const listItems = column.querySelectorAll('.list-group-item');
            const placeholder = column.querySelector('.placeholder-text');
            if (listItems.length === 0) {
                if (!placeholder) {
                    const placeholderText = document.createElement('p');
                    placeholderText.className = 'placeholder-text';
                    placeholderText.innerText = 'No tasks';
                    column.appendChild(placeholderText);
                }
            } else {
                if (placeholder) {
                    placeholder.remove();
                }
            }
        });
    }
});

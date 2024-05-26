document.addEventListener('DOMContentLoaded', () => {
    const openAddModalButton = document.getElementById('open-add-modal-btn');
    const saveButton = document.getElementById('save-btn');
    const updateButton = document.getElementById('update-btn');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const endDateInput = document.getElementById('end-date');
    const priorityInput = document.getElementById('priority');
    const modalTitle = document.getElementById('todoModalLabel');
    let currentEditItem = null;

    // Set the minimum date for the date picker to today
    const today = new Date().toISOString().split('T')[0];
    endDateInput.setAttribute('min', today);

    // Open the add modal and prepare for adding a new item
    openAddModalButton.addEventListener('click', () => {
        clearInputs();
        saveButton.classList.remove('d-none');
        updateButton.classList.add('d-none');
        modalTitle.textContent = 'Add To-Do';
        $('#todoModal').modal('show');
    });

    saveButton.addEventListener('click', addTodo);
    updateButton.addEventListener('click', updateTodo);

    // Add event listeners to sort buttons
    document.querySelectorAll('.sort-btn').forEach(button => {
        button.addEventListener('click', () => {
            const columnId = button.dataset.column;
            const sortBy = button.dataset.sortby;
            sortColumn(columnId, sortBy);
        });
    });

    // Load initial data from local storage
    let storedData = JSON.parse(localStorage.getItem('todos')) || [];
    const sampleAddedFlag = localStorage.getItem('sampleAdded');

    // Add sample data if no data found in local storage and sample data has not been added yet
    if (storedData.length === 0 && !sampleAddedFlag) {
        storedData = [
            { id: generateId(), title: 'Sample To-Do', description: 'This is a sample to-do item', endDate: '2024-12-31', priority: 'Medium', status: 'todo' },
            { id: generateId(), title: 'Sample Doing', description: 'This is a sample doing item', endDate: '2024-12-31', priority: 'High', status: 'doing' },
            { id: generateId(), title: 'Sample Done', description: 'This is a sample done item', endDate: '2024-12-31', priority: 'Low', status: 'done' }
        ];
        localStorage.setItem('todos', JSON.stringify(storedData));
        localStorage.setItem('sampleAdded', 'true'); // Set flag to indicate sample data has been added
    }

    // Add stored items to the DOM
    storedData.forEach(item => addTodoToDOM(item));
    checkEmptyColumns();

    // Add a new to-do item
    function addTodo() {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const endDate = endDateInput.value;
        const priority = priorityInput.value;

        if (title && description && endDate && priority) {
            const todoItem = { id: generateId(), title, description, endDate, priority, status: 'todo' };
            addTodoToDOM(todoItem);
            saveTodoToStorage(todoItem);
            $('#todoModal').modal('hide');
        } else {
            alert('Please fill in all fields');
        }
        checkEmptyColumns();
    }

    // Update an existing to-do item
    function updateTodo() {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const endDate = endDateInput.value;
        const priority = priorityInput.value;

        if (title && description && endDate && priority) {
            const todoItem = { id: currentEditItem.id, title, description, endDate, priority, status: currentEditItem.status };
            currentEditItem.title = title;
            currentEditItem.description = description;
            currentEditItem.endDate = endDate;
            currentEditItem.priority = priority;
            updateTodoInDOM(currentEditItem);
            saveTodosToStorage();
            $('#todoModal').modal('hide');
        } else {
            alert('Please fill in all fields');
        }
        checkEmptyColumns();
    }

    // Add a to-do item to the DOM
    function addTodoToDOM(todoItem) {
        const { id, title, description, endDate, priority, status } = todoItem;
        const priorityColor = getPriorityColor(priority);
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.id = id;
        li.setAttribute('draggable', 'true');
        li.setAttribute('ondragstart', 'drag(event)');
        li.innerHTML = `
            <div class="priority-indicator" style="background-color: ${priorityColor};" data-toggle="tooltip" data-placement="top" title="Priority: ${priority}"></div>
            <h5>${title}</h5>
            <p>${description}</p>
            <div class="d-flex justify-content-between align-items-center">
                <div class="due-date">
                    <i class="far fa-clock"></i> <span>${endDate}</span>
                </div>
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
            </div>
        `;
        document.getElementById(status).appendChild(li);
        li.todoItem = todoItem;
        $('[data-toggle="tooltip"]').tooltip();
        checkEmptyColumns();
    }

    // Update the DOM when a to-do item is edited
    function updateTodoInDOM(todoItem) {
        const items = document.querySelectorAll('.list-group-item');
        items.forEach(item => {
            if (item.todoItem === todoItem) {
                item.querySelector('h5').textContent = todoItem.title;
                item.querySelector('p').textContent = todoItem.description;
                item.querySelector('.due-date span').textContent = todoItem.endDate;
                const priorityIndicator = item.querySelector('.priority-indicator');
                priorityIndicator.style.backgroundColor = getPriorityColor(todoItem.priority);
                priorityIndicator.setAttribute('title', `Priority: ${todoItem.priority}`);
            }
        });
    }

    // Save a new to-do item to local storage
    function saveTodoToStorage(todoItem) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.push(todoItem);
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Save all to-do items to local storage
    window.saveTodosToStorage = function() {
        const items = document.querySelectorAll('.list-group-item');
        const todos = Array.from(items).map(item => item.todoItem);
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Move a to-do item to a different column
    window.moveTo = function(listId, btn) {
        const item = btn.parentNode.parentNode.parentNode;
        document.getElementById(listId).appendChild(item);
        item.todoItem.status = listId;
        updateItemButtons(item, listId);
        saveTodosToStorage();
        checkEmptyColumns();
    }

    // Edit a to-do item
    window.editItem = function(btn) {
        const item = btn.parentNode.parentNode.parentNode;
        const todoItem = item.todoItem;
        titleInput.value = todoItem.title;
        descriptionInput.value = todoItem.description;
        endDateInput.value = todoItem.endDate;
        priorityInput.value = todoItem.priority;
        saveButton.classList.add('d-none');
        updateButton.classList.remove('d-none');
        currentEditItem = todoItem;
        modalTitle.textContent = 'Update To-Do';
        $('#todoModal').modal('show');
    }

    // Delete a to-do item
    window.deleteItem = function(btn) {
        const item = btn.parentNode.parentNode.parentNode;
        $(btn).tooltip('hide'); // Hide the tooltip
        item.parentNode.removeChild(item);
        removeItemFromStorage(item);
        checkEmptyColumns();
    }

    // Clear input fields
    function clearInputs() {
        titleInput.value = '';
        descriptionInput.value = '';
        endDateInput.value = '';
        priorityInput.value = 'Medium';
    }

    // Remove a to-do item from local storage
    function removeItemFromStorage(item) {
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

    // Generate a unique ID for each to-do item
    function generateId() {
        return '_' + Math.random().toString(36).substring(2, 11);
    }

    // Allow dropping of items into columns
    window.allowDrop = function(ev) {
        ev.preventDefault();
    }

    // Start dragging an item
    window.drag = function(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    }

    // Drop an item into a column and update its status
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

    // Update the buttons on a to-do item based on its status
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

    // Check if columns are empty and display placeholder text if they are
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

    // Sort a column by the specified criterion (priority or end date)
    function sortColumn(columnId, sortBy) {
        const column = document.getElementById(columnId);
        const items = Array.from(column.querySelectorAll('.list-group-item'));

        items.sort((a, b) => {
            const itemA = a.todoItem;
            const itemB = b.todoItem;

            if (sortBy === 'priority') {
                const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
                return priorityOrder[itemA.priority] - priorityOrder[itemB.priority];
            } else if (sortBy === 'endDate') {
                return new Date(itemA.endDate) - new Date(itemB.endDate);
            }
        });

        items.forEach(item => column.appendChild(item));
    }

    // Get the color for the priority indicator based on the priority level
    function getPriorityColor(priority) {
        switch (priority) {
            case 'High':
                return 'rgba(255, 0, 0, 0.5)'; // Pastel Red
            case 'Medium':
                return 'rgba(255, 165, 0, 0.5)'; // Pastel Orange
            case 'Low':
                return 'rgba(0, 255, 0, 0.5)'; // Pastel Green
            default:
                return '#dddddd'; // Default color
        }
    }
});

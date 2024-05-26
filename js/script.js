import { addTodoToDOM, updateTodoInDOM, checkEmptyColumns, clearInputs, openModal } from './dom.js';
import { saveTodoToStorage, saveTodosToStorage, removeItemFromStorage, getTodosFromStorage } from './storage.js';
import { generateId } from './utils.js';

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

    openAddModalButton.addEventListener('click', () => {
        clearInputs();
        saveButton.classList.remove('d-none');
        updateButton.classList.add('d-none');
        modalTitle.textContent = 'Add To-Do';
        openModal('#todoModal');
    });

    saveButton.addEventListener('click', addTodo);
    updateButton.addEventListener('click', updateTodo);

    document.querySelectorAll('.sort-btn').forEach(button => {
        button.addEventListener('click', () => {
            const columnId = button.dataset.column;
            const sortBy = button.dataset.sortby;
            sortColumn(columnId, sortBy);
        });
    });

    let storedData = getTodosFromStorage();
    const sampleAddedFlag = localStorage.getItem('sampleAdded');

    if (storedData.length === 0 && !sampleAddedFlag) {
        storedData = [
            { id: generateId(), title: 'Sample To-Do', description: 'This is a sample to-do item', endDate: '2024-12-31', priority: 'Medium', status: 'todo' },
            { id: generateId(), title: 'Sample Doing', description: 'This is a sample doing item', endDate: '2024-12-31', priority: 'High', status: 'doing' },
            { id: generateId(), title: 'Sample Done', description: 'This is a sample done item', endDate: '2024-12-31', priority: 'Low', status: 'done' }
        ];
        localStorage.setItem('todos', JSON.stringify(storedData));
        localStorage.setItem('sampleAdded', 'true');
    }

    storedData.forEach(item => addTodoToDOM(item));
    checkEmptyColumns();

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

    function updateTodo() {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const endDate = endDateInput.value;
        const priority = priorityInput.value;

        if (title && description && endDate && priority) {
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

    window.moveTo = function(listId, btn) {
        const item = btn.parentNode.parentNode.parentNode;
        document.getElementById(listId).appendChild(item);
        item.todoItem.status = listId;
        updateItemButtons(item, listId);
        saveTodosToStorage();
        checkEmptyColumns();
    }

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

    window.deleteItem = function(btn) {
        const item = btn.parentNode.parentNode.parentNode;
        $(btn).tooltip('hide');
        item.parentNode.removeChild(item);
        removeItemFromStorage(item);
        checkEmptyColumns();
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
});

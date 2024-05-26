import {getPriorityColor} from './utils.js';

export function addTodoToDOM(todoItem) {
    const {id, title, description, endDate, priority, status} = todoItem;
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

export function updateTodoInDOM(todoItem) {
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

export function checkEmptyColumns() {
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
        } else if (placeholder) {
            placeholder.remove();
        }
    });
}

export function clearInputs() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('end-date').value = '';
    document.getElementById('priority').value = 'Medium';
}

export function openModal(modalSelector) {
    $(modalSelector).modal('show');
}

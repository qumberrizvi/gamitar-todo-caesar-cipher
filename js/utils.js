export function generateId() {
    return '_' + Math.random().toString(36).substring(2, 11);
}

export function getPriorityColor(priority) {
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

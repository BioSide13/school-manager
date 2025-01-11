document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskModal = document.getElementById('task-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const taskForm = document.getElementById('task-form');
    const notStartedList = document.getElementById('not-started');
    const inProgressList = document.getElementById('in-progress');
    const taskDetails = document.getElementById('task-details');
    const editTaskBtn = document.getElementById('edit-task-btn');
    const deleteTaskBtn = document.getElementById('delete-task-btn');

    let selectedTask = null; // Track the currently selected task

    // Show the modal when clicking "Add Task"
    addTaskBtn.addEventListener('click', () => {
        selectedTask = null; // Clear the selected task for new entry
        taskForm.reset();
        taskModal.classList.remove('hidden');
    });

    // Hide the modal when clicking the close button
    closeModalBtn.addEventListener('click', () => {
        taskModal.classList.add('hidden');
    });

    // Add/Edit a task when the form is submitted
    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get form values
        const name = document.getElementById('task-name').value.trim();
        const subject = document.getElementById('task-subject').value.trim();
        const dueDate = document.getElementById('task-due-date').value;
        const priority = document.getElementById('task-priority').value;
        const subtasks = document
            .getElementById('task-subtasks')
            .value.trim()
            .split(',')
            .map(task => task.trim())
            .filter(task => task !== ''); // Filter out empty strings
        const status = document.getElementById('task-status').value;

        try {
            let response;
            if (selectedTask) {
                // Update an existing task
                response = await fetch(`http://localhost:5001/tasks/${selectedTask._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, subject, dueDate, priority, subtasks }),
                });
            } else {
                // Create a new task
                response = await fetch('http://localhost:5001/tasks/newTask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, subject, dueDate, priority, subtasks }),
                });
            }

            if (!response.ok) {
                throw new Error('Failed to save task');
            }

            const savedTask = await response.json();

            if (!selectedTask) {
                // Add the task to the DOM if it is new
                addTaskToDOM(savedTask);
            } else {
                // Update the DOM for the selected task
                updateTaskInDOM(savedTask);
            }

            taskModal.classList.add('hidden');
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Error saving task. Please try again.');
        }
    });

    // Function to add a task card to the DOM
    function addTaskToDOM(task) {
        const taskList = document.getElementById(task.status.replace('-', ' ')) || notStartedList;
        const taskCard = createTaskCard(task);
        taskList.appendChild(taskCard);
    }

    // Function to create a task card
    function createTaskCard(task) {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.priority}-priority`;
        taskCard.textContent = task.name.charAt(0).toUpperCase() + task.name.slice(1).toLowerCase();
        taskCard.dataset.id = task._id;

        taskCard.addEventListener('click', () => {
            displayTaskDetails(task);
        });

        return taskCard;
    }

    // Function to update an existing task card in the DOM
    function updateTaskInDOM(task) {
        const taskCard = document.querySelector(`.task-card[data-id='${task._id}']`);
        if (taskCard) {
            taskCard.textContent = task.name;
            taskCard.className = `task-card ${task.priority}-priority`;
        }
    }

    // Function to display task details and show buttons
    function displayTaskDetails(task) {
        selectedTask = task; // Track the selected task
        taskDetails.innerHTML = `
            <p><strong>Name:</strong> ${task.name.charAt(0).toUpperCase() + task.name.slice(1).toLowerCase()}</p>
            <p><strong>Subject:</strong> ${task.subject.charAt(0).toUpperCase() + task.subject.slice(1).toLowerCase()}</p>
            <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
            <p><strong>Priority:</strong> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}</p>
            <p><strong>Subtasks:</strong> ${task.subtasks.join(', ') || 'None'}</p>
        `;
        // Show both button when task is selected
        editTaskBtn.style.display = 'block'; 
        deleteTaskBtn.style.display = 'block';
    }

    // Handle task deselection
    document.body.addEventListener('click', (e) => {
        const taskCard = e.target.closest('.task-card');
        const isModalClick = e.target.closest('.modal-content');
        const isEditButtonClick = e.target === editTaskBtn;
        const isDeleteButtonClick = e.target === deleteTaskBtn;
        
        if (!taskCard && !isModalClick && !isEditButtonClick && !isDeleteButtonClick && !taskDetails.contains(e.target)) {
            resetTaskDetailsAndButtons();
        }
    });

    // Edit button functionality
    editTaskBtn.addEventListener('click', () => {
        if (selectedTask) {
            populateModal(selectedTask);
            taskModal.classList.remove('hidden');
        }
    });

    // Delete button functionality with duplicate prevention
    deleteTaskBtn.addEventListener('click', async (e) => {
        // Prevent event propagation
        e.stopPropagation();
        
        // Guard clause: exit if no task selected or if delete is in progress
        if (!selectedTask || !selectedTask._id) return;

        // Store task ID before deletion
        const taskId = selectedTask._id;

        if (confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await fetch(`http://localhost:5001/tasks/${taskId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Remove the task card from DOM
                const taskCard = document.querySelector(`.task-card[data-id='${taskId}']`);
                if (taskCard) {
                    taskCard.remove();
                }

                // Reset state and UI
                resetTaskDetailsAndButtons();

            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Error deleting task. Please try again.');
            }
        }
    });

    // Separate function for resetting state and UI
    function resetTaskDetailsAndButtons() {
        selectedTask = null;
        taskDetails.innerHTML = '<p>Select a task to view details.</p>';
        editTaskBtn.style.display = 'none';
        deleteTaskBtn.style.display = 'none';
    }


    // Populate the modal with task details
    function populateModal(task) {
        document.getElementById('task-name').value = task.name;
        document.getElementById('task-subject').value = task.subject;
        document.getElementById('task-due-date').value = task.dueDate.split('T')[0];
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-subtasks').value = task.subtasks.join(', ');
    }

    // Load tasks from the backend
    async function loadTasks() {
        try {
            const response = await fetch('http://localhost:5001/tasks');
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const tasks = await response.json();
            tasks.forEach(task => addTaskToDOM(task));
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    // Initial load of tasks
    loadTasks();
});

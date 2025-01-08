document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskModal = document.getElementById('task-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const taskForm = document.getElementById('task-form');
    const notStartedList = document.getElementById('not-started');
    const inProgressList = document.getElementById('in-progress');
    const taskDetails = document.getElementById('task-details');
    const editTaskBtn = document.getElementById('edit-task-btn');

    let selectedTask = null; // To track the currently selected task

    // Show the modal when clicking "Add Task"
    addTaskBtn.addEventListener('click', () => {
        selectedTask = null; // Clear selected task for a new task
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
            .map(task => task.trim());

        try {
            let response;
            if (selectedTask) {
                // Update existing task
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

            // Add or update the task in the DOM
            if (selectedTask) {
                updateTaskInDOM(savedTask);
            } else {
                addTaskToDOM(savedTask);
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
        taskCard.textContent = task.name;
        taskCard.dataset.id = task._id;

        // Add click event to display task details
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
            taskCard.title = `Subject: ${task.subject}\nDue: ${new Date(task.dueDate).toLocaleDateString()}\nPriority: ${task.priority}`;
        }
    }

    // Function to display task details
    function displayTaskDetails(task) {
        selectedTask = task; // Store the selected task
        taskDetails.innerHTML = `
            <p><strong>Name:</strong> ${task.name}</p>
            <p><strong>Subject:</strong> ${task.subject}</p>
            <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Subtasks:</strong> ${task.subtasks.join(', ') || 'None'}</p>
        `;
        editTaskBtn.classList.remove('hidden');
    }

    // Edit button functionality
    editTaskBtn.addEventListener('click', () => {
        if (selectedTask) {
            populateModal(selectedTask);
            taskModal.classList.remove('hidden');
        }
    });

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

    // Initial loading of tasks
    loadTasks();
});

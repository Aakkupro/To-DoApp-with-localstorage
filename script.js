document.addEventListener('DOMContentLoaded', function () {
    let input = document.getElementById('taskInput');
    let addButton = document.getElementById('addButton');
    let all = document.getElementById('allTasks');
    let completed = document.getElementById('completedTask');
    let uncompleted = document.getElementById('uncompletedTask');
    let lists = document.getElementById('tasks');
    let progressBar = document.getElementById('progressBar');
    let tasksArray = JSON.parse(localStorage.getItem('tasks')) || [];

    // Load tasks from local storage
    loadTasks();

    // Add task function
    function addTask(taskText, completed = false, addToArray = true) {
        let listItem = document.createElement('li');
        listItem.classList.add('task-item');
        if (completed) listItem.classList.add('completed');
        listItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}>
            <span class="task">${taskText}</span>
            <button class="edit-task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                </svg>
            </button>
            <button class="delete-task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                </svg>
            </button>
        `;
        lists.appendChild(listItem);

        // Only add to tasksArray if not loaded from localStorage
        if (addToArray) {
            tasksArray.push({ text: taskText, completed });
            saveTasks();
        }

        updateProgressBar();
    }

    // Add task button click or "Enter" key press
    addButton.addEventListener('click', function () {
        let task = input.value.trim();
        if (task) {
            addTask(task);
            input.value = '';
        } else {
            alert('Please enter a task');
        }
    });

    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addButton.click();
        }
    });

    // Delete task
    lists.addEventListener('click', function (e) {
        let deleteButton = e.target.closest('.delete-task');
        if (deleteButton) {
            let taskItem = deleteButton.parentElement;
            tasksArray = tasksArray.filter(item => item.text !== taskItem.querySelector('.task').innerText);
            taskItem.remove();
            saveTasks();
            updateProgressBar();
        }
    });

    // Edit task
    lists.addEventListener('click', function (e) {
        let editButton = e.target.closest('.edit-task');
        if (editButton) {
            let taskItem = editButton.parentElement;
            let taskTextElement = taskItem.querySelector('.task');
            let originalText = taskTextElement.innerText;

            // Task text ko contentEditable kar do
            taskTextElement.contentEditable = true;
            taskTextElement.focus();

            // Handle enter key and blur events
            taskTextElement.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    taskTextElement.contentEditable = false;

                    let newText = taskTextElement.innerText.trim();
                    if (newText && newText !== originalText) {
                        tasksArray.forEach(item => {
                            if (item.text === originalText) {
                                item.text = newText;
                            }
                        });
                        saveTasks();
                    }
                    event.preventDefault();
                }
            });

            taskTextElement.addEventListener('blur', function () {
                taskTextElement.contentEditable = false;

                let newText = taskTextElement.innerText.trim();
                if (newText && newText !== originalText) {
                    tasksArray.forEach(item => {
                        if (item.text === originalText) {
                            item.text = newText;
                        }
                    });
                    saveTasks();
                }
            });
        }
    });

    // Task completion checkbox toggle
    lists.addEventListener('change', function (e) {
        if (e.target.classList.contains('task-checkbox')) {
            let taskItem = e.target.parentElement;
            taskItem.classList.toggle('completed');
            tasksArray.forEach(item => {
                if (item.text === taskItem.querySelector('.task').innerText) {
                    item.completed = e.target.checked;
                }
            });
            saveTasks();
            updateProgressBar();
        }
    });

    // Filter tasks
    all.addEventListener('click', function () {
        document.querySelectorAll('.task-item').forEach(item => {
            item.style.display = 'flex';
        });
    });

    completed.addEventListener('click', function () {
        document.querySelectorAll('.task-item').forEach(item => {
            if (item.querySelector('.task-checkbox').checked) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    uncompleted.addEventListener('click', function () {
        document.querySelectorAll('.task-item').forEach(item => {
            if (!item.querySelector('.task-checkbox').checked) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Progress bar update
    function updateProgressBar() {
        let totalTasks = tasksArray.length;
        let completedTasks = tasksArray.filter(task => task.completed).length;
        let progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

        progressBar.style.width = `${progressPercentage}%`;
        progressBar.innerHTML = `${Math.round(progressPercentage)}%`;

        if (completedTasks === totalTasks && totalTasks > 0) {
            confetti();
            let sound = document.getElementById('yup-sound');
            if (sound) {
                sound.play();
            }
        }
    }

    // Save tasks to local storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasksArray));
    }

    // Load tasks from local storage
    function loadTasks() {
        tasksArray.forEach(task => addTask(task.text, task.completed, false)); // Avoid adding to tasksArray again
        updateProgressBar();
    }

    // Clear All Tasks button
    document.getElementById('clearAllButton').addEventListener('click', function () {
        let confirmation = confirm('Are you sure you want to delete all tasks? This action cannot be undone.');
        if (confirmation) {
            tasksArray = [];
            localStorage.removeItem('tasks');
            lists.innerHTML = '';
            updateProgressBar();
        }
    });
});

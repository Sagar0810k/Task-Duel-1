document.addEventListener('DOMContentLoaded', function() {
    // Login and Registration
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            // Send login data to the backend
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/';  // Redirect to the dashboard
                } else {
                    alert('Login failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            // Send registration data to the backend
            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Registration successful! Please log in.');
                    window.location.href = '/login';  // Redirect to the login page
                } else {
                    alert('Registration failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    // Task Submission
    const submitTaskForm = document.getElementById('submitTaskForm');

    if (submitTaskForm) {
        submitTaskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const taskName = document.getElementById('taskName').value;
            const taskDescription = document.getElementById('taskDescription').value;

            // Send task data to the backend
            fetch('/submit-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    taskName: taskName,
                    taskDescription: taskDescription
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Task submitted successfully!');
                    window.location.href = '/';  // Redirect to the dashboard
                } else {
                    alert('Error submitting task: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    // Dashboard
    const welcomeMessage = document.getElementById('welcomeMessage');
    const taskList = document.getElementById('taskList');
    const aiTask = document.getElementById('aiTask');
    const streakCount = document.getElementById('streakCount');
    const tasksCompleted = document.getElementById('tasksCompleted');
    const friendTasksCompleted = document.getElementById('friendTasksCompleted');
    const friendSearch = document.getElementById('friendSearch');
    const friendList = document.getElementById('friendList');

    if (welcomeMessage) {
        // Set welcome message
        welcomeMessage.textContent = 'Welcome, User!';
    }

    if (taskList) {
        // Fetch tasks from the backend
        fetch('/tasks', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                taskList.innerHTML = ''; // Clear the list before populating
                data.tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.innerHTML = `
                        ${task.content}
                        <button class="btn btn-sm ${task.is_completed ? 'btn-success' : 'btn-outline-success'}" 
                                onclick="toggleTask(${task.id})">
                            ${task.is_completed ? 'Completed' : 'Mark as Done'}
                        </button>
                    `;
                    taskList.appendChild(li);
                });
            } else {
                alert('Error fetching tasks: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    if (aiTask) {
        // Fetch the AI-generated task from the backend
        fetch('/generate-ai-task', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                aiTask.textContent = data.task.content;
    
                // Add a "Mark as Done" button for the AI-generated task
                const completeAiTaskButton = document.getElementById('completeAiTask');
                if (completeAiTaskButton) {
                    completeAiTaskButton.addEventListener('click', function() {
                        toggleTask(data.task.id); // Use the task ID from the backend
                    });
                }
            } else {
                alert('Error fetching AI task: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }   

    if (streakCount) {
        // Set streak count
        streakCount.textContent = '5';
    }

    if (tasksCompleted) {
        // Set tasks completed
        tasksCompleted.textContent = '15';
    }

    if (friendTasksCompleted) {
        // Set friend's tasks completed
        friendTasksCompleted.textContent = '12';
    }

    if (friendSearch) {
        // Implement friend search
        friendSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
    
            if (searchTerm.length < 2) {
                friendList.innerHTML = ''; // Clear the list if the search term is too short
                return;
            }
    
            // Fetch friends from the backend
            fetch(`/search-friends?q=${searchTerm}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    friendList.innerHTML = ''; // Clear the list before populating
                    data.friends.forEach(friend => {
                        const li = document.createElement('li');
                        li.className = 'list-group-item';
                        li.innerHTML = `
                            ${friend.username} <!-- Use friend.username -->
                            <button class="btn btn-sm btn-outline-primary" onclick="addFriend('${friend.username}')">Add</button>
                        `;
                        friendList.appendChild(li);
                    });
                } else {
                    alert('Error searching for friends: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
});

// Helper functions
function toggleTask(taskId) {
    // Send a request to the backend to mark the task as complete
    fetch(`/complete-task/${taskId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the task button to "Completed"
            const taskButton = document.querySelector(`button[onclick="toggleTask(${taskId})"]`);
            if (taskButton) {
                taskButton.textContent = 'Completed';
                taskButton.classList.remove('btn-outline-success');
                taskButton.classList.add('btn-success');
            }

            // Update the streak count in the UI
            const streakCountElement = document.getElementById('streakCount');
            if (streakCountElement) {
                streakCountElement.textContent = data.streak_count;
            }

            // Update the tasks completed count
            const tasksCompletedElement = document.getElementById('tasksCompleted');
            if (tasksCompletedElement) {
                const currentCount = parseInt(tasksCompletedElement.textContent, 10);
                tasksCompletedElement.textContent = currentCount + 1;
            }

            alert(data.message); // Notify the user
        } else {
            alert('Error: ' + data.message); // Notify the user of the error
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function addFriend(friendUsername) {
    // Send a request to the backend to add a friend
    fetch('/add-friend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            friend_username: friendUsername, // Send the friend's username
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Friend added successfully!');
        } else {
            alert('Error adding friend: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        // Implement logout logic here
        fetch('/logout', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/login';  // Redirect to the login page
            } else {
                alert('Logout failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}
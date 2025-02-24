from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User, Task, Friend
from ai_task import generate_ai_task
from datetime import datetime

# Flask-Login setup
login_manager = LoginManager()

def init_routes(app):
    login_manager.init_app(app)
    login_manager.login_view = 'login'

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # User Authentication Routes
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if request.method == 'POST':
            data = request.get_json()  # Get JSON data from the request
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            email = data.get('email')

            if not username or not password:
                return jsonify({'success': False, 'message': 'Username and password are required!'})

            # Check if the username already exists
            if User.query.filter_by(username=username).first():
                return jsonify({'success': False, 'message': 'Username already exists!'})

            # Create a new user
            new_user = User(username=username, email=email)
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()

            return jsonify({'success': True, 'message': 'Registration successful! Please log in.'})

        return render_template('register.html')

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            data = request.get_json()  # Get JSON data from the request
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return jsonify({'success': False, 'message': 'Username and password are required!'})

            user = User.query.filter_by(username=username).first()
            if user and user.check_password(password):
                login_user(user)
                return jsonify({'success': True, 'message': 'Login successful!'})
            else:
                return jsonify({'success': False, 'message': 'Invalid username or password'})

        return render_template('login.html')

    @app.route('/logout', methods=['POST'])
    @login_required
    def logout():
        logout_user()
        return jsonify({'success': True, 'message': 'Logout successful!'})

    # Task Management Routes
    @app.route('/')
    @login_required
    def index():
        tasks = Task.query.filter_by(created_by=current_user.id).all()
        return render_template('index.html', tasks=tasks)

    @app.route('/submit-task', methods=['GET', 'POST'])
    @login_required
    def submit_task():
        if request.method == 'POST':
            data = request.get_json()  # Get JSON data from the request
            task_name = data.get('taskName')
            task_description = data.get('taskDescription')

            if not task_name:
                return jsonify({'success': False, 'message': 'Task name is required!'})

            # Create a new task
            new_task = Task(
                content=task_name,
                description=task_description,
                created_by=current_user.id,
                is_ai_generated=False,
                created_date=datetime.utcnow()
            )
            db.session.add(new_task)
            db.session.commit()

            return jsonify({'success': True, 'message': 'Task submitted successfully!'})

        return render_template('submit-task.html')

    @app.route('/complete-task/<int:task_id>', methods=['POST'])
    @login_required
    def complete_task(task_id):
        task = Task.query.get(task_id)
        if task and task.created_by == current_user.id:
            task.is_completed = True
            current_user.streak_count += 1
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Task marked as complete!',
                'streak_count': current_user.streak_count
            })
        else:
            return jsonify({'success': False, 'message': 'Task not found or unauthorized!'})

    # AI Task Generation Route
    @app.route('/generate-ai-task', methods=['POST'])
    @login_required
    def generate_daily_task():
        ai_task_content = generate_ai_task()
        task = Task(
            content=ai_task_content,
            created_by=current_user.id,
            is_ai_generated=True,
            created_date=datetime.utcnow()
        )
        db.session.add(task)
        db.session.commit()
        return jsonify({'success': True, 'message': 'AI-generated task added!'})

    # Friend Management Routes (Future Expansion)
    @app.route('/add-friend', methods=['POST'])
    @login_required
    def add_friend():
        data = request.get_json()
        friend_username = data.get('friend_username')

        if not friend_username:
            return jsonify({'success': False, 'message': 'Friend username is required!'})

        # Check if the friend exists
        friend = User.query.filter_by(username=friend_username).first()
        if not friend:
            return jsonify({'success': False, 'message': 'Friend not found!'})

        # Check if the friend is already added
        existing_friend = Friend.query.filter_by(user_id=current_user.id, friend_username=friend_username).first()
        if existing_friend:
            return jsonify({'success': False, 'message': 'Friend already added!'})

        # Add friend relationship
        new_friend = Friend(user_id=current_user.id, friend_username=friend_username)
        db.session.add(new_friend)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Friend added successfully!'})

    @app.route('/search-friends', methods=['GET'])
    @login_required
    def search_friends():
        search_term = request.args.get('q', '').strip().lower()

        if not search_term:
            return jsonify({'success': False, 'message': 'Search term is required!'})

        # Fetch users whose usernames match the search term (excluding the current user)
        users = User.query.filter(
            User.username.ilike(f'%{search_term}%'),
            User.id != current_user.id
        ).all()

        # Format the response
        friends = [{'id': user.id, 'username': user.username} for user in users]
        return jsonify({'success': True, 'friends': friends})
    
    @app.route('/tasks', methods=['GET'])
    @login_required
    def get_tasks():
        tasks = Task.query.filter_by(created_by=current_user.id).all()
        tasks_data = [{
            'id': task.id,
            'content': task.content,
            'is_completed': task.is_completed
        } for task in tasks]
        return jsonify({'success': True, 'tasks': tasks_data})
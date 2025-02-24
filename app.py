from flask import Flask
from models import db
from routes import init_routes

# Initialize Flask app
app = Flask(__name__)
app.config.from_object('config.Config')

# Initialize database
db.init_app(app)

# Initialize routes
init_routes(app)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create database tables
    app.run(debug=True)
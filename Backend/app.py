from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from config import Config 
from extensions import db, migrate,jwt,cache
import models
from route.auth_controller import auth_bp
from route.doctor_controller import doctor_bp
from route.appointment_controller import appointment_bp
from route.admin_controller import admin_bp

app = Flask(__name__)


CORS(
    app,
    origins=["http://localhost:5173"],
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)

app.config.from_object(Config)

db.init_app(app)

migrate.init_app(app, db)
cache.init_app(app)
app.register_blueprint(auth_bp)
app.register_blueprint(doctor_bp)
app.register_blueprint(appointment_bp)
app.register_blueprint(admin_bp)
jwt.init_app(app)
swagger = Swagger(app)


from sqlalchemy import text

with app.app_context():
    try:
        db.session.execute(text("SELECT 1"))
        print("Database connected successfully!")

    except Exception as e:
        print("Database connection failed!")
        print(e)




@app.route('/')
def home():
    return {"message": "Hello, World!"}

if __name__ == '__main__':
    app.run(debug=True)
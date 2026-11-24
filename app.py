from flask import Flask
from flasgger import Swagger
from config import Config 
from extensions import db, migrate,jwt
import models
from route.auth_controller import auth_bp
from route.doctor_controller import doctor_bp

app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)

migrate.init_app(app, db)
app.register_blueprint(auth_bp)
app.register_blueprint(doctor_bp)
jwt.init_app(app)
swagger = Swagger(app)


# from sqlalchemy import text

# with app.app_context():
#     try:
#         db.session.execute(text("SELECT 1"))
#         print("Database connected successfully!")

#     except Exception as e:
#         print("Database connection failed!")
#         print(e)




@app.route('/')
def home():
    return {"message": "Hello, World!"}

if __name__ == '__main__':
    app.run(debug=True)
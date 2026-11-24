import os
from dotenv import load_dotenv
from sqlalchemy import URL
from datetime import timedelta

load_dotenv()


class Config:

    SECRET_KEY = os.environ["SECRET_KEY"]

    SQLALCHEMY_DATABASE_URI = URL.create(
        drivername="postgresql",
        username=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        host=os.environ["DB_HOST"],
        port=int(os.environ["DB_PORT"]),
        database=os.environ["DB_NAME"]
    )

    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "sslmode": os.environ["DB_SSLMODE"],
            "sslrootcert": os.environ["DB_SSLROOTCERT"],
            "sslcert": os.environ["DB_SSLCERT"],
            "sslkey": os.environ["DB_SSLKEY"],
            "options": f"-csearch_path={os.environ.get('DB_SCHEMA', 'public')}"
        }
    }

    SQLALCHEMY_TRACK_MODIFICATIONS = False


    JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]
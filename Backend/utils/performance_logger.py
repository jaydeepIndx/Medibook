import time
from flask import request, g
from utils.logger import logger


def register_performance_logger(app):

    @app.before_request
    def start_timer():
        g.start_time = time.perf_counter()

    @app.after_request
    def log_request_time(response):

        if hasattr(g, "start_time"):

            total_time = (
                time.perf_counter() - g.start_time
            ) * 1000

            logger.info(
                "API: %s %s | Status: %s | Total Time: %.2f ms",
                request.method,
                request.path,
                response.status_code,
                total_time
            )

        return response
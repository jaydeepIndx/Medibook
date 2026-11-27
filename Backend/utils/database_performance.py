
import time
from utils.logger import logger


def measure_db_time(func):

    def wrapper(*args, **kwargs):

        start_time = time.perf_counter()

        result = func(*args, **kwargs)

        query_time = (
            time.perf_counter() - start_time
        ) * 1000

        logger.info(
            "DB Query Time: %.2f ms",
            query_time
        )

        return result

    return wrapper

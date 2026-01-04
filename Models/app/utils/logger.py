# app/utils/logger.py

import logging
import os

def setup_logger():
    level = os.getenv("LOG_LEVEL", "INFO").upper()

    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )

    logging.getLogger("werkzeug").setLevel(logging.WARNING)

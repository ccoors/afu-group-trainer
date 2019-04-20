#!/usr/bin/env python3
import asyncio
import logging
import sys
from logging.config import fileConfig

import sqlalchemy

from server.agt_server import AGTServer


def main():
    instance = None
    fileConfig('logging.conf')
    logger = logging.getLogger(__name__)
    try:
        logger.info('Starting AGT backend server...')
        instance = AGTServer('sqlite:///database.sqlite', port=8080)

        task = instance.run()
        asyncio.get_event_loop().run_until_complete(task)
        asyncio.get_event_loop().run_forever()
    except PermissionError as e:
        logger.error(e)
    except (asyncio.CancelledError, KeyboardInterrupt):
        logger.info('Exit requested...')
    finally:
        if instance:
            instance.shutdown()

    logger.info('Exiting')
    sys.exit(0)


if __name__ == '__main__':
    main()

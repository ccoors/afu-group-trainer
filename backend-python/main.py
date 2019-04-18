#!/usr/bin/env python3
import asyncio
import sys
import logging
from logging.config import fileConfig

from server.agt_server import AGTServer


def main():
    fileConfig('logging.conf')
    logger = logging.getLogger(__name__)
    try:
        logger.info('Starting AGT backend server...')
        instance = AGTServer(['../backend/assets/TechnikE.json', '../backend/assets/BetriebstechnikVorschriften.json'], port=8080)

        task = instance.run()
        asyncio.get_event_loop().run_until_complete(task)
        asyncio.get_event_loop().run_forever()
    except PermissionError as e:
        logger.error(e)
    except (asyncio.CancelledError, KeyboardInterrupt):
        logger.info('Exit requested...')
        pass

    logger.info('Exiting')
    sys.exit(0)


if __name__ == '__main__':
    main()

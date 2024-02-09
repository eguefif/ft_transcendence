from server import serverPong
import asyncio

server = serverPong()
asyncio.run(server.run())

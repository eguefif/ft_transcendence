from server import serverPong
import asyncio

if __name__ == "__main__":
    server = serverPong()
    asyncio.run(server.run())

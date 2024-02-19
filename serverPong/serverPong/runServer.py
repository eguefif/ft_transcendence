from Server import serverPong
import asyncio
import sys

if __name__ == "__main__":
    if len(sys.argv) == 2:
        server = serverPong(sys.argv[1], int(sys.argv[2]))
    else:
        server = serverPong()
    asyncio.run(server.run())

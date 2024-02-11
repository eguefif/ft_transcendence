import asyncio
import websockets
import logging
import time

class serverPong:
    def __init__(self):
        gamesList = []

    async def handler(self, websocket):
        message = await websocket.recv()
        if (message == "game"):
            await websocket.send("player1")
        time.sleep(3)
        await websocket.send("getready")


    async def run(self):
        async with websockets.serve(self.handler, "", 10000):
            await asyncio.Future()


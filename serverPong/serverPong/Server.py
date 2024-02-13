import asyncio
import logging
import websockets
from websockets.server import serve
import json
import signal


from Game import Game


class serverPong:
    def __init__(self):
        self.currentGame = None
        self.games = []
        self.isWaitingGame = False
        self.tasks = list()
        self.currentId = 0

    async def run(self, address="localhost", port=10000):
        loop = asyncio.get_running_loop()
        stop = loop.create_future()
        loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)
        loop.add_signal_handler(signal.SIGQUIT, stop.set_result, None)
        loop.add_signal_handler(signal.SIGINT, stop.set_result, None)
        async with serve(self.handler, address, port):
            await stop

    async def handler(self, websocket):
        print("New player: ", websocket)
        msg = await websocket.recv()
        if not self.isWaitingGame:
            print("New game: ", self.currentId)
            self.games.append(Game("player1"))
            cmd = json.dumps({"command": "wait"})
            try:
                await websocket.send(cmd)
            except websockets.ConnectionClosedOK:
                print("disconnection")
            self.isWaitingGame = True
            await self.runPlayer(self.currentId, websocket, "player1")
        else:
            self.games[self.currentId].state = "getready"
            self.currentId += 1
            self.isWaitingGame = False
            await self.runPlayer(self.currentId - 1, websocket, "player2")

    async def runPlayer(self, gameId, websocket, player):
        print(player, " joining ", gameId)
        """
        try:
            _ = self.games[gameId]
        except exceptIndexError:
                websocket.close()
                await websocket.wait_closed()
        """"
        while self.games[gameId].state != "getready":
            try:
                await websocket.pong()
            except websockets.ConnectionClosedOK:
                websocket.close()
                await websocket.wait_closed()
                self.games.pop(gameId)
                return
            await asyncio.sleep(0.1)
        try:
            await websocket.send(json.dumps({"command": "getready"}))
        except websockets.ConnectionClosedOK:
            print("lost connection :", websocket)
        consumer_task = asyncio.create_task(
            self.consumer_handler(websocket, gameId, player)
        )
        producer_task = asyncio.create_task(
            self.producer_handler(websocket, gameId)
        )
        await asyncio.gather(consumer_task, producer_task)

    async def consumer_handler(self, websocket, gameid, player):
        async for message in websocket:
            self.games[gameid].update(message, player)

    async def producer_handler(self, websocket, gameid):
        while self.games[gameid].state != "ending":
            await asyncio.sleep(1/30)
            message = self.games[gameid].run()
            if len(message):
                await websocket.send(message)
        await websocket.send(json.dumps({"command": "ending"}))

    def createTasks(self, websocket1, websocket2, game):
        consumer_task1 = asyncio.create_task(
            self.consumer_handler(websocket1, game, "player1")
        )
        consumer_task2 = asyncio.create_task(
            self.consumer_handler(websocket2, game, "player2")
        )
        producer_task1 = asyncio.create_task(
            self.producer_handler(websocket1, game)
        )
        producer_task2 = asyncio.create_task(
            self.producer_handler(websocket2, game)
        )
        return [consumer_task1, consumer_task2, producer_task1, producer_task2]

    async def runPlayer2(self, gameid, websocket):
        datum = self.getDataFromGameId(gameid)
        await self.sendGetReady(datum["player1"], datum["player2"])
        tasks = self.createTasks(datum["player1"], datum["player2"], datum["game"])
        self.tasks.append({"id": gameid, "tasks": tasks})
        await asyncio.gather(*tasks)

    async def sendGetReady(self, websocket1, websocket2):
        cmd = json.dumps({"command": "getready"})
        try:
            await websocket1.send(cmd)
        except websockets.ConnectionClosedOK:
            print("Getready 1 Connection closed: ", websocket1)
        try:
            await websocket2.send(cmd)
        except websockets.ConnectionClosedOK:
            print("Getready 2 Connection closed: ", websocket2)

    def getGame(self, gameid):
        for i, game in enumerate(self.games):
            if i == gameid:
                return game

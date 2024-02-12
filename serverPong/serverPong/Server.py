import asyncio
import logging
import websockets
from websockets.server import serve
import json
import signal


from Game import Game


class serverPong:
    def __init__(self):
        self.data = list()
        self.tasks = list()
        self.currentId = 1

    async def run(self, address="localhost", port=10001):
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
        if msg == "game":
            gameid = self.tryToAddPlayerInWaitingGame(websocket)
            if gameid == -1:
                print("New game: ", self.currentId)
                game = Game("player1")
                datum = {"id": self.currentId, "game": game, "player1": websocket}
                self.currentId += 1
                self.data.append(datum)
                cmd = json.dumps({"command": "wait"})
                try:
                    await websocket.send(cmd)
                except websockets.ConnectionClosedOK:
                    print("disconnection")
                await self.runPlayer1(game, websocket)
            else:
                await self.runPlayer2(gameid, websocket)

    async def runPlayer(self, game, websocket):
        while game.state != "ready":
            await asyncio.sleep(1)
        consumer_task = asyncio.create_task(
            self.consumer_handler(websocket, game, "player1")
        )
        producer_task = asyncio.create_task(
            self.producer_handler(websocket, game)
        )
        try:
            websocket.send({"command": "getready"})
        except websockets.ConnectionClosedOK:
            print("lost connection :", websocket)
        await asyncio.gather(consumer_task, produce_task)

    def tryToAddPlayerInWaitingGame(self, websocket):
        if len(self.data):
            for datum in self.data:
                if datum["game"].state == "waiting":
                    print("Game launched: ", self.currentId)
                    datum["game"].addPlayer("player2")
                    datum["player2"] = websocket
                    return datum["id"]
        return -1

    async def consumer_handler(self, websocket, game, player):
        while game.state != "ending":
            async for message in websocket:
                message = await websocket.recv()
                game.update(message, player)
        #except websockets.ConnecionClosedOK:
        #    print("Consumer connection closed: ", websocket)

    async def producer_handler(self, websocket, game):
        while game.state != "ending":
            message = game.run()
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

    def getDataFromGameId(self, gameid):
        for datum in self.data:
            if datum["id"] == gameid:
                return datum

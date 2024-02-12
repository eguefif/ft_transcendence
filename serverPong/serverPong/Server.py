import asyncio
import websockets
from websockets.server import serve


from Game import Game

class serverPong:
    def __init__(self):
        self.data = list()
        self.tasks = set()
        self.currentId = 1

    async def run(self, address="localhost", port=10000):
        async with serve(self.handler, address, port):
            await asyncio.Future()

    async def handler(self, websocket):
        msg = await websocket.recv()
        print(msg)
        if msg == "game":
            gameid = self.tryToAddPlayerInWaitingGame(websocket)
            if gameid == -1:
                game = Game("player1")
                datum = {"id": self.currentId, "game": game, "player1": websocket}
                self.data.append(datum)
            else :
                await self.runGame(gameid)

    def tryToAddPlayerInWaitingGame(self, websocket):
        if len(self.data):
            for datum in self.data:
                if datum["game"].state == "waiting":
                    datum["game"].addPlayer("player2")
                    datum["player2"] = websocket
                    return datum["id"]
        return -1

    async def runGame(self, gameid):
        _, game, websocket1, websocket2 = self.getDataFromGameId(gameid)
        cmd = json.dumps("command": getready)
        await websocket1.send(cmd)
        await websocket1.send(cmd)
        consumer_task1 = asyncio.create_task(consumer_handler(websocket1, game, "player1"))
        consumer_task2 = asyncio.create_task(consumer_handler(websocket2, game, "player2"))
        producer_task1 = asyncio.create_task(producer_handler(websocket1, game))
        producer_Task2 = asyncio.create_task(producer_handler(websocket2, game))
        tasks = [consummer_task1, consumer_task2, producer_task1, producer_task2]
        self.tasks.add({"id": gameid, "tasks": tasks})
        await asyncio.gather(*tasks)
        
    async def consumer_handler(self, websocket, game, player):
        async for message in websocket:
            game.update(message, player)

    async def producer_handler(self, websocket, game):
        while game.state != "end":
            message = await game.run()
            await websocket.send(message)
        await websocket.send(json.dumps({"command": "end"))

    def getDataFromGameId(self, gameid):
        for datum in self.data:
            if datum["id"] == gameid:
                return datum.values()

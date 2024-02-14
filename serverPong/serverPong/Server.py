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
        self.is_waiting_game = False
        self.tasks = list()
        self.current_id = 0

    async def run(self, address="0.0.0.0", port=10000):
        stop = self.init_signal()
        print(f"Starting serverPong on {address}:{port}")
        async with serve(self.handler, address, port):
            await stop

    def init_signal(self):
        loop = asyncio.get_running_loop()
        stop = loop.create_future()
        loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)
        loop.add_signal_handler(signal.SIGQUIT, stop.set_result, None)
        loop.add_signal_handler(signal.SIGINT, stop.set_result, None)
        return stop

    async def handler(self, websocket):
        print("New player: ", websocket)
        if self.is_game(websocket):
            if self.is_user_in_game(msg["username"]):
                self.end_game(msg["username"])
                return
            if not self.is_waiting_game:
                await self.create_game(websocket, msg["username"])
            else:
                await self.join_game(websocket, msg["username"])

    async def is_game(self, socket):
        msg = await websocket.recv()
        msg = json.loads(msg)
        if msg["command"] != "game":
            return False
        return True

    def is_user_in_game(self, username):
        for game in self.games:
            if game.isPlayerInGame(username):
                return True
        return False

    def end_game(self, username):
            gameid = self.get_game_by_username(username)
            self.games[gameid].state = "ending"

    def get_game_by_username(self, username):
        for i, game in enumerate(self.games):
            if game.isPlayerInGame(username):
                return i
        return -1

    async def create_game(self, websocket, username):
            print("New game: ", self.current_id)
            self.games.append(Game(username, self.current_id, websocket))
            cmd = json.dumps({"command": "wait"})
            try:
                await websocket.send(cmd)
            except websockets.ConnectionClosedOK:
                print("disconnection")
            self.is_waiting_game = True
            await self.run_game(self.current_id, websocket, username)

    async def join_game(self, websocket, username):
            self.games[self.current_id].addPlayer(msg["username"], websocket)
            self.current_id += 1
            self.is_waiting_game = False
            await self.run_game(self.current_id - 1, websocket, msg["username"])

    async def run_game(self, gameid, websocket, player):
        print(player, " joining ", gameid)
        await self.wait_for_player(gameid, websocket)
        await self.send_message(gameid, websocket, "getready")
        if self.games[gameid].state != "ending":
            tasks = self.create_tasks(websocket, gameid, player)
            await asyncio.gather(*tasks)

    def create_tasks(self, websocket, gameid, player):
        consumer_task = asyncio.create_task(
            self.consumer_handler(websocket, gameid, player)
        )
        producer_task = asyncio.create_task(
            self.producer_handler(websocket, gameid)
        )
        return [consumer_task, producer_task]

    async def wait_for_player(self, gameid, websocket):
        while self.games[gameid].state != "getready":
            self.send_message(websocket, gameid, "getready")
            await asyncio.sleep(0.1)

    async def consumer_handler(self, websocket, gameid, player):
        async for message in websocket:
            self.games[gameid].update(message, player)

    async def producer_handler(self, websocket, gameid):
        while self.games[gameid].state != "ending":
            message = self.games[gameid].run()
            if len(message):
                await self.send_msg(websocket, gameid, message)
        self.remove_game(gameid)
        ending_msg = self.games[gameid].get_ending_message()
        await websocket.send(ending_msg)
        websocket.close()
        await websocket.wait_closed()

    def remove_game(self, gameid):
        for game in self.games:
            if game.id == gameid:
                self.games.remove(game)

    async def send_msg(self, websocket, gameid, msg):
        try:
            await websocket.send(msg)
        except websockets.ConnectionClosedOK:
            print("disconnection of :", websocket)
            self.games[gameid].state = "ending"
            self.games[gameid].set_looser(websocket)

import asyncio
import logging
import websockets
from websockets.server import serve
import json
import signal
from authentification import authenticate

from Game import Game


class serverPong:
    def __init__(self):
        self.currentGame = None
        self.games = {}
        self.is_waiting_game = False
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
        try:
            msg = await websocket.recv()
            print("new connection", json.loads(msg))
        except websockets.ConnectionClosedOK:
            print("Disconnection on the token exchange message")
            return
        username = authenticate(json.loads(msg))
        if username is None:
            await self.send_token_invalid_and_close(websocket)
            return
        print(username, "has join the server and his token is valid")
        try:
            msg = await websocket.recv()
            msg = json.loads(msg)
        except websockets.ConnectionClosedOK:
            print("Disconnection on the game message")
            return
        if msg["command"] == "game":
            if self.is_user_in_game(username):
                self.end_game(username)
                await websocket.close()
                await websocket.wait_closed()
                return
            if not self.is_waiting_game:
                await self.create_game(websocket, username, self.current_id)
            else:
                await self.join_game(websocket, username)

    async def send_token_invalid_and_close(self, websocket):
        msg = json.dumps({"command": "tokenInvalid"})
        await websocket.send(msg)
        await websocket.close()
        await websocket.wait_closed()

    def is_user_in_game(self, username):
        for game in self.games.values():
            if game.isPlayerInGame(username):
                return True
        return False

    def end_game(self, username):
            gameid = self.get_game_by_username(username)
            self.games[gameid].set_looser_by_username(username)

    def get_game_by_username(self, username):
        for game in self.games.values():
            if game.isPlayerInGame(username):
                return game.id
        return -1

    async def create_game(self, websocket, username, gameid):
        print(username, "create game:", gameid)
        self.games[self.current_id] = Game(username, self.current_id, websocket)
        msg = {"command": "wait"}
        if await self.send_msg(websocket, gameid, msg):
            self.is_waiting_game = True
            await self.run_game(self.current_id, websocket, username)

    async def join_game(self, websocket, username):
        print(username, "join game", self.current_id)
        try:
            await self.games[self.current_id].add_player(username, websocket)
        except KeyError:
            await websocket.close()
            await websocket.wait_closed()
            return 
        self.current_id += 1
        self.is_waiting_game = False
        await self.run_game(self.current_id - 1, websocket, username)

    async def run_game(self, gameid, websocket, player):
        if not await self.wait_for_player(gameid, websocket, player):
            await self.close_websocket(websocket, gameid, player)
            return
        if not await self.wait_for_ready(gameid, websocket, player):
            await self.close_websocket(websocket, gameid, player)
            return

        print("out of the loop")
        if self.games[gameid].state != "ending":
            print(player, "join game", gameid)
            tasks = self.create_tasks(websocket, gameid, player)
            await asyncio.gather(*tasks)
        else:
            await self.close_websocket(websocket, gameid, player)

    async def wait_for_ready(self, gameid, websocket, player):
        msg = json.dumps({"command": "getready"})
        await self.send_msg(websocket, gameid, msg)
        try:
            _ = self.games[gameid]
        except KeyError:
            print("error in wait for ready")
            return False
        while self.games[gameid].state == "getready":
            msg = {"command": "getready"}
            if not await self.send_msg(websocket, gameid, msg):
                return False
            try:
                retval = await websocket.recv()
            except websockets.ConnectionClosedOK:
                return False
            if retval == "ready":
                try:
                    self.games[gameid].update(retval, player)
                except KeyError:
                    print("error in wait for ready")
                    return False
                return True
            await asyncio.sleep(0)
        return True

    async def wait_for_player(self, gameid, websocket, player):
        try:
            _ = self.games[gameid]
        except KeyError:
            print("error in wait_for_player")
            await websocket.close()
            await websocket.wait_closed()
            return 
        while self.games[gameid].state == "waiting":
            msg = {"command": "wait"}
            if not await self.send_msg(websocket, gameid, msg):
                await self.close_websocket(websocket, gameid, player)
                self.is_waiting_game = False
                return False
            try:
                msg = await websocket.recv()
            except websockets.ConnectionClosedOK:
                await self.close_websocket(websocket, gameid, player)
                return False
            if msg != "wait":
                print(f"Client {player} is disconnected")
                await self.close_websocket(websocket, gameid, player)
                return False
            await asyncio.sleep(0.5)
        return True

    def create_tasks(self, websocket, gameid, player):
        consumer_task = asyncio.create_task(
            self.consumer_handler(websocket, gameid, player)
        )
        producer_task = asyncio.create_task(
            self.producer_handler(websocket, gameid, player)
        )
        return [consumer_task, producer_task]

    async def consumer_handler(self, websocket, gameid, player):
        async for message in websocket:
            print(message)
            try:
                self.games[gameid].update(message, player)
            except KeyError:
                await websocket.close()
                await websocket.wait_closed()
                return 
            await asyncio.sleep(0)

    async def producer_handler(self, websocket, gameid, player):
        try:
            _ = self.games[gameid]
        except KeyError:
            await websocket.close()
            await websocket.wait_closed()
            return 
        while self.games[gameid].state != "ending":
            message = await self.games[gameid].run(player)
            if message is not None:
                await self.send_msg(websocket, gameid, message)
            await asyncio.sleep(1/30)
        print(f"game {gameid} ending")
        ending_msg = await self.games[gameid].get_ending_message()
        await self.send_msg(websocket, gameid, ending_msg)
        await self.close_websocket(websocket, gameid, player)

    def remove_game(self, gameid):
        try:
            if self.games[gameid].is_ready_to_be_remove():
                print("removing game", gameid)
                self.games.pop(gameid)
        except KeyError:
            print(f"Game {gameid} does not exist")

    async def send_msg(self, websocket, gameid, msg):
        try:
            await websocket.send(json.dumps(msg))
        except websockets.ConnectionClosedOK:
            print("disconnection of :", websocket)
            self.games[gameid].set_looser(websocket)
            return False
        return True

    async def close_websocket(self, websocket, gameid, player):
        try:
            self.games[gameid].disconnect_player(player)
            self.remove_game(gameid)
        except KeyError:
            await websocket.close()
            await websocket.wait_closed()

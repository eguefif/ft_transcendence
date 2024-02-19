import asyncio
import logging
from websockets.server import serve
import json
import signal
from authentification import authenticate

from Game import Game

MAX_GAMES = 10


class serverPong:
    def __init__(self):
        self.currentGame = None
        self.games = {}
        self.is_waiting_game = False
        self.current_id = 0
        self.init_logging()

    def init_logging(self):
        logging.basicConfig(format="[%(asctime)s]%(levelname)s:%(module)s:%(funcName)s:%(message)s",
                            datefmt="%m/%d/%Y %H:%M:%S",
                            level=logging.INFO)

    async def run(self, address="0.0.0.0", port=10000):
        stop = self.init_signal()
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
        username = await self.authenticate_user(websocket)
        if not username:
            await self.close_websocket(websocket)
            return
        if not await self.check_server_capacity(websocket, username):
            await self.close_websocket(websocket)
            return
        if await self.is_user_in_game(websocket, username):
            self.close_websocket(websocket)
        else:
            if not self.is_waiting_game:
                await self.create_game(websocket, username, self.current_id)
            else:
                await self.join_game(websocket, username)

    async def authenticate_user(self, websocket):
        msg = await self.recv_msg(websocket, "unknown")
        if not msg:
            await self.close_websocket(websocket)
            return False
        username = authenticate(msg)
        if username is None:
            logging.error(f"Error while authenticating {websocket}")
            await self.send_token_invalid_and_close(websocket)
            return False
        if not await self.send_msg(websocket, {"command": "authsuccess"}, username):
            return False
        logging.info(f"{username} has join the server. Token is valid")
        return username

    async def send_token_invalid_and_close(self, websocket):
        msg = {"command": "tokenInvalid"}
        await self.send_msg(websocket, msg)
        await self.close_websocket(websocket)

    async def check_server_capacity(self, websocket, username):
        if len(self.games) == MAX_GAMES and not self.is_waiting_game:
            await self.send_msg(websocket, {"command": "serverfull"})
            return False
        return True

    async def is_user_in_game(self, websocket, username):
        if self.check_games_for_username(username):
            self.end_game(username)
            await self.close_websocket(websocket, username)
            return True
        return False

    def check_games_for_username(self, username):
        for game in self.games.values():
            if game.isPlayerInGame(username):
                return True
        return False

    async def send_msg(self, websocket, msg, player="unknown"):
        if type(msg) is not dict:
            logging.error(f"Trying to json.dumps that is not a dict: {msg}")
            return False
        try:
            await websocket.send(json.dumps(msg))
        except Exception as e:
            logging.error(f"Exception while sending message to {player} on websocket {websocket}. Exception: {e}")
            return False
        return True

    async def recv_msg(self, websocket, player="unknown"):
        try:
            msg = await websocket.recv()
        except Exception as e:
            logging.error(f"Exception while receiving message to {player} on websocket {websocket}. Exception: {e}")
            return None
        return msg

    async def close_websocket_and_remove_game(self, websocket, gameid, player):
        try:
            self.games[gameid].set_looser(websocket)
            self.games[gameid].set_player_to_disconnected(player)
        except Exception as e:
            logging.error(f"Game {gameid} does not exist anymore. Exception {e}")
        else:
            self.remove_game(gameid)
        finally:
            logging.info(f"Game {gameid} has been removed")
            await self.close_websocket(websocket, player)

    def remove_game(self, gameid):
        try:
            if self.games[gameid].is_ready_to_be_remove():
                logging.info(f"removing game {gameid}")
                self.games.pop(gameid)
        except KeyError:
            logging.error(f"Game {gameid} does not exist while removing game")

    def is_game(self, gameid):
        if gameid in self.games.keys():
            return True
        return False

    async def close_websocket(self, websocket, player="unknown"):
        logging.info(f"Terminating connection with {player} on {websocket}")
        await websocket.close()
        await websocket.wait_closed()

    def end_game(self, username):
        gameid = self.get_game_by_username(username)
        self.games[gameid].set_looser_by_username(username)

    def get_game_by_username(self, username):
        for game in self.games.values():
            if game.isPlayerInGame(username):
                return game.id
        return -1

    async def create_game(self, websocket, username, gameid):
        logging.info(f"{username} has created game: {gameid}")
        self.games[self.current_id] = Game(username, self.current_id, websocket)
        self.is_waiting_game = True
        await self.run_game(self.current_id, websocket, username)

    async def join_game(self, websocket, username):
        logging.info(f"{username} join game {self.current_id}")
        try:
            await self.games[self.current_id].add_player(username, websocket)
        except Exception as e:
            logging.error(f"{username} tried to join game {self.current_id} but {e} was raised. Game does not exist anymore.")
            await self.close_websocket(websocket, username)
            return False
        self.current_id += 1
        self.is_waiting_game = False
        await self.run_game(self.current_id - 1, websocket, username)

    async def run_game(self, gameid, websocket, player):
        logging.info(f"{player} entering in run_game")
        if not await self.wait_for_player(gameid, websocket, player):
            self.is_waiting_game = False
            await self.close_websocket_and_remove_game(websocket, gameid, player)
            return
        if not await self.wait_for_ready(gameid, websocket, player):
            await self.close_websocket_and_remove_game(websocket, gameid, player)
            return

        if self.games[gameid].state != "ending":
            tasks = self.create_tasks(websocket, gameid, player)
            await asyncio.gather(*tasks)
        else:
            await self.close_websocket_and_remove_game(websocket, gameid, player)

    async def wait_for_ready(self, gameid, websocket, player):
        if not await self.send_getready(websocket, player):
            return False
        timeout = 20
        if self.is_game(gameid):
            while True:
                state = self.get_game_state(gameid)
                if not state or state == "ending":
                    return False
                if state == "running":
                    return True
                if not await self.send_getready(websocket, player):
                    return False
                retval = await self.recv_msg(websocket, player)
                if not retval:
                    return False
                if retval == "ready":
                    if not self.update_player_state(gameid, retval, player):
                        return False
                    return True
                timeout -= 1
                if timeout == 0:
                    logging.error(f"Timeout for {player}, ({websocket})")
                    return False
                await asyncio.sleep(0.5)
            else:
                logging.error(f"Game {gameid} does not exist anymore, closing connection with {player} on {websocket}")
                return False
        return False

    def update_player_state(self, gameid, retval, player):
        try:
            self.games[gameid].update(retval, player)
        except Exception:
            logging.error(f"Game {gameid} does not exist anymore in wait_for_ready")
            return False
        return True

    async def send_getready(self, websocket, player):
        msg = {"command": "getready"}
        if not await self.send_msg(websocket, msg, player):
            return False
        return True

    async def wait_for_player(self, gameid, websocket, player):
        if self.is_game(gameid):
            state = "waiting"
            while state == "waiting":
                state = self.get_game_state(gameid)
                if state == "ending" or not state:
                    return False
                if state == "getready":
                    return True
                if not await self.send_msg(websocket, {"command": "wait"}, player):
                    return False
                msg = await self.recv_msg(websocket, player)
                if not msg or msg != "wait":
                    return False
                await asyncio.sleep(1)
        else:
            logging.error(f"Game {gameid} does not exist anymore, closing connection with {player} on {websocket}")
            return False
        return False

    def get_game_state(self, gameid):
        try:
            state = self.games[gameid].state
        except Exception:
            logging.error(f"Game {gameid} does not exist anymore")
            return False
        return state

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
            if self.get_game_state(gameid) == "ending":
                break
            else:
                if not self.update_player_state(gameid, message, player):
                    break
            await asyncio.sleep(0)

    async def producer_handler(self, websocket, gameid, player):
        while self.get_game_state(gameid) != "ending":
            message = await self.games[gameid].run(player)
            if message is not None:
                if not await self.send_msg(websocket, message, player):
                    break
            await asyncio.sleep(1/30)
        ending_msg = await self.games[gameid].get_ending_message()
        await self.send_msg(websocket, ending_msg, player)
        await self.close_websocket_and_remove_game(websocket, gameid, player)

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
        if len(self.games) == MAX_GAMES and self.is_waiting_game == False:
            await self.send_msg(websocket, {"command": "serverfull"})
            return
        logging.info(f"New connection {websocket}")
        msg = await self.recv_msg(websocket, "unknown")
        if not msg:
            logging.error(f"Error while receiving first message from {websocket}")
            await self.close_websocket(websocket)
            return
        username = authenticate(msg)
        if username is None:
            logging.error(f"Error while authenticating {websocket}")
            await self.send_token_invalid_and_close(websocket)
            return
        if not await self.send_msg(websocket, {"command": "authsuccess"}, username):
            logging.error(f"Error while sending auth success to {websocket} disconnected")
            return
        logging.info(f"{username} has join the server. Token is valid")
        if self.is_user_in_game(username):
            self.end_game(username)
            await self.close_websocket(websocket, username)
            return
        if not self.is_waiting_game:
            await self.create_game(websocket, username, self.current_id)
        else:
            await self.join_game(websocket, username)

    async def send_msg(self, websocket, msg, player="unknown"):
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
        logging.info(f"new message: {msg}")
        return msg

    async def close_websocket_and_remove_game(self, websocket, gameid, player):
        try:
            self.games[gameid].set_looser(websocket)
            self.games[gameid].set_player_to_disconnected(player)
        except KeyError:
            logging.error(f"Game {gameid} does not exist anymore")
        else:
            self.remove_game(gameid)
        finally:
            logging.info(f"Game {gameid} has been removed")
            await self.close_websocket(websocket, player)

    def is_game(self, gameid):
        if gameid in self.games.keys():
            return True
        return False

    async def close_websocket(self, websocket, player="unknown"):
        logging.info(f"Terminating connection with {player} on {websocket}")
        await websocket.close()
        await websocket.wait_closed()

    async def send_token_invalid_and_close(self, websocket):
        msg = {"command": "tokenInvalid"}
        await self.send_msg(msg)
        await self.close_websocket(websocket)

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
        logging.info(f"{username} has created game: {gameid}")
        self.games[self.current_id] = Game(username, self.current_id, websocket)
        self.is_waiting_game = True
        await self.run_game(self.current_id, websocket, username)

    async def join_game(self, websocket, username):
        logging.info(f"{username} join game {self.current_id}")
        try:
            await self.games[self.current_id].add_player(username, websocket)
        except KeyError as e:
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
        logging.info(f"{player} out of get waiting")
        if not await self.wait_for_ready(gameid, websocket, player):
            await self.close_websocket_and_remove_game(websocket, gameid, player)
            return

        logging.info(f"{player} out of get ready")
        if self.games[gameid].state != "ending":
            tasks = self.create_tasks(websocket, gameid, player)
            await asyncio.gather(*tasks)
        else:
            await self.close_websocket_and_remove_game(websocket, gameid, player)

    async def wait_for_ready(self, gameid, websocket, player):
        msg = {"command": "getready"}
        if not await self.send_msg(websocket, msg, player):
            logging.info(f"Disconnection with: {player} on {websocket}")
            return False
        timeout = 20
        if self.is_game(gameid):
            while self.games[gameid].state == "getready":
                msg = {"command": "getready"}
                if not await self.send_msg(websocket, msg, player):
                    logging.error(f"Disconnection with: {player} on {websocket}")
                    return False
                retval = await self.recv_msg(websocket, player)
                if not retval:
                    logging.error(f"Disconnection with: {player} on {websocket}")
                    return False
                if retval == "ready":
                    try:
                        self.games[gameid].update(retval, player)
                    except KeyError:
                        logging.error(f"Game {gameid} does not exist anymore in wait_for_ready")
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
        return True

    async def wait_for_player(self, gameid, websocket, player):
        if self.is_game(gameid):
            while self.games[gameid].state == "waiting":
                msg = {"command": "wait"}
                if not await self.send_msg(websocket, msg, player):
                    logging.error(f"Disconnection while sending wait with {player} on {websocket}")
                    self.is_waiting_game = False
                    return False
                msg = await self.recv_msg(websocket, player)
                if not msg or msg != "wait":
                    logging.error(f"Disconnection with: {player} ({websocket})")
                    return False
                await asyncio.sleep(1)
        else:
            logging.error(f"Game {gameid} does not exist anymore, closing connection with {player} on {websocket}")
            return False
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
            if (self.is_game_ending(gameid)):
                break
            else:
                self.games[gameid].update(message, player)
            await asyncio.sleep(0)

    async def producer_handler(self, websocket, gameid, player):
        while not self.is_game_ending(gameid):
            message = await self.games[gameid].run(player)
            if message is not None:
                if not await self.send_msg(websocket, message, player):
                    logging.error(f"Disconnection with: {player} ({websocket})")
                    break
            await asyncio.sleep(1/30)
        ending_msg = await self.games[gameid].get_ending_message()
        await self.send_msg(websocket, ending_msg, player)
        await self.close_websocket_and_remove_game(websocket, gameid, player)

    def is_game_ending(self, gameid):
        if not self.is_game(gameid):
            return True
        else:
            if self.games[gameid].state == "ending":
                return True
        return False

    def remove_game(self, gameid):
        try:
            if self.games[gameid].is_ready_to_be_remove():
                logging.info(f"removing game {gameid}")
                self.games.pop(gameid)
        except KeyError:
            logging.error(f"Game {gameid} does not exist while removing game")

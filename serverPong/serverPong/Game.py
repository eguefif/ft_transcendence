import asyncio
import time
import logging


from djangoInterface import create_game_db_django, end_game_db_django
from Paddle import Paddle
from Ball import Ball


class Game:
    def __init__(self, player1, gameid, websocket):
        self.id = gameid
        self.ball = Ball()
        self.paddle1 = Paddle(1)
        self.paddle2 = Paddle(2)
        self.score = {"player1": 0, "player2": 0}
        self.state = "waiting"
        self.player1 = player1
        self.player2 = ""
        self.p1_ready = False
        self.p2_ready = False
        self.p1_websocket = websocket
        self.p1_disconnected = False
        self.p2_disconnected = True
        self.winner = None
        self.time = 3
        self.djangoid = -1

    async def add_player(self, player, websocket):
        self.player2 = player
        self.p2_disconnected = False
        self.p2_websocket = websocket
        self.state = "getready"
        self.time = 3
        #self.djangoId = await create_game_db_django(self.player1, self.player2, self.time)

    def is_ready_to_be_remove(self):
        return self.p1_disconnected and self.p2_disconnected

    def set_player_to_disconnected(self, username):
        if self.player1 == username:
            self.p1_disconnected = True
        else:
            self.p2_disconnected = True

    def isPlayerInGame(self, username):
        if not self.player2:
            return self.player1 == username
        return self.player1 == username or self.player2 == username

    def update(self, message, player):
        if message == "ready" and self.state == "getready":
            logging.info(f"{player} is ready")
            if player == self.player1:
                self.p1_ready = True
            if player == self.player2:
                self.p2_ready = True
            if self.is_ready() and self.state != "running":
                logging.info(f"Game {self.id} is starting")
                self.state = "running"
        if self.state == "running":
            if player == self.player1:
                self.paddle1.update(message)
            elif player == self.player2:
                self.paddle2.update(message)

    def is_ready(self):
        return self.p1_ready and self.p2_ready

    async def run(self, player):
        retval = None

        if self.state == "running":
            retval = {
                    "command": "data",
                    "player1Score": self.score["player1"],
                    "player2Score": self.score["player2"],
                    "message": "",
                    "player1": self.player1,
                    "player2": self.player2,
                    "ball": self.ball.getPosition(),
                    "paddle1": self.paddle1.getPosition(),
                    "paddle2": self.paddle2.getPosition(),
                    "startTimer": 0,
                }
        if self.time != 0 and self.state == "running":
            if self.player1 == player:
                await asyncio.sleep(1)
                self.time -= 1
            retval["startTimer"] = self.time

        if self.state == "running" and not self.is_end_game() and self.time == 0:
            result = self.move()
            if result is not None:
                self.init_game()
                self.update_score(result)
            retval["ball"]: self.ball.getPosition()
            retval["paddle1"]: self.paddle1.getPosition()
            retval["paddle2"]: self.paddle2.getPosition()
            retval["scorePlayer1"]: self.score["player1"]
            retval["scorePlayer2"]: self.score["player2"]
            retval["startTimer"]: 0
        if self.is_end_game() is True:
            self.state = "ending"
        return retval

    async def get_ending_message(self):
        msg = {
                "command": "ending",
                "startTimer": 0,
                "ball": self.ball.getPosition(),
                "paddle1": self.paddle1.getPosition(),
                "paddle2": self.paddle2.getPosition(),
                "player1": self.player1,
                "player2": self.player2,
                "player1Score": self.score["player1"],
                "player2Score": self.score["player2"],
                "startTimer": 0,
            }
        if self.score["player1"] > self.score["player2"]:
            self.winner = self.player1
        else:
            self.winner = self.player2
        if self.winner:
            msg["message"] = "The winner is " + self.winner
        else:
            msg["message"] = "Your opponent was disconnected "
        #await end_game_db_django(self.djangoId, self.winner, self.score["player1"],
        #self.score["player2"])
        return msg

    def init_game(self):
        self.ball.init()
        self.paddle1.init()
        self.paddle2.init()

    def update_score(self, result):
        if result == "left":
            self.score["player2"] += 1
            self.time = 3
        elif result == "right":
            self.score["player1"] += 1
            self.time = 3
        else:
            self.time = 0

    def move(self):
        self.paddle1.move()
        self.paddle2.move()
        return self.ball.move(self.paddle1, self.paddle2)

    def is_end_game(self):
        return self.score["player1"] == 3 or self.score["player2"] == 3

    def set_looser(self, websocket):
        self.state = "ending"
        if self.p1_websocket == websocket:
            self.winner = self.player2
        else:
            self.winner = self.player1

    def set_looser_by_username(self, username):
        self.state = "ending"
        if self.player2 == username:
            self.winner = self.player1
        else:
            self.winner = self.player2

    def __repr__(self):
        retval = f"Game: {self.player1}, {self.player2}"
        return retval

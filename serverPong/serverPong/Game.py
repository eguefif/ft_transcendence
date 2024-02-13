import json

from Paddle import Paddle
from Ball import Ball


class Game:
    def __init__(self, player1):
        self.ball = Ball()
        self.paddle1 = Paddle(1)
        self.paddle2 = Paddle(2)
        self.score = {"player1": 0, "player2": 0}
        self.state = "waiting"
        self.player1 = player1
        self.player2 = ""
        self.p1_ready = False
        self.p2_ready = False

    def addPlayer(self, player):
        self.player2 = player
        self.state = "getready"

    def update(self, message, player):
        if message == "ready" and self.state == "getready":
            if player == self.player1:
                self.p1_ready = True
            if player == "player2":
                self.p2_ready = True
            if self.isReady():
                self.state = "starting"
            return
        if self.state == "ending":
            return
        if self.state == "running":
            if player == self.player1:
                self.paddle1.update(message)
            elif player == self.player2:
                self.paddle2.update(message)

    def isReady(self):
        return self.p1_ready and self.p2_ready

    def isPlayerInGame(self, username):
        if not self.player2:
            return self.player1 == username
        return self.player1 == username or self.player2 == username

    def run(self):
        retval = {}
        if self.state == "starting":
            self.state = "running"
            retval = json.dumps({"command": "starting"})
        elif self.state == "running" and self.isEndGame() is not True:
            result = self.move()
            if result is not None:
                self.init_game()
                self.update_score(result)
            retval = json.dumps(
                {
                    "command": "data",
                    "startTimer": 0,
                    "ball": self.ball.getPosition(),
                    "paddle1": self.paddle1.getPosition(),
                    "paddle2": self.paddle2.getPosition(),
                    "score": self.score,
                }
            )
        if self.isEndGame() is True:
            self.state = "ending"
            msg = self.getEndingMsg()
            retval = json.dumps({"command": "ending", "winnerMessage": msg})
        return retval

    def getEndingMsg(self):
        if self.score["player1"] > self.score["player2"]:
            return "The winner is " + self.player1
        elif self.score["player1"] < self.score["player2"]:
            return "The winner is " + self.player2
        return "It's a tie"

    def init_game(self):
        self.ball.init()
        self.paddle1.init()
        self.paddle2.init()

    def update_score(self, result):
        if result == "left":
            self.score["player1"] += 1
        else:
            self.score["player2"] += 1

    def move(self):
        self.paddle1.move()
        self.paddle2.move()
        return self.ball.move(self.paddle1, self.paddle2)

    def isEndGame(self):
        return self.score["player1"] == 3 or self.score["player2"] == 3

    def __repr__(self):
        retval = f"Game: {self.player1}, {self.player2}"
        return retval

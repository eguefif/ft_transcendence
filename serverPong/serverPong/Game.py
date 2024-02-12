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
        self.p1_ready = False
        self.p2_ready = False

    def addPlayer(self, player):
        self.player2 = player

    def update(self, message, player):
        if message == "ready" and self.state == "waiting":
            if player == "player1":
                self.p1_ready = True
            if player == "player2":
                self.p2_ready = True
            if self.isReady():
                self.state = "starting"
                return
        if self.state == "ending":
            return
        if player == "player1":
            self.paddle1.update(message)
        elif player == "player2":
            self.paddle1.update(message)

    def isReady(self):
        return self.p1_ready and self.p2_ready

    def run(self):
        retval = {}
        if self.state == "starting":
            self.state = "running"
            retval = json.dumps({"commands": "starting"})
        elif self.state == "running" and not self.isEndGame():
            result = self.move()
            if result != none:
                self.init_game()
                self.update_score()
            retval = json.dumps({"command": "position",
                "ball": self.ball.getPosition(),
                "paddle1": self.paddle1.getPosition(),
                "paddle2": self.paddle1.getPosition(),
                "score": self.score})
        elif self.isEndGame():
            self.state = "end"
        return retval

    def init_game(self):
        self.ball.init()
        self.palled2.init()
        self.paddle2.init()

    def update_score(self):
        if result == "left":
            self.score["player1"] += 1
        else:
            self.score["player2"] += 1

    def mode(self):
        self.paddle1.move()
        self.paddle2.move()
        self.ball.move(self.paddle1, self.paddle2)

    def isEndGame(self):
        return self.score["player1"] == 3 or self.score["player2"]

    def __repr__(self):
        retval = f"Game: {self.player1}, {self.player2}"
        return retval

import json


class Game:
    def __init__(self, player1):
        self.ball = Ball()
        self.paddle1 = Paddle(1)
        self.paddle2 = Paddle(2)
        self.score = {"player1": 0, "player2": 0}
        self.state = "waiting"
        self.player1 = player1

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

    def isReady(self):
        return self.p1_ready and self.p2_ready

    async def getData(self):
        if self.state == "starting":
            self.state == "running"
            retval = json.dumps({"commands": "starting"})
        elif self.state == "running" and not self.isEndGame():
            retval = json.dumps({
                "ball": self.ball.getPosition,
                "paddle1": self.paddle1.getPosition,
                "paddle2": self.paddle1.getPosition,
                "score": self.score})
        elif self.isEndGame():
            self.state = "end"
        return retval

    def isEndGame():
        return self.score["player1"] == 3 or self.score["player2"]

    def __repr__(self):
        retval = f"Game: {self.player1}, {self.player2}"
        return retval

class Ball:
    def __init__(self):
        self.x = 50
        self.y = 50
        self.speed = 3

class Paddle:
    def __init__(self, side):
        self.y = 50
        self.speed = 3
        if side == 1:
            self.x = 0
        else :
            self.x = 90

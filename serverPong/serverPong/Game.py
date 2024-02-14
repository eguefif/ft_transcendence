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

    def add_player(self, player, websocket):
        self.player2 = player
        self.p2_disconnected = False
        self.p2_websocket = websocket
        self.state = "getready"
        print(f"game {self.id} changing state to", self.state)

    def is_ready_to_be_remove(self):
        return self.p1_disconnected and self.p2_disconnected

    def disconnect_player(self, username):
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
            print(player, "is ready")
            if player == self.player1:
                self.p1_ready = True
            if player == self.player2:
                self.p2_ready = True
            if self.is_ready():
                print("Game is starting")
                self.state = "running"
            return
        if self.state == "running":
            if player == self.player1:
                self.paddle1.update(message)
            elif player == self.player2:
                self.paddle2.update(message)

    def is_ready(self):
        return self.p1_ready and self.p2_ready

    def run(self):
        retval = {}
        print("state:", self.state)
        if self.state == "running" and not self.is_end_game():
            print("game running")
            result = self.move()
            if result is not None:
                self.init_game()
                self.update_score(result)
            retval =  {
                    "command": "data",
                    "startTimer": 0,
                    "ball": self.ball.getPosition(),
                    "paddle1": self.paddle1.getPosition(),
                    "paddle2": self.paddle2.getPosition(),
                    "score": self.score,
                    "winnerMessage", ""
                }
        if self.is_end_game() is True:
            self.state = "ending"
        return retval

    def get_ending_message(self):
        msg =  {
                "command": "data",
                "startTimer": 0,
                "ball": self.ball.getPosition(),
                "paddle1": self.paddle1.getPosition(),
                "paddle2": self.paddle2.getPosition(),
                "score": self.score,
            }
        if self.score["player1"] > self.score["player2"]:
            self.winner = self.player1
        elif self.score["player1"] < self.score["player2"]:
            self.winner = self.player2
        if self.winner:
            msg["winnerMessage"] =  "The winner is " + self.winner
        else:
            msg["winnerMessage"] = "Your opponent was disconnected "
        return msg

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

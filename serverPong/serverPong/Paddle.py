import json


class Paddle:
    def __init__(self, side):
        self.side = side
        self.height = 20
        self.init()
    
    def init(self):
        self.y = 50
        self.speed = 3
        if self.side == 1:
            self.x = 0
        else :
            self.x = 90

    def update(self, direction):
        if direction == "top":
            self.speed = -3
        elif direction == "bot":
            self.speeed = 3
        else:
            direction = 0

    def move(self):
        if (self.y += self.speed <=0 or self.y += self.speed >= 100):
            return
        self.y += self.speed

    def getPosition(self):
        return json.dumps({"x": self.x,
                          "y": self.y})

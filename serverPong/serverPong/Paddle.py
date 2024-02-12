class Paddle:
    def __init__(self, side):
        self.side = side
        self.height = 0.1
        self.init()

    def init(self):
        self.y = 0.5
        self.speed = 0.03
        if self.side == 1:
            self.x = 0
        else:
            self.x = 0.9

    def update(self, direction):
        if direction == "up":
            self.speed = -0.03
        elif direction == "down":
            self.speeed = 0.03
        elif direction == "stop":
            direction = 0

    def move(self):
        if (self.y + self.speed) <= 0 or (self.y + self.height + self.speed >= 1):
            return
        self.y += self.speed

    def getPosition(self):
        return {"x": self.x, "y": self.y}

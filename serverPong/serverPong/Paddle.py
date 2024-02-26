class Paddle:
    def __init__(self, side):
        self.side = side
        self.height = 0.1
        self.init()
        self.speed = 0
        self.margin_x = 1 / 32
        self.margin_y = 1 / 32
        if side == 1:
            self.x = 0.05
        else:
            self.x = 0.95
        self.y = 0.5 - self.height / 2

    def init(self):
        self.speed = 0
        self.y = 0.5 - self.height / 2

    def update(self, direction):
        if direction == "up":
            self.speed = -0.005
        elif direction == "down":
            self.speed = 0.005
        elif direction == "stop":
            self.speed = 0

    def move(self):
        if (self.y + self.speed - self.margin_y) <= 0 or (self.y + self.margin_y + self.height + self.speed >= 1):
            return self.y
        self.y += self.speed

    def getPosition(self):
        return {"x": self.x, "y": self.y, "height": self.height}

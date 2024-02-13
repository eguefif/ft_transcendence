class Paddle:
    def __init__(self, side):
        self.side = side
        self.height = 0.1
        self.init()
        self.speed = 0
        if side == 1:
            self.x = 0.1
        else:
            self.x = 0.9
        self.y = 0.5 - self.height / 2

    def init(self):
        self.speed = 0

    def update(self, direction):
        print("direction ", direction)
        if direction == "up":
            self.speed = -0.01
        elif direction == "down":
            self.speed = 0.01
        elif direction == "stop":
            self.speed = 0

    def move(self):
        print("speed ", self.speed)
        if (self.y + self.speed) <= 0 or (self.y + self.height + self.speed >= 1):
            return self.y
        self.y += self.speed

    def getPosition(self):
        return {"x": self.x, "y": self.y, "height": self.height}

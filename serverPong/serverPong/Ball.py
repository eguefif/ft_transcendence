import json


class Ball:
    def __init__(self):
        self.init()

    def init(self):
        self.x = 50
        self.y = 50
        self.dirX = 1
        self.dirY = 1
        self.speed = 3

    def update(self, direction):
        if direction == "top":
            self.speed = -3
        elif direction == "bot":
            self.speeed = -3
        else:
            direction = 0

    def move(self, paddle1, paddle2):
        if self.walltopBottomCollision():
            self.dirY *= -1
        if self.paddleCollision(paddle1, paddle2):
            self.dirX *= -1
        if self.sidesWallCollision():
            if this.ball.x <= 20:
                return "left":
            else:
                return "right"

        self.y += self.speed self.dirY
        self.x += self.speed * self.dirX

    def walltopBottomCollision(self):
        if self.radius - self.y <= 0:
            return True
        if self.radius + self.y >= 100:
            return True

    def sideWallColission(self):
        if self.radius - self.x <= 0:
            return True
        if self.radius + self.x >= 100:
            return True

    def paddleCollision(self, paddle1, paddle2):
        return (self.isLeftPaddleCollision(paddle1)
            or self.isRightPaddleCollision(paddle2))
    
    def isRightPaddleCollision(self, paddle):
        return ((self.radius - self.x) >= paddle.x and
                ((self.radius - self.y) >= paddle.Y and
                (self.radius + self.y) <= (paddle.y + paddle.height))
                
    def isLeftPaddleCollision(self, paddle):
        return ((self.radius - self.x) <= paddle.x and
                ((self.radius - self.y) >= paddle.Y and
                (self.radius + self.y) <= (paddle.y + paddle.height))

    def getPosition(self):
        return json.dumps({"x": self.x,
                          "y": self.y})

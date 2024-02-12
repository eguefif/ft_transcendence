class Ball:
    def __init__(self):
        self.init()

    def init(self):
        self.x = 0.5
        self.y = 0.5
        self.dirX = 1
        self.dirY = 1
        self.speed = 0.03
        self.radius = 0.05

    def move(self, paddle1, paddle2):
        if self.walltopBottomCollision():
            self.dirY *= -1
        if self.paddleCollision(paddle1, paddle2):
            self.dirX *= -1
        if self.sideWallCollision():
            if self.x <= 0.1:
                return "left"
            else:
                return "right"

        self.y += self.speed * self.dirY
        self.x += self.speed * self.dirX
        return None

    def walltopBottomCollision(self):
        if self.radius - self.y <= 0:
            return True
        if self.radius + self.y >= 1:
            return True

    def sideWallCollision(self):
        if self.x + self.speed - self.radius <= 0:
            return True
        if self.x + self.speed + self.radius >= 1:
            return True
        return None

    def paddleCollision(self, paddle1, paddle2):
        return self.isLeftPaddleCollision(paddle1) or self.isRightPaddleCollision(
            paddle2
        )

    def isRightPaddleCollision(self, paddle):
        return (self.radius - self.x + self.speed) >= paddle.x and (
            (self.radius - self.y + self.speed) >= paddle.Y
            and (self.radius + self.y + self.speed) <= (paddle.y + paddle.height)
        )

    def isLeftPaddleCollision(self, paddle):
        return (self.radius - self.x + self.speed) <= paddle.x and (
            (self.radius - self.y + self.speed) >= paddle.y
            and (self.radius + self.y + self.speed) <= (paddle.y + paddle.height)
        )

    def getPosition(self):
        return {"x": self.x, "y": self.y}

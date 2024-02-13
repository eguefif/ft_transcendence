from math import sqrt
from random import random


class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def norm(self):
        magnitude = sqrt(self.x**2 + self.y**2)
        if magnitude != 0:
            self.x /= magnitude
            self.y /= magnitude


class Ball:
    def __init__(self):
        self.init()

    def init(self):
        self.x = 0.5
        self.y = 0.5
        self.resetPosition()
        self.speed = 1 / 170
        self.radius = 1 / 40
        
    def resetPosition(self):
        self.dir = Vector(random() * 2 - 1, random() * 2 - 1)
        if self.dir.x < 0:
            self.dir.x = min(-0.5, self.dir.x)
        else:
            self.dir.x = max(0.5, self.dir.x)

    def move(self, paddle1, paddle2):
        self.y += self.speed * self.dir.y
        self.x += self.speed * self.dir.x

        self.wallTopBottomCollision()
        self.paddleCollision(paddle1, paddle2)
        return self.sideWallCollision()

    def wallTopBottomCollision(self):
        if self.y <= self.radius or self.y >= 1 - self.radius:
            self.dir.y *= -1

    def sideWallCollision(self):
        if self.x - self.radius <= 0:
            return "left"
        if self.x + self.radius >= 1:
            return "right"
        return None

    def paddleCollision(self, paddle1, paddle2):
         if self.isLeftPaddleCollision(paddle1):
            print("left")
            self.dir.x = 0.5
            diff = self.y - paddle1.y
            self.dir.y = diff * 0.866025403784439  / paddle1.height
            self.dir.norm()

         if self.isRightPaddleCollision(paddle2):
            print("left")
            self.dir.x = -0.5
            diff = self.y - paddle2.y
            self.dir.y = diff * 0.866025403784439  / paddle2.height
            self.dir.norm()
        

    def isRightPaddleCollision(self, paddle):
        return (self.x + self.radius >= paddle.x and
                self.y <= paddle.y and self.y >= paddle.y + paddle.height and
                self.dir.x > 0)

    def isLeftPaddleCollision(self, paddle):
        return (self.x - self.radius >= paddle.x and
                self.y <= paddle.y and self.y >= paddle.y + paddle.height and
                self.dir.x < 0)

    def getPosition(self):
        return {"x": self.x, "y": self.y, "radius": self.radius}

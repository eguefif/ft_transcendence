from math import sqrt
from random import random
import logging
import time


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
        self.timer_speed = 0

    def init(self):
        self.x = 0.5
        self.y = 0.5
        self.resetPosition()
        self.speed = 1 / 300
        self.radius = 1 / 40
        self.timer_speed = time.time() + 5

    def increase_speed(self):
        now = time.time()
        if self.speed < self.radius - 0.003 and now >= self.timer_speed:
            self.speed += 0.0005
            self.timer_speed = time.time() + 5

    def resetPosition(self):
        self.speed = 1 / 120
        self.dir = Vector(random() * 2 - 1, 0)
        if self.dir.x < 0:
            self.dir.x = min(-0.5, self.dir.x)
        else:
            self.dir.x = max(0.5, self.dir.x)
        self.dir.norm()

    def move(self, paddle1, paddle2):
        self.y += self.speed * self.dir.y
        self.x += self.speed * self.dir.x

        self.wallTopBottomCollision()
        self.paddleCollision(paddle1, paddle2)
        return self.sideWallCollision()

    def wallTopBottomCollision(self):
        if (self.y <= self.radius and self.dir.y <= 0) or (self.y >= 1 - self.radius and self.dir.y >= 0):
            self.dir.y *= -1
            self.dir.norm()

    def sideWallCollision(self):
        if self.x - self.radius <= 0:
            return "left"
        if self.x + self.radius >= 1:
            return "right"
        return None

    def paddleCollision(self, paddle1, paddle2):
        if self.isLeftPaddleCollision(paddle1):
            self.dir.x = 0.5
            diff = self.y - paddle1.height / 2 - paddle1.y
            self.dir.y = diff * 0.866025403784439 / paddle1.height
            self.dir.norm()

        if self.isRightPaddleCollision(paddle2):
            self.dir.x = -0.5
            diff = self.y - paddle2.height / 2 - paddle2.y
            self.dir.y = diff * 0.866025403784439 / paddle2.height
            self.dir.norm()

    def isRightPaddleCollision(self, paddle):
	    return (self.x + self.radius >= paddle.x and self.x + self.radius < 1 - (paddle.margin_x / 2) and
                self.y + (self.radius / 2)  >= paddle.y and self.y - (self.radius / 2) <= paddle.y + paddle.height
                and self.dir.x > 0)

    def isLeftPaddleCollision(self, paddle):
	    return (self.x - self.radius <= paddle.x and self.x - self.radius > paddle.margin_x / 2 and
    self.y + (self.radius / 2) >= paddle.y and self.y - (self.radius / 2) <= paddle.y + paddle.height and
        self.dir.x < 0)

    def getPosition(self):
        return {"x": self.x, "y": self.y, "radius": self.radius}

from Game import Game

g = Game("player1")

g.addPlayer("player2")

g.update("ready", "player1")
g.update("ready", "player2")
print(g.state)
print(g.run())
print(g.state)
print(g.run())

g.update("top", "player1")
g.update("bot", "player2")
print(g.run())

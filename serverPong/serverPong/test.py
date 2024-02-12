from Game import Game

g = Game("player1")

g.addPlayer("player2")

g.update("ready", "player1")
g.update("ready", "player2")
print(g.state)
print(g.run())
print(g.state)
print(g.run())

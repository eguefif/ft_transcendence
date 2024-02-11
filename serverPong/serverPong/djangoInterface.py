def isAuth(token):
    print("Checking authentification with django: ", token)
    return True

def createGame(player1, player2):
    print(f"Creating game with: {player1}, {player2}")

def changeState(player1, player2):
    print("Changing state")

def endGame(winner):
    print(f"Game is over. {winner} won")

def dropGame(player1, player2):
    print(f"Game is cancelled")

def isAuth(token):
    print("Checking authentification with django: ", token)
    return True


def createGame(player1, player2, creationtime):
    djangoId = 0
    print(f"Creating game with: {player1}, {player2}")
    return djangoId


def endGame(djangoId, winner):
    print(f"Game is over. {winner} won")
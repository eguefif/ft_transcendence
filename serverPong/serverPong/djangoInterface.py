import aiohttp
import json


async def create_game_db_django(player1, player2, creationtime):
    print(f"Creating game with: {player1}, {player2} and {creationtime}")
    djangoId = -1
    data = json.dumps(
        {
            "player1": player1,
            "player2": player2,
            "creationtime": str(creationtime),
        }
    )
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://django:8000/api/game/creategame/",
            json=data,
            # ssl=None,
            # verify_ssl=False,
        ) as resp:
            if resp.status == 201:
                print(f"Game created in django id: {djangoId}")
                body = await resp.text()
                body = json.loads(body)
                djangoId = int(body["gameid"])
            else:
                print(
                    f"Error while creating db game ({creationtime}) response status: ",
                    resp.status,
                )
                return False
    return djangoId


async def end_game_db_django(djangoId, winner, score1, score2):
    print(f"Game is over. {winner} won")
    data = json.dumps(
        {
            "gameid": djangoId,
            "winner": winner,
            "score_player1": str(score1),
            "score_player2": str(score2),
        }
    )
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://django:8000/api/game/endgame/",
            json=data,
            # ssl=None,
            # verify_ssl=False,
        ) as resp:
            if resp.status == 200:
                print(f"Game updated with the winner in django id: {djangoId}")
            else:
                print(
                    f"Error while updating db game id ({djangoId}) response status: ",
                    resp.status,
                )
                return False
    return True

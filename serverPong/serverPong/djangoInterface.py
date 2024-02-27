import aiohttp
import logging
import json


class ModelGame:
    def __init__(self):
        self.game_created = False
        self.game_ended = False

    async def create_game_db_django(self, player1, player2, creationtime):
        if self.game_created == True:
            return
        logging.info(f"Creating game with: {player1}, {player2} and {creationtime}")
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
                "http://django:8000/api/game/creategame",
                json=data,
            ) as resp:
                if resp.status == 201:
                    logging.info(f"Game created in django id: {djangoId}")
                    body = await resp.text()
                    body = json.loads(body)
                    djangoId = int(body["gameid"])
                else:
                    logging.error(
                        f"Error while creating db game ({creationtime}) response status: {resp.status}"
                    )
                    return False
        self.game_created = True
        return djangoId


    async def end_game_db_django(self, djangoId, winner, score1, score2):
        if self.game_ended == True:
            return True
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
                "http://django:8000/api/game/endgame",
                json=data,
            ) as resp:
                if resp.status == 200:
                    logging.info(f"Game updated with the winner in django id: {djangoId}")
                else:
                    logging.error(
                        f"Error while updating db game id ({djangoId}) response status: {resp.status}",
                    )
                    return False
        self.game_ended = True
        return True

    async def drop_game(self, djangoId):
        data = json.dumps(
                {
                    "gameid": djangoId,
                })
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://django:8000/api/game/dropgame",
                json=data,
            ) as resp:
                if resp.status == 200:
                    logging.info(f"game {djangoId} was dropped")
                else:
                    logging.error(
                        f"Error while dropping game id ({djangoId}) response status: {resp.status}",
                    )

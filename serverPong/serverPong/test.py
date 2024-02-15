import aiohttp
import time
import asyncio

from djangoInterface import create_game, end_game


URL = "http://django:8000/api/getgames"

async def main():
    player1 = "test123"
    player2 = "eguefif1"
    creationtime = time.time()
    djangoId = await create_game(player1, player2, creationtime)
    await end_game(djangoId, player1, 3, 1)
    async with aiohttp.ClientSession() as session:
        async with session.get(URL) as resp:
            retval = await resp.text()
        print(retval[-1])
        print("Expected: ", player1, player2, "3", "1", creationtime)

asyncio.run(main())

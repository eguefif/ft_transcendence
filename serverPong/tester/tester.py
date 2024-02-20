from websockets.sync.client import connect
import asyncio
import json

async def tester():
    with connect("ws://localhost:80/game/") as ws:
        send_msg("debug", ws)
        resp = await recv_msg(ws)
        print(resp)
        resp = await recv_msg(ws)
        resp = json.loads(resp)
        while resp["command"] == "wait":
            send_msg("wait", ws)
            resp = await recv_msg(ws)
            resp = json.loads(resp)
            print(resp)
        resp = await recv_msg(ws)
        resp = json.loads(resp)
        print(resp)
        if resp["command"] == "getready":
            send_msg("ready", ws)
        while resp["command"] != "ending":
            send_msg("wait", ws)
            resp = await recv_msg(ws)
            resp = json.loads(resp)
            print(resp)
        print(resp)

def send_msg(msg, ws):
    try:
        ws.send(msg)
    except Exception:
        ...

async def recv_msg(ws):
    try:
        msg = ws.recv()
    except Exception:
        ...
    return msg

asyncio.run(tester())

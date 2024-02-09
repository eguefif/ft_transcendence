import asyncio
import signal
import logging

class serverPong:
    def __init__(self):
        print("init")    
        streams = []

    async def handleNewClient(self, reader, writer):
        data = await reader.read(100)
        message = data.decode()
        addr = writer.get_extra_info('peername')
        print(addr)

        self.sendMsg("endgame")
        writer.close()
        await writer.wait_closed()

    async def graceFullyExit(self, signal, frame):
        loggind.info("Gracefully exit server")
        for writer, _ in streams:
            logging.info("Close the connection")
            self.sendMsg("endgame", writer)
            writer.close()
            await writer.wait_closed()

    async def sendMsg(msg, writer):
        writer.write(bytes(msg))
        writer.write(b"\n")
        await writer.drain()

    async def run(self):
        server = await asyncio.start_server(
                self.handleNewClient, '0.0.0.0', 10000)

        addrs = ','.join(str(sock.getsockname()) for sock in server.sockets)
        print(f'Serving on {addrs}')

        async with server:
            await server.serve_forever()

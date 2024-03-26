const net = require('net');

class RedisServer {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.data = {};
    }

    run() {
        const server = net.createServer((socket) => {
            console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);

            socket.on('data', (data) => {
                const request = data.toString().trim().split(' ');
                const command = request[0];
                switch (command) {
                    case 'SET':
                        if (request.length === 3) {
                            const key = request[1];
                            const value = request[2];
                            this.data[key] = value;
                            try{
                            socket.write('OK\r\n');
                            }
                            catch(err){
                                console.log('errro while setting the key',err)
                            }
                        } else {
                            socket.write('Error: SET command requires exactly two arguments\r\n');
                        }
                        break;

                    case 'GET':
                        if (request.length === 2) {
                            const key = request[1];
                            const value = this.data[key] || 'nil';
                            socket.write(`${value}\r\n`);
                            console.log(value)
                        } else {
                            socket.write('Error: GET command requires exactly one argument\r\n');
                        }
                        break;

                    default:
                        socket.write('Error: Unsupported command\r\n');
                }
            });

            socket.on('end', () => {
                console.log(`Client disconnected: ${socket.remoteAddress}:${socket.remotePort}`);
            });
        });

        server.on('error', (err) => {
            console.error('Server error:', err);
        });

        server.listen(this.port, this.host, () => {
            console.log(`Redis server listening on ${this.host}:${this.port}`);
        });
    }
}

// Start the server
const server = new RedisServer('127.0.0.1', 6379);
server.run();

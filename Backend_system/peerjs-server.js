const { PeerServer } = require('peer');

const peerServer = PeerServer({
    port: 9000,
    path: '/peerjs',
    allow_discovery: true,
    debug: true
});

peerServer.on('connection', (client) => {
    console.log('🔍 Peer connected:', client.getId());
});

peerServer.on('disconnect', (client) => {
    console.log('🔍 Peer disconnected:', client.getId());
});

console.log('🔍 PeerJS Server running on port 9000');

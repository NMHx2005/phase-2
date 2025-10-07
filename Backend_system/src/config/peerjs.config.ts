import { ExpressPeerServer } from 'peer';

export const createPeerServer = (server: any): any => {
    try {
        console.log('🔍 Creating PeerJS server...');

        const peerServer = ExpressPeerServer(server, {
            path: '/peerjs',
            proxied: true,
            allow_discovery: true,
            debug: true
        });

        console.log('🔍 PeerJS server created successfully');

        // Handle peer server events
        peerServer.on('connection', (client: any) => {
            console.log('🔍 Peer connected:', client.getId());
        });

        peerServer.on('disconnect', (client: any) => {
            console.log('🔍 Peer disconnected:', client.getId());
        });

        // Add error handling
        peerServer.on('error', (error: any) => {
            console.error('🔍 PeerJS server error:', error);
        });

        return peerServer;
    } catch (error) {
        console.error('🔍 Failed to create PeerJS server:', error);
        // Return a mock server that doesn't crash the app
        return {
            on: () => { },
            close: () => { }
        };
    }
};

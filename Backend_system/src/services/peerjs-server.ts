import { Express } from 'express';
import { PeerServer } from 'peer';
import { Server } from 'http';

export class PeerJSServer {
    private peerServer: any;
    private httpServer: Server;

    constructor(app: Express, httpServer: Server) {
        this.httpServer = httpServer;
        this.initializePeerServer();
    }

    private initializePeerServer(): void {
        try {
            // Create PeerJS server
            this.peerServer = PeerServer({
                port: 9000,
                path: '/peerjs',
                allow_discovery: true,
                proxied: true
            });

            this.peerServer.on('connection', (client: any) => {
                console.log('🔍 PeerJS Server - Client connected:', client.id);
            });

            this.peerServer.on('disconnect', (client: any) => {
                console.log('🔍 PeerJS Server - Client disconnected:', client.id);
            });

            console.log('🔍 PeerJS Server - Started on port 9000');

        } catch (error) {
            console.error('🔍 PeerJS Server - Failed to start:', error);
        }
    }

    public getPeerServer(): any {
        return this.peerServer;
    }

    public stop(): void {
        if (this.peerServer) {
            this.peerServer.close();
            console.log('🔍 PeerJS Server - Stopped');
        }
    }
}

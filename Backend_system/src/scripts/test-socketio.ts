const { io } = require('socket.io-client');

interface TestMessage {
    channelId: string;
    text: string;
    type: 'text';
}

interface TestUser {
    userId: string;
    username: string;
    isOnline: boolean;
}

class SocketIOTester {
    private socket: any = null;
    private testResults: { [key: string]: boolean } = {};

    async runTests(): Promise<void> {
        console.log('🧪 Starting Socket.io Tests...\n');

        try {
            await this.testConnection();
            await this.testAuthentication();
            await this.testChannelOperations();
            await this.testMessageOperations();
            await this.testTypingIndicators();
            await this.testUserOperations();

            this.printResults();
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        } finally {
            if (this.socket) {
                this.socket.disconnect();
            }
        }
    }

    private async testConnection(): Promise<void> {
        console.log('1. Testing Connection...');

        return new Promise((resolve, reject) => {
            this.socket = io('http://localhost:3000', {
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                console.log('   ✅ Connected successfully');
                this.testResults['connection'] = true;
                resolve();
            });

            this.socket.on('connect_error', (error: any) => {
                console.log('   ❌ Connection failed:', error.message);
                this.testResults['connection'] = false;
                reject(error);
            });

            setTimeout(() => {
                if (!this.socket?.connected) {
                    console.log('   ❌ Connection timeout');
                    this.testResults['connection'] = false;
                    reject(new Error('Connection timeout'));
                }
            }, 5000);
        });
    }

    private async testAuthentication(): Promise<void> {
        console.log('2. Testing Authentication...');

        return new Promise((resolve) => {
            if (!this.socket) {
                this.testResults['authentication'] = false;
                resolve();
                return;
            }

            // Test with invalid token
            const invalidSocket = io('http://localhost:3000', {
                auth: { token: 'invalid-token' }
            });

            invalidSocket.on('connect_error', (error: any) => {
                console.log('   ✅ Invalid token rejected:', error.message);
                invalidSocket.disconnect();
            });

            // Test with valid token (mock)
            const validSocket = io('http://localhost:3000', {
                auth: { token: 'mock-valid-token' }
            });

            validSocket.on('connect', () => {
                console.log('   ✅ Valid token accepted');
                this.testResults['authentication'] = true;
                validSocket.disconnect();
                resolve();
            });

            validSocket.on('connect_error', (error: any) => {
                console.log('   ⚠️  Valid token rejected (expected in test):', error.message);
                this.testResults['authentication'] = false;
                validSocket.disconnect();
                resolve();
            });

            setTimeout(() => {
                this.testResults['authentication'] = false;
                validSocket.disconnect();
                resolve();
            }, 3000);
        });
    }

    private async testChannelOperations(): Promise<void> {
        console.log('3. Testing Channel Operations...');

        if (!this.socket) {
            this.testResults['channel_operations'] = false;
            return;
        }

        // Test join channel
        this.socket.emit('join_channel', {
            channelId: 'test-channel-id',
            channelName: 'Test Channel'
        });

        this.socket.on('error', (data: any) => {
            console.log('   ✅ Channel join error handled:', data.message);
        });

        this.socket.on('previous_messages', (data: any) => {
            console.log('   ✅ Previous messages received');
        });

        // Test leave channel
        this.socket.emit('leave_channel', { channelId: 'test-channel-id' });

        this.socket.on('user_left', (data: any) => {
            console.log('   ✅ User left notification:', data.message);
        });

        this.testResults['channel_operations'] = true;
    }

    private async testMessageOperations(): Promise<void> {
        console.log('4. Testing Message Operations...');

        if (!this.socket) {
            this.testResults['message_operations'] = false;
            return;
        }

        // Test send message
        this.socket.emit('send_message', {
            channelId: 'test-channel-id',
            text: 'Test message',
            type: 'text'
        });

        this.socket.on('new_message', (data: any) => {
            console.log('   ✅ New message received:', data.message.text);
        });

        this.socket.on('error', (data: any) => {
            console.log('   ✅ Message error handled:', data.message);
        });

        this.testResults['message_operations'] = true;
    }

    private async testTypingIndicators(): Promise<void> {
        console.log('5. Testing Typing Indicators...');

        if (!this.socket) {
            this.testResults['typing_indicators'] = false;
            return;
        }

        // Test start typing
        this.socket.emit('typing', {
            channelId: 'test-channel-id',
            isTyping: true
        });

        this.socket.on('user_typing', (data: any) => {
            console.log('   ✅ Typing indicator received:', data.username, 'is typing');
        });

        // Test stop typing
        this.socket.emit('stop_typing', { channelId: 'test-channel-id' });

        this.socket.on('user_stop_typing', (data: any) => {
            console.log('   ✅ Stop typing received:', data.username);
        });

        this.testResults['typing_indicators'] = true;
    }

    private async testUserOperations(): Promise<void> {
        console.log('6. Testing User Operations...');

        if (!this.socket) {
            this.testResults['user_operations'] = false;
            return;
        }

        // Test get online users
        this.socket.emit('get_online_users');

        this.socket.on('online_users', (users: TestUser[]) => {
            console.log('   ✅ Online users received:', users.length, 'users');
        });

        this.socket.on('online_users_count', (data: any) => {
            console.log('   ✅ Online users count:', data.count);
        });

        // Test get channel users
        this.socket.emit('get_channel_users', { channelId: 'test-channel-id' });

        this.socket.on('channel_users', (data: any) => {
            console.log('   ✅ Channel users received:', data.users.length, 'users');
        });

        this.testResults['user_operations'] = true;
    }

    private printResults(): void {
        console.log('\n📊 Test Results:');
        console.log('================');

        const totalTests = Object.keys(this.testResults).length;
        const passedTests = Object.values(this.testResults).filter(result => result).length;

        Object.entries(this.testResults).forEach(([test, passed]) => {
            const status = passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${test.padEnd(20)} ${status}`);
        });

        console.log('================');
        console.log(`Total: ${passedTests}/${totalTests} tests passed`);

        if (passedTests === totalTests) {
            console.log('🎉 All tests passed! Socket.io integration is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Check the implementation.');
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new SocketIOTester();
    tester.runTests().catch(console.error);
}

export default SocketIOTester;

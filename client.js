const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Welcome to the chat room\nType a message:');

rl.question("Enter your name: ", (name) => {
    console.log(`Welcome, ${name}! Type your message below:`);

    rl.on('line', (message) => {
        socket.emit('chat message', { sender: name, text: message }); // Now includes sender
    });
});

socket.on('chat message', (msg) => {
    console.log(`New message: ${msg}`);
});

socket.on('disconnect', () => {
    console.log('Disconnected');
    rl.close();
});

const { createServer } = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2/promise");

const server = createServer();
const ioserver = new Server(server);


const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Praveen@22",
    database: "chat_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


async function initDB() {
    const db = await pool.getConnection();
    await db.execute(`
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log("Database initialized!");
    db.release(); 
}

initDB();

ioserver.on("connection", async (socket) => {
    console.log("A user connected!");

    try {
        const db = await pool.getConnection(); 

        
        const [messages] = await db.query("SELECT sender, message FROM messages ORDER BY created_at ASC");
        socket.emit("chat history", messages);

        socket.on("chat message", async (msg) => {
            console.log(`Message: ${msg.text} from ${msg.sender}`);

            const insertQuery = "INSERT INTO messages (sender, message) VALUES (?, ?)";
            await db.execute(insertQuery, [msg.sender, msg.text]);

            socket.broadcast.emit("chat message", msg);
        });

        
        db.release();

    } catch (err) {
        console.error("Database error:", err.message);
    }

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server started at port 3000");
});

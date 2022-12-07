const express = require("express");
const app = express();
const PORT = 4000;
const http = require("http").Server(app);
const cors = require("cors");

const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const database = [];
const generateID = () => Math.random().toString(36).substring(2, 10);

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    // Listener for "register" event
    socket.on("register", (data) => {
        const { username, email, password } = data;
        let result = database.filter(
            (user) => user.email === email || user.username === username
        );
        if (result.length === 0) {
            database.push({
                id: generateID(),
                username,
                password,
                email,
                images: [],
            });
            return socket.emit("registerSuccess", "Account created successfully!");
        }
        socket.emit("registerError", "User already exists");
    });


    // Listener for "login" event
    socket.on("login", (data) => {
        const { username, password } = data;
        let result = database.filter(
            (user) => user.username === username && user.password === password
        );
        if (result.length !== 1) {
            return socket.emit("loginError", "Incorrect credentials");
        }
        socket.emit("loginSuccess", {
            message: "Login successfully",
            data: {
                _id: result[0].id,
                _email: result[0].email,
            },
        });
    })

    // Listener for "upload Photo" event
    socket.on("uploadPhoto", (data) => {
        const { id, email, photoURL } = data;
        let result = database.filter((user) => user.id === id);
        const newImage = {
            id: generateID(),
            image_url: photoURL,
            vote_count: 0,
            votedUsers: [],
            _ref: email,
        };
        result[0]?.images.unshift(newImage);
        socket.emit("uploadPhotoMessage", "Upload Successful!");
    });

    // Listener for "fetch all Photos" event
    socket.on("allPhotos", (data) => {
        let images = [];
        for (let i = 0; i < database.length; i++) {
            images = images.concat(database[i]?.images);
        }
        socket.emit("allPhotosMessage", {
            message: "Photos retrieved successfully",
            photos: images,
        });
    });

    // Listener for "fetch Photos by id" event
    socket.on("getMyPhotos", (id) => {
        let result = database.filter((user) => user.id === id);
        socket.emit("getMyPhotosMessage", {
            photos: result[0]?.images,
            username: result[0]?.username,
        });
    });

    // Listener for "Shared Photo" event
    socket.on("sharePhoto", (name) => {
        let result = database.filter((user) => user.username === name);
        socket.emit("sharePhotoMessage", { photos: result[0]?.images });
    });

    // Listener for "Photo upvote by id" event
    socket.on("photoUpvote", (data) => {
    const { userID, photoID } = data;
        let images = [];
        for (let i = 0; i < database.length; i++) {
            if (!(database[i].id === userID)) {
                images = images.concat(database[i]?.images);
            }
        }
        const item = images.filter((image) => image.id === photoID);
        if (item.length < 1) {
            return socket.emit("upvoteError", {
                error_message: "You cannot upvote your photos",
            });
        }
        const voters = item[0]?.votedUsers;
        const authenticateUpvote = voters.filter((voter) => voter === userID);
        if (!authenticateUpvote.length) {
            item[0].vote_count += 1;
            voters.push(userID);
            socket.emit("allPhotosMessage", {
                message: "Photos retrieved successfully",
                photos: images,
            });
            return socket.emit("upvoteSuccess", {
                message: "Upvote successful",
                item,
            });
        }

        socket.emit("upvoteError", {
            error_message: "Duplicate votes are not allowed",
        });
    });

    socket.on('disconnect', () => {
        socket.disconnect()
        console.log('🔥: A user disconnected');
    });
});

app.get("/api", (req, res) => {
    res.json({
        message: "Hello world",
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
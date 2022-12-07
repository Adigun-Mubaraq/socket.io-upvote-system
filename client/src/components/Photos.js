import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import PhotoContainer from "./PhotoContainer";

const initialPhotos = [
    {
        id: "1",
        image_url:
            "https://raw.githubusercontent.com/novuhq/blog/main/upvote-app-with-react-and-nodejs/server/images/dog1.jpg",
        vote_count: 0,
    },
    {
        id: "2",
        image_url:
            "https://raw.githubusercontent.com/novuhq/blog/main/upvote-app-with-react-and-nodejs/server/images/dog2.jpg",
        vote_count: 0,
    },
]

const Home = ({ socket }) => {
    const navigate = useNavigate();
    const [photos, setPhotos] = useState(initialPhotos);

    useEffect(() => {
        function authenticateUser() {
            const id = localStorage.getItem("_id");
            if (!id) {
                navigate("/");
            }
        }
        authenticateUser();
    }, [navigate]);

    useEffect(() => {
        socket.emit("allPhotos", "search");
        socket.on("allPhotosMessage", (data) => {
            setPhotos(data.photos);
        });
    }, [socket]);

    return (
        <div>
            <Nav />
            <PhotoContainer photos={photos} socket={socket} />
        </div>
    );
};

export default Home;
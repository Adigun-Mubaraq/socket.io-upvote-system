import React from "react";
//👇🏻 React Router configuration & routes
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Photos from "./components/Photos";
import Login from "./components/Login";
import Register from "./components/Register";
import UploadPhoto from "./components/UploadPhoto";
import MyPhotos from "./components/MyPhotos";
import SharePhoto from "./components/SharePhoto";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";

const App = () => {
  const socket = io("localhost:4000", { transports: ["websocket"] });

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login socket={socket} />} />
          <Route path='/register' element={<Register socket={socket} />} />
          <Route path='/photos' element={<Photos socket={socket} />} />
          <Route
            path='/photo/upload'
            element={<UploadPhoto socket={socket} />}
          />
          <Route path='/user/photos' element={<MyPhotos socket={socket} />} />
          <Route path='/share/:user' element={<SharePhoto socket={socket} />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
};

export default App;

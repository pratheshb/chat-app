const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socket(server);

let count = 0;

io.on('connect', (socket) => {
  console.log('New Client Connected');

  // setInterval(() => {
  //     socket.emit('timer')
  // }, 1000);

  // socket.emit('updatedCount' , count);

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room)
    socket.emit('message', generateMessage('Admin', 'Welcome!'));
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
    callback();
  });



  // socket.on('increment', () => {
  //     count++;
  //     io.emit('updateCount', count);
  // });
  socket.on('message', (message, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }
    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }

  });
  socket.on('shareLocation', (positionObj, callback) => {
    const user = getUser(socket.id);
    const location = `https://www.google.com/maps/?q=${positionObj.latitude},${positionObj.longitude}`;
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, location));
    callback();
  });


})



const PORT = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));


server.listen(PORT, () => {
  console.log('Running in PORT ' + PORT);
})

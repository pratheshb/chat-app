const users = [];

// add remove user getUser getUsers in room

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validating Data

    if(!username || !room) {
        return {
            'error': 'User name and room are required!'
        }
    }

    // validating existing user
    const exisitingUser = users.find(user => user.room === room && user.username === username)

    if(exisitingUser) {
        return {
            'error': 'User name is in use!'
        }
    }

    const user = {id, username, room};

    users.push(user);

    return {
        user
    }

}


const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

addUser({
    id: 22,
    username: 'Prathesh',
    room: 'AKM'
})

const getUser = id => users.find(user => user.id === id);

const getUsersInRoom = room => users.filter(user => user.room === room.trim().toLowerCase());


module.exports = { addUser, removeUser, getUser, getUsersInRoom }



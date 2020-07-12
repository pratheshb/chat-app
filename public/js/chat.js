const socket = io();

const connectionList = document.getElementById('connection-list');
const timer = document.getElementById('timer');

const newItem = (item) => {
    const li = document.createElement('li');
    li.innerHTML = item;
    return li;
}

// socket.on('connect', () => {
//     connectionList.appendChild(newItem('connected'));
    
// });

const addTrailingZero = (num) => {return num > 9 ? num : '0'+num;}

// socket.on('timer', () => {
//     const date = new Date();
//     timer.innerHTML = `${addTrailingZero(date.getHours() >= 12 ? date.getHours()-12 : date.getHours())} :
//         ${addTrailingZero(date.getMinutes())} :
//         ${addTrailingZero(date.getSeconds())}  
//         ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
// });
socket.on('greetUser', (msg) => {
    console.log(msg);
})
// socket.on('updateCount', (count) => {
//     document.querySelector('#count').innerHTML = count;
// });

// document.querySelector('#inc-count').addEventListener('click', () => {
//     console.log('clicked');
//     socket.emit('increment');
// });

// Elements

const $msgForm = document.querySelector('#msg-form');
const $msgFormInput = $msgForm.querySelector('input');
const $msgFormButton = $msgForm.querySelector('button');
const $shareLocationBtn = document.querySelector('#share-location');
const $message = document.querySelector('#messages');

// Templates

const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-template').innerHTML;
const $sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;


// query string

const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true });

// auto scroll functionality

const autoScroll = () => {
    // getting new message as HTML element
    const $newMessage = $message.lastElementChild;

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom) + parseInt(newMessageStyles.marginTop); 
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //visible Height
    const visibleHeight = $message.offsetHeight;

    //scrollHeight
    const containerHeight = $message.scrollHeight;

    //scroll bar position
    const offsetScroll = $message.scrollTop + visibleHeight +1;

    if(containerHeight - newMessageHeight <= offsetScroll){
        $message.scrollTop = $message.scrollHeight;
    }

    // $message.scrollTop = $message.scrollHeight;


    // console.log(visibleHeight, containerHeight, newMessageHeight, $message.scrollTop );

}

$msgForm.addEventListener('submit' , (event) => {
    event.preventDefault();
    $msgFormButton.setAttribute('disabled', 'disabled');
    const message = $msgFormInput.value;
    socket.emit('message', message, (error) => {
       if(error) {
           return  console.log(error);
       }

       console.log('Msg Deliverd');
    });
    $msgFormButton.removeAttribute('disabled');
    $msgFormInput.value = '';
    $msgFormInput.focus();
});

socket.on('message', (message) => {
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    }) // using mustache
    // const html = `<div>${msg}</div>` // using plain js
    $message.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render($sideBarTemplate, {
        room,
        users
    }) // using mustache
    // const html = `<div>${msg}</div>` // using plain js
    document.querySelector('#side-bar').innerHTML = html
})

socket.on('locationMessage', (location) => {
    const html = Mustache.render($locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    }) // using mustache
    $message.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('newUser', (greeting) => {
    console.log(greeting);
});


$shareLocationBtn.addEventListener('click', () => {
    if(!navigator.geolocation) {
       return alert('Your browser doesn\'t support geolocation');
    }
    $shareLocationBtn.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        const {latitude, longitude} = position.coords
        socket.emit('shareLocation', {latitude, longitude}, () => {
            console.log('Location Shared');
        });
        $shareLocationBtn.removeAttribute('disabled');
    })
})

socket.emit('join', {username, room}, async(error) => {
   if(error) {
    await swal('Oops...', error, 'error');
    location.href = '/';
    
   }
})




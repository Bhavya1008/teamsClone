const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()

const user = prompt('Enter your name')     //Taking users name


const myVideo = document.createElement('video')
myVideo.muted= true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    AddVideoStream(myVideo,stream)

    myPeer.on('call',call =>{                                //answering the call
        call.answer(stream)
        const video = document.createElement('video')

        call.on('stream',userVideoStream =>{
            AddVideoStream(video,userVideoStream)
        })
        
    })

    socket.on('user-connected',userId =>{                            //on user-connected call a function to send and recieve videos
        setTimeout(connectToNewUser , 1000 , userId, stream)
    })

})

socket.on('user-disconnected' , userId =>{                        //on peer diconnection remove peers video
    if(peers[userId]) peers[userId].close()
})

myPeer.on('open',id=>{
    socket.emit('join-room',ROOM_ID,id ,user)      //when new peer connected emit event to join room

})




function connectToNewUser(userId,stream){
    const call = myPeer.call(userId,stream)             //send our video to new user
    console.log(call)
    const video = document.createElement('video')
    call.on('stream', (userVideoStream)=> {                      //recieving video of new user and adding stream to it
        console.log(userVideoStream)
        AddVideoStream(video,userVideoStream)
    })
    call.on('close',()=>{
        video.remove()
    })

    peers[userId] = call
}

function AddVideoStream(video,stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    })
    videoGrid.append(video)
}

let text = document.querySelector('#chat_message')
let send = document.querySelector('#send')
let messages = document.querySelector('.messages')

send.addEventListener('click' , (e) =>{                     //on clicking send button emit message event
    if(text.value.length !== 0){
        socket.emit('message' , text.value)
        text.value = "";
    }
})

const invitebutton = document.querySelector('#inviteButton');

invitebutton.addEventListener('click' , (e) =>{                                 //room link on clicking invite button
    prompt(
        'Copy this link and send it to people you want to invite',window.location.href
    )
})

socket.on('createMessage' , (message , userName) =>{                     //On create message event adding the message to the room
    messages.innerHTML = messages.innerHTML + `<div class="message">
    <b> <i class="far fa-user-circle"></i> <span> ${
      userName === user ? "me" : userName
    }</span> </b>
    <span>${message}</span>
</div>`;
})




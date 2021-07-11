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
    myVideoStream = stream
    AddVideoStream(myVideo,stream)

    myPeer.on('call',call =>{
        peers[call.peer] = call

        call.answer(stream)                                 //answering the call when peer is connected
        const video = document.createElement('video')
                            
        call.on('stream',userVideoStream =>{
            AddVideoStream(video,userVideoStream)
        })  
        call.on('close',() =>{
            video.remove()
        })
       
        
    })



    socket.on('user-connected',userId =>{
        setTimeout(connectToNewUser , 1000 , userId, stream)       //on user-connected call a function to send and recieve videos
                                                               
    
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

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
})

const invitebutton = document.querySelector('#inviteButton');

invitebutton.addEventListener('click' , (e) =>{                                 //room link on clicking invite button
    prompt(
        'Copy this link and send it to people you want to invite',window.location.href
    )
})

const muteButton = document.querySelector("#muteButton")
const stopVideo = document.querySelector("#stopVideo")

muteButton.addEventListener("click", () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;  //if enabled disable the audio tracks by click
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;    
      html = `<i class="fas fa-microphone-slash"></i>`;         //change the icon to audio off 
      muteButton.classList.toggle("background__red");
      muteButton.innerHTML = html;
    } else {
      myVideoStream.getAudioTracks()[0].enabled = true;      //if disabled enable the audio track  by click
      html = `<i class="fas fa-microphone"></i>`;
      muteButton.classList.toggle("background__red");         //change the icon to audio on 
      muteButton.innerHTML = html;
    }
  });

stopVideo.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;          //if video enabled turn it off by click
      html = `<i class="fas fa-video-slash"></i>`;
      stopVideo.classList.toggle("background__red");
      stopVideo.innerHTML = html;
    } else {
      myVideoStream.getVideoTracks()[0].enabled = true;         // if video disabled turn it on by click
      html = `<i class="fas fa-video"></i>`;
      stopVideo.classList.toggle("background__red");
      stopVideo.innerHTML = html;
    }
  });


socket.on('createMessage' , (message , userName) =>{                     //On create message event adding the message to the room
    messages.innerHTML = messages.innerHTML + `<div class="message">
    <b> <i class="far fa-user-circle"></i> <span> ${
      userName === user ? "me" : userName
    }</span> </b>
    <span>${message}</span>
</div>`;
})




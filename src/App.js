import React, { useEffect, useRef, useState } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import ReactDOM from 'react-dom'
import { rtc, options } from './agora-config'
import "./App.css";

let remoteUsers = {}
function App() {
  const [joined, setJoined] = useState(false);
  const channelRef = useRef("");
  const remoteRef = useRef("");
  const leaveRef = useRef("");
  // const remoteStream = useRef([])
  //const [ remoteStream , setRemoteStream ] = useState([])

  async function handleSubmit(e) {
    try {
      if (channelRef.current.value === "") {
        return console.log("Please Enter Channel Name");
      }
      setJoined(true);

      rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" })
      rtc.client.on('user-published', handleUserPublished)
      rtc.client.on('user-unpublished', handleUserUnpublished)
      const uid = await rtc.client.join(options.appId, channelRef.current.value , options.token, null)
      
      // Create an audio track from the audio captured by a microphone
      //console.log('',uid)
      rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
      // Create a video track from the video captured by a camera
      rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack()

      rtc.localVideoTrack.play("local-stream")

      // Publish the local audio and video tracks to the channel
      await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
      console.log("publish success!");

      } catch (error) {
        console.error(error);
      }

      // rtc.client.on("user-published", async (user, mediaType) => {
      //   // Subscribe to a remote user
      //   const uid = user.uid
      //   await rtc.client.subscribe(user,mediaType)
      //   console.log(rtc.client,"subscribe success")
      //   console.log(user)

      //   if (mediaType === "video") {
      //     // Get `RemoteVideoTrack` in the `user` object.
      //     const remoteVideoTrack = user.videoTrack
      //     console.log(remoteVideoTrack)

      //     // Dynamically create a container in the form of a DIV element for playing the remote video track.

      //     const PlayerContainer = React.createElement("div", {
      //       id: user.uid,
      //       className: "stream",
      //     });
      //     ReactDOM.render(
      //       PlayerContainer,
      //       document.getElementById("remote-stream")
      //     );
            
      //     user.videoTrack.play(`${user.uid}`);
      //   }

      //   if (mediaType === "audio") {
      //     // Get `RemoteAudioTrack` in the `user` object.
      //     const remoteAudioTrack = user.audioTrack;
      //     // Play the audio track. Do not need to pass any DOM element
      //     remoteAudioTrack.play();
      //   }
      // })
      async function subscribe(user, mediaType) {
        // subscribe to a remote user
        await rtc.client.subscribe(user, mediaType);
        console.log("subscribe success");
        if (mediaType === 'video') {
        //   let appendEle = (
        //   <div id="${uid}" className="stream">
        //     <p className="player-name">remoteUser(${uid})</p>
        //     <div id="player-${uid}" className="player"></div>
        //   </div>
        // )
        //   //remoteStream.current.push(appendEle)
        //   setRemoteStream(...remoteStream,appendEle)
        //   user.videoTrack.play(`player-${uid}`)


        //! React element code
          // const PlayerContainer = React.createElement("div", {
          //   id: user.uid,
          //   className: "stream",
          // });
          // ReactDOM.render(PlayerContainer,document.getElementById("remote-stream"))
        //!  
          // setRemoteStream(...remoteStream, PlayerContainer)
          // // const appendEle = (
          // //   [...remoteStream]
          // // )
          //! Vanilla js code -> outbound react.js
          // Dynamically create a container in the form of a DIV element for playing the remote video track.
          const playerContainer = document.createElement("div");
          // Specify the ID of the DIV container. You can use the `uid` of the remote user.
          playerContainer.id = user.uid.toString();
          playerContainer.style.width = "480px";
          playerContainer.style.height = "320px";
          playerContainer.classList.add("remote-stream")
          const remoteDiv = document.getElementById('remote-stream')
          remoteDiv.append(playerContainer);

          user.videoTrack.play(`${user.uid}`);

        }
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
      }

      function handleUserPublished(user, mediaType) {
        const id = user.uid;
        remoteUsers[id] = user;
        subscribe(user, mediaType);
      }
      
      function handleUserUnpublished(user) {
        const id = user.uid;
        // Get the dynamically created DIV container
        console.log('--------------------------------------------------',id)
        const playerContainer = document.getElementById(id);
        console.log('--------------------------------------------------',playerContainer)
      // Destroy the container
        if(playerContainer){
          playerContainer.remove();
          delete remoteUsers[id]
        }
      }
    
    // rtc.client.on("user-unpublished", (user) => {
    //   // Get the dynamically created DIV container
    //   const playerContainer = document.getElementById(user.uid);
    //   console.log(playerContainer);
    //   // Destroy the container
    //   playerContainer.remove();
    // });
  }

  async function handleLeave() {
    try {
      const localContainer = document.getElementById("local-stream");

      rtc.localAudioTrack.close();
      rtc.localVideoTrack.close();

      setJoined(false);
      localContainer.textContent = "";

      // Traverse all remote users
      rtc.client.remoteUsers.forEach((user) => {
        // Destroy the dynamically created DIV container
        console.log(user)
        const playerContainer = document.getElementById(user.uid);
        playerContainer && playerContainer.remove();
      });

      // Leave the channel
      await rtc.client.leave();
    } catch (err) {
      console.error(err);
    }
  }
  //console.log(remoteStream.current)
  //console.log(remoteStream)
  return (
    <>
      <div className="container">
        <input
          type="text"
          ref={channelRef}
          id="channel"
          placeholder="Enter Channel name"
        />
        <input
          type="submit"
          value="Join"
          onClick={handleSubmit}
          disabled={joined ? true : false}
        />
        <input
          type="button"
          ref={leaveRef}
          value="Leave"
          onClick={handleLeave}
          disabled={joined ? false : true}
        />
      </div>
      {joined && (
        <>
          <div id="local-stream" className="stream local-stream"></div>
          <div
            id="remote-stream"
            ref={remoteRef}
            className="stream"
          ></div>
        </>
      )}
    </>
  );
}

export default App;
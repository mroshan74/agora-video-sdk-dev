import React, { useEffect, useRef, useState } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import ReactDOM from 'react-dom'
import { rtc, options } from './agora-config'
import "./App.css";

let remoteUsers = {}
function App() {
  const [joined, setJoined] = useState(false);
  const [share, setShare] = useState(false);
  const channelRef = useRef("");
  const remoteRef = useRef("");
  const leaveRef = useRef("");
  const screenShare = useRef();
  // const remoteStream = useRef([])
  //const [ remoteStream , setRemoteStream ] = useState([])
  useEffect(() => {
    

  })

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
        AgoraRTC.onCameraChanged = (info) => {
          console.log("camera changed!", info.state, info.device);
        }
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
          playerContainer.style.width = "320px";
          playerContainer.style.height = "240px";
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
        console.log('----------',id)
        const playerContainer = document.getElementById(id);
        console.log('----------',playerContainer)
      // Destroy the container
        if(playerContainer){
          playerContainer.remove();
          delete remoteUsers[id]
        }
      }
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

  const handleShareScreen = async() => {
    setShare(true)
    try{
      const screen = screenShare.current = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: "1080p_1",
      }, true)
      
      // await rtc.client.publish(screen.screenVideoTrack)
      // await rtc.client.publish(screen.screenAudioTrack)
      // You can also publish multiple tracks at once
      // await rtc.client.unpublish()
      await rtc.client.unpublish(rtc.localVideoTrack)
      await rtc.client.publish(screen)
      // somebody clicked on "Stop sharing"
      console.log(screen,'++++++++++[screen]----------')
      console.log(screen._mediaStreamTrack)
      // console.log('[*********SHARING TERMINATED***********]','onEnded')


      //! https://agoraio-community.github.io/AgoraWebSDK-NG/api/en/interfaces/ilocaltrack.html#on
      screen.on('track-ended', event_track_ended => {
        console.log(event_track_ended)
        handleStopScreenShare()
      })
      //! // Get a `MediaStreamTrack` object by custom capture
      // const logMedia = await navigator.mediaDevices.getDisplayMedia()
      // console.log(logMedia)

      // // Create a custom video track
      // const customScreenTrack = AgoraRTC.createCustomVideoTrack({
      //   mediaStreamTrack: logMedia,
      // })

      // if(customScreenTrack){
      //   await rtc.client.unpublish(rtc.localVideoTrack)
      //   await rtc.client.publish(customScreenTrack)
      // }

      // screen._mediaStreamTrack.addEventListener('onended', () => {
      //   console.log('[*********SHARING TERMINATED***********]','onEnded')
      // })
      
    }catch(err){
      console.log(err)
    }
  }
  

  const handleStopScreenShare = async() => {
    setShare(false)
    await rtc.client.unpublish(screenShare.current)
    screenShare.current = null
    await rtc.client.publish(rtc.localVideoTrack)
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
        {!share &&
        <input
          type="submit"
          value="Share screen"
          onClick={handleShareScreen}
          disabled={joined ? false : true}
        />
        }
        {share && 
        <input
          type="submit"
          value="Stop sharing screen"
          onClick={handleStopScreenShare}
          disabled={joined ? false : true}
        />
        }
        <input
          type="button"
          ref={leaveRef}
          value="Leave"
          onClick={handleLeave}
          disabled={joined ? false : true}
        />
      </div>
      {joined && (
        <div className='videoStream-container'>
          <div id="local-stream" className="stream local-stream"></div>
          <div
            id="remote-stream"
            ref={remoteRef}
            className="rem-stream"
          ></div>
        </div>
      )}
    </>
  );
}

export default App;
import React, { useEffect, useRef, useState } from 'react'
import AgoraRTC from 'agora-rtc-sdk'

const appID = '4b88997c353f432fbad18f5305e426a8'

const App = () => {
  const [rtc, setRtc] = useState({
    client: null,
    joined: false,
    published: false,
    localStream: null,
    remoteStreams: [],
    params: {}
  })

  const [option, setOption] = useState({
    appID,
    channel: "demoChannel", // dynamic unique
    uid: "random",  // dynamic unique
    token: "Your token" // optional --> create in the server
  })
  console.log(option.appID)
  useEffect(() => {
    // rtc.localStream = AgoraRTC.createStream({
    //   streamID: option.uid,
    //   audio: true,
    //   video: true,
    //   screen: false,
    // });

    // // Initialize the local stream
    // rtc.localStream.init(function () {
    //   console.log("init local stream success");
    //   // play stream with html element id "local_stream"
    //   rtc.localStream.play("local_stream");
    // }, function (err) {
    //   console.error("init local stream failed ", err);
    // });

    // // Publish the local stream
    setRtc({
      ...rtc,
      client: AgoraRTC.createClient({mode: "rtc", codec: "h264"}),
      localStream :  AgoraRTC.createStream({
        streamID: option.uid,
        audio: true,
        video: true,
        screen: false,
      })
    })
  },[])

  

  if(rtc.localStream){
     // Initialize the local stream
    rtc.localStream.init(function () {
      console.log("init local stream success");
      // play stream with html element id "local_stream"
      rtc.localStream.play("local_stream");
    }, function (err) {
      console.error("init local stream failed ", err);
    });

    // Publish the local stream
    console.log('[rtc.client]', rtc.client)
    rtc.client.publish(rtc.localStream, function (err) {
      console.log("publish failed");
      console.error(err);
    })
  }
  
  return(
    <div>
      <h2>Code goes here...</h2>
      <div id='local_stream'></div>
    </div>
  )
}

export default App

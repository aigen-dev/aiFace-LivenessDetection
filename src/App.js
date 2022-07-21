import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Webcam from "react-webcam";
import axios from "axios";

const App = () => {
  const webcamRef = useRef(null);
  const videoConstraints = {
    width: 1920,
    heiht: 1080,
    facingMode: "user",
  };

  const API_KEY = "";
  const API_ENDPOINT ="";

  const [isStarted, setIsStarted] = useState(false);
  const [action, setAction] = useState("null");
  const [actionStatus, setActionStatus] = useState("Wait");
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [limitRequest, setLimitRequest] = useState(0);
  const [requestID, setRequestID] = useState(null);

  useEffect(() => {
    if (isStarted) {
      if (limitRequest > 0) {
        const imageSrc = webcamRef.current.getScreenshot();
        Process(imageSrc).then((response) => {
          if (response.data.result === "Yes") {
            setSuccessCount((prevCount) => prevCount + 1);
            processActionSuccess(response.data);
          } else {
            setLimitRequest((prevCount) => prevCount - 1);
          }
        });
      } else {
        //if the result fail limit exceeds
        reSetAction().then((response) => {
          setSuccessCount(0);
          setFailCount((prevCount) => prevCount + 1);
          processActionFail(response.data);
        });
      }
    }
  }, [limitRequest]); // eslint-disable-line react-hooks/exhaustive-deps

  //Step 1 initialize action
  const start = () => {
    InitializeAction().then((response) => {
      setSuccessCount(0);
      setFailCount(0);
      resetLimitRequest();
      setAction(actions[response.data.next_choice]);
      setRequestID(response.data.request_id);
      setActionStatus("Processing");
      setIsStarted(true);
    });
  };

  const processActionFail = (response) => {
    if (response.status === "uncompleted") {
      //reset action  3 times
      setIsStarted(false);
      setActionStatus("Action uncompleted");
      console.log("billing");
    } else {
      setAction(actions[response.next_choice]); // Next action
      resetLimitRequest();
    }
  };

  const processActionSuccess = (response) => {
    if (response.status === "completed") {
      //success action  3 times
      setIsStarted(false);
      setActionStatus("Action completed");
      console.log("billing");
    } else {
      setAction(actions[response.next_choice]); // Next action
      resetLimitRequest();
    }
  };

  const resetLimitRequest = () => {
    setLimitRequest(20);
  };

  //API Service
  const InitializeAction = () => {
    const headers = {
      "X-AIGEN-KEY": API_KEY,
    };

    return axios.get(API_ENDPOINT, {
      headers,
    });
  };

  const Process = (image) => {
    const headers = {
      "X-AIGEN-KEY": API_KEY,
    };

    const payload = {
      request_id: requestID,
      image: image,
    };

    return axios.post(API_ENDPOINT, payload, {
      headers,
    });
  };

  const reSetAction = () => {
    const headers = {
      "X-AIGEN-KEY": API_KEY,
    };

    const payload = {
      request_id: requestID,
      restart_id: true,
    };

    return axios.post(API_ENDPOINT, payload, {
      headers,
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Liveness Detection Demo</p>
        <div style={{ width: "70%" }}>
          <Webcam
            audio={false}
            screenshotFormat="image/png"
            width={"100%"}
            videoConstraints={videoConstraints}
            forceScreenshotSourceSize={true}
            className="webcam"
            ref={webcamRef}
          />
        </div>
        {isStarted ? (
          <h3>Action : {action}</h3>
        ) : (
          <button style={{ margin: "20px", padding: "10px" }} onClick={start}>
            Start
          </button>
        )}
        <div>
          Status : {actionStatus} | Sucess : {successCount} | Fail :{failCount}
        </div>
      </header>
    </div>
  );
};

export default App;

//ActionList

const actions = {
  Turn_left: "Turn Left",
  Turn_right: "Turn Right",
  Look_up: "Look Up",
  Look_down: "Look Down",
  Open_mouth: "Open Mouth",
  Smile: "Smile",
  Like_right_hand: "Thumbs up using your right hand",
  Like_left_hand: "Thumbs up using your left hand",
  I_love_you_right_hand: "Show I love you by your right hand",
  I_love_you_left_hand: "Show I love you by your left hand",
  Ok_right_hand: "Show Okay sign with your right hand",
  Ok_left_hand: "Show Okay sign with your left hand",
  Handful_right_hand: "Show your right fist",
  Handful_left_hand: "Show your left fist",
  One_right_hand: "Show one finger with your right hand ",
  One_left_hand: "Show one finger with your left hand",
  Two_right_hand: "Show two fingers with your right hand",
  Two_left_hand: "Show two fingers with your left hand",
  Three_right_hand: "Show three fingers with your right hand",
  Three_left_hand: "Show three fingers with your left hand",
  Four_right_hand: "Show four fingers with your right hand",
  Four_left_hand: "Show four fingers with your left hand",
  Forehand_right_hand: "Show the front of your right hand",
  Forehand_left_hand: "Show the front of your left hand",
  Backhand_right_hand: "Show the back of your right hand",
  Backhand_left_hand: "Show the back of your left hand",
  Victory_right_hand: "Show victory sign with your right hand",
  Victory_left_hand: "Show victory sign with your left hand",
  Right_hand: "Lift Up your right hand",
  Left_hand: "Lift Up your left hand",
};

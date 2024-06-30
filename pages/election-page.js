import React, { useState, useEffect, useContext } from "react";
import { useRouter } from 'next/router';
import { VotingContext } from "../context/Voter";
import Style from '../styles/index.module.css';
import Button from '../components/Button/Button';
import Admincard from '../components/admincard/admincard';

const ElectionPage = () => {
  const { setElectionTimer, announceWinner, winner, candidateArray, getNewCandidate, getElectionEndTime } = useContext(VotingContext);
  const [electionEndTime, setElectionEndTime] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    getNewCandidate();
  }, []);

  const handleSetElectionTimer = async () => {
    if (!electionEndTime) {
      setError("Election end time is required");
      return;
    }

    try {
      await setElectionTimer(electionEndTime);
      setError("");
    } catch (err) {
      console.error("Error setting election timer:", err);
      setError("An error occurred. Please try again.");
    }
  };

  const handleAnnounceWinner = async () => {
    try {
      await announceWinner();
      setError("");
    } catch (err) {
      console.error("Error announcing winner:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className={Style.election}>
      <div className={Style.election__container}>
        <div className={Style.election__container__box}>
          <div className={Style.input__container}>
            <div className={Style.winner_info3}>
            <h1>Election Settings</h1>
            </div>
            <div className={Style.winner_info3}>
              <label>Set Election End Time</label>
              <input
                type="datetime-local"
                value={electionEndTime}
                onChange={(e) => setElectionEndTime(e.target.value)}
              />
            </div>
            <div className={Style.winner_info3}>
              <p>
                Election end time: <span>{electionEndTime}</span>
              </p>
              <div className={Style.Button}>
                <Button btnName="Set Election Timer" handleClick={handleSetElectionTimer} />
              </div>
            </div>
          </div>

        </div>
        

        <Admincard candidateArray={candidateArray}/>
      </div>
    </div>
  );
};

export default ElectionPage;

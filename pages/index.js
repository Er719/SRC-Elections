import React, { useContext, useEffect, useState } from "react";
import Countdown from 'react-countdown';
import { VotingContext } from "../context/Voter";
import Style from '../styles/index.module.css';
import Card from '../components/card/card';
import Button from '../components/Button/Button';

const Index = () => {
  const {
    candidateArray,
    giveVote,
    checkIfWalletIsConnected,
    announceWinner,
    winner,
    currentAccount,
    getAllVoterData,
    getElectionEndTime,
  } = useContext(VotingContext);
  
  const [error, setError] = useState("");
  const [electionEndTime, setElectionEndTime] = useState(null);
  const [showWinnerCard, setShowWinnerCard] = useState(false);
  const [winnerCandidate, setWinnerCandidate] = useState(null);

  useEffect(() => {
    checkIfWalletIsConnected();
    getAllVoterData();
    fetchElectionEndTime();
  }, []);

  useEffect(() => {
    if (winner) {
      // Find the candidate with the highest votes
      const highestVoteCandidate = candidateArray.reduce((prev, current) => {
        return (current.voteCount > prev.voteCount) ? current : prev;
      });

      setWinnerCandidate(highestVoteCandidate);
      setShowWinnerCard(true);
    }
  }, [winner, candidateArray]);

  const fetchElectionEndTime = async () => {
    try {
      const endTime = await getElectionEndTime();
      setElectionEndTime(endTime);
    } catch (error) {
      console.error("Error fetching election end time:", error);
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
    <div className={Style.home}>
      {currentAccount && (
        <div className={Style.winner}>
          <div className={Style.winner_info2}>
            <div className={Style.candidate_list}>
              <p>
                SRC President Election 2024
              </p>
            </div>
            <div className={Style.input__container}>
              <div className={Style.Button}>
                <Button btnName="Show Results" handleClick={handleAnnounceWinner} />
              </div>
            </div>
          </div>
          <div className={Style.winner_message}>
            <small>
              {electionEndTime ? (
                <Countdown date={(electionEndTime * 1000) - Date.now()} /> // Convert endTime to milliseconds for Countdown component
              ) : (
                "Election timer not set"
              )}
            </small>
          </div>
        </div>
      )}

      {winner && (
        <div className={Style.winner_info2}>
          <h2>Congratulations to the Winner of the 2024 SRC President Election</h2>
        </div>
      )}

      {error && <div className={Style.error}>{error}</div>}

      {showWinnerCard && winnerCandidate && (
        <Card candidateArray={[winnerCandidate]} giveVote={giveVote} />
      )}

      {!showWinnerCard && (
        <Card candidateArray={candidateArray} giveVote={giveVote} />
      )}

    </div>
  );
};

export default Index;

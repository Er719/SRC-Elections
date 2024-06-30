import React, { useState, useContext, useEffect } from "react";
import { VotingContext } from "../context/Voter";

const Election = () => {
  const { currentAccount, setElectionTimer, announceWinner } = useContext(VotingContext);
  const [timeInSeconds, setTimeInSeconds] = useState('');
  const [winner, setWinner] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const votingOrganizer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
      if (currentAccount.toLowerCase() === votingOrganizer.toLowerCase()) {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, [currentAccount]);

  const handleSetTimer = async () => {
    await setElectionTimer(parseInt(timeInSeconds));
  };

  const handleAnnounceWinner = async () => {
    const winnerAddress = await announceWinner();
    setWinner(winnerAddress);
  };

  if (!isAdmin) {
    return <p>Access denied. Only the admin can access this page.</p>;
  }

  return (
    <div>
      <h1>Election Panel</h1>
      <div>
        <input
          type="number"
          value={timeInSeconds}
          onChange={(e) => setTimeInSeconds(e.target.value)}
          placeholder="Set election timer in seconds"
        />
        <button onClick={handleSetTimer}>Set Timer</button>
      </div>
      <div>
        <button onClick={handleAnnounceWinner}>Announce Winner</button>
      </div>
      {winner && <p>The winner is: {winner}</p>}
    </div>
  );
};

export default Election;

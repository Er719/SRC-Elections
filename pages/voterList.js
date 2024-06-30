import React, { useState, useEffect, useContext } from "react";

// INTERNAL IMPORT
import VoterCard from '../components/voterCard/voterCard';
import Style from '../styles/voterList.module.css';
import { VotingContext } from '../context/Voter';

const VoterList = () => {
  const { getAllVoterData, voterArray } = useContext(VotingContext);

  useEffect(() => {
    getAllVoterData();
  }, []);

  return (
    <div className={Style.voterList}>
        <VoterCard voterArray={voterArray} />
    </div>
  );
};

export default VoterList;

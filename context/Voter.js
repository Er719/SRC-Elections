import React, { useState, useEffect, createContext } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import { useRouter } from "next/router";

import { VotingAddress, VotingAddressABI } from "./constants";

const client = ipfsHttpClient('https://ipfs-infura.io:5001/api/v0');

const fetchContract = (signerOrProvider) => {
  return new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);
};

export const VotingContext = createContext();

export const VotingProvider = ({ children }) => {
  const router = useRouter();
  const [currentAccount, setCurrentAccount] = useState([]);
  const [candidateArray, setCandidateArray] = useState([]);
  const [voterArray, setVoterArray] = useState([]);
  const [error, setError] = useState('');
  const [winner, setWinner] = useState(null);
  const [electionEndTime, setElectionEndTime] = useState(null);

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return setError("Please install Metamask");

    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (accounts.length) {
      setCurrentAccount(accounts[0]);
      getAllVoterData();
      getNewCandidate();
    } else {
      setError("Please install Metamask & Reconnect");
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return setError("Please install Metamask");

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setCurrentAccount(accounts[0]);
    getAllVoterData();
    getNewCandidate();
  };

  const uploadToIPFS = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
          headers: {
            pinata_api_key: `59f1f2646bb6d36da7ab`,
            pinata_secret_api_key: `63c30817cb35c5315feebbc4c2981955aa4255dace78fe78a519df2063b2a4ee`,
            "Content-Type": "multipart/form-data",
          },
        });

        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        return ImgHash;
      } catch (error) {
        console.log("Unable to upload image to Pinata");
      }
    }
  };

  const uploadToIPFSCandidate = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
          headers: {
            pinata_api_key: `59f1f2646bb6d36da7ab`,
            pinata_secret_api_key: `63c30817cb35c5315feebbc4c2981955aa4255dace78fe78a519df2063b2a4ee`,
            "Content-Type": "multipart/form-data",
          },
        });

        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        return ImgHash;
      } catch (error) {
        console.log("Unable to upload image to Pinata");
      }
    }
  };

  const createVoter = async (formInput, fileUrl) => {
    try {
      const { name, address, faculty } = formInput;

      if (!name || !address || !faculty) throw new Error("Input data is missing");

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const data = JSON.stringify({ name, address, faculty, image: fileUrl });

      const response = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", data, {
        headers: {
          pinata_api_key: `59f1f2646bb6d36da7ab`,
          pinata_secret_api_key: `63c30817cb35c5315feebbc4c2981955aa4255dace78fe78a519df2063b2a4ee`,
          "Content-Type": "application/json",
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      const gasLimit = 500000;

      const voterTx = await contract.voterRight(address, name, url, fileUrl);
      await voterTx.wait();

      router.push("/voterList");
    } catch (error) {
      console.error("Error creating voter:", error);
    }
  };

  const getAllVoterData = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const voterListData = await contract.getVoterList();
      const voters = await Promise.all(
        voterListData.map(async (address) => {
          return await contract.getVoterdata(address);
        })
      );

      setVoterArray(voters);
    } catch (error) {
      setError("Something went wrong fetching data");
    }
  };

  const giveVote = async (id) => {
    try {
      const voterAddress = id.address;
      const voterId = id.id;
  
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
  
      const tx = await contract.vote(voterAddress, voterId);
      await tx.wait();
  
      console.log("Vote successfully casted:", tx);
    } catch (error) {
      console.error("Error casting vote:", error);
    }
  };

  const setCandidate = async (candidateForm, fileUrl, router) => {
    try {
      const { name, address, profile } = candidateForm;

      if (!name || !address || !profile) throw new Error("Input data is missing");

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const data = JSON.stringify({ name, address, image: fileUrl, profile });

      const response = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", data, {
        headers: {
          pinata_api_key: `59f1f2646bb6d36da7ab`,
          pinata_secret_api_key: `63c30817cb35c5315feebbc4c2981955aa4255dace78fe78a519df2063b2a4ee`,
          "Content-Type": "application/json",
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      const candidateTx = await contract.setCandidate(address, profile, name, fileUrl, url);
      await candidateTx.wait();

      router.push("/");
    } catch (error) {
      console.error("Error creating candidate:", error);
    }
  };

  const getNewCandidate = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const allCandidates = await contract.getCandidate();

      const candidates = await Promise.all(
        allCandidates.map(async (address) => {
          return await contract.getCandidateData(address);
        })
      );

      setCandidateArray(candidates);
    } catch (error) {
      setError("Something went wrong fetching candidate data");
    }
  };

  const setElectionTimer = async (timeInSeconds) => {
    try {
      const unixTimestamp = Math.floor(new Date(timeInSeconds).getTime() / 1000);
  
      // Connect to the user's wallet
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
  
      // Fetch the contract instance
      const contract = fetchContract(signer);
  
      // Convert Unix timestamp to BigNumber
      const timeBigNumber = ethers.BigNumber.from(unixTimestamp);
  
      // Call the contract function to set the election timer
      const tx = await contract.setElectionTimer(timeBigNumber);
      await tx.wait();
  
      // Update electionEndTime state with the calculated end time
      const endTimeString = new Date(timeInSeconds).toISOString();
      setElectionEndTime(endTimeString);
  
      // Log electionEndTime to console for verification
      console.log("Election timer set successfully. Election End Time:", endTimeString);
    } catch (error) {
      console.error("Error setting election timer:", error);
    }
  };

  const getElectionEndTime = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const endTime = await contract.electionEndTime();
      console.log("Fetched election end time from contract (in seconds):", endTime.toString());
      return endTime.toNumber(); // Ensure it's a number
    } catch (error) {
      console.error("Error fetching election end time:", error);
    }
  };
  
  const announceWinner = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
  
      // Log electionEndTime before calling the contract function
      const currentEndTime = await contract.getElectionEndTime();
      console.log("Current electionEndTime:", currentEndTime.toNumber());
  
      const winnerAddress = await contract.announceWinner();
      setWinner(winnerAddress);
    } catch (error) {
      console.error("Error announcing winner:", error);
    }
  };  

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <VotingContext.Provider
      value={{
        checkIfWalletIsConnected,
        connectWallet,
        uploadToIPFS,
        createVoter,
        getAllVoterData,
        giveVote,
        setCandidate,
        getNewCandidate,
        error,
        voterArray,
        currentAccount,
        candidateArray,
        uploadToIPFSCandidate,
        setElectionTimer,
        announceWinner,
        winner,
        electionEndTime,
        getElectionEndTime
       }}
       > 
        {children} 
        </VotingContext.Provider>
        );
};

const Voter = () => {
  return (
    <div>Voter</div>
  )
}

export default Voter;

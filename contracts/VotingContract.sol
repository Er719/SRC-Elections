//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Create {
    using Counters for Counters.Counter;

    Counters.Counter public _voterId;
    Counters.Counter public _candidateId;

    address public votingOrganizer;
    uint256 public electionEndTime;

    // CANDIDATE FOR VOTING
    struct Candidate {
        uint256 candidateId;
        string profile;
        string name;
        string image;
        uint256 voteCount;
        address _address;
        string ipfs;
    }

    event CandidateCreate (
        uint256 indexed candidateId,
        string profile,
        string name,
        string image,
        uint256 voteCount,
        address _address,
        string ipfs
    );

    address[] public candidateAddress;
    mapping(address => Candidate) public candidates;

    // VOTER DATA
    address[] public votedVoters;
    address[] public votersAddress;
    mapping(address => Voter) public voters;

    struct Voter {
        uint256 voter_voterId;
        string voter_name;
        string voter_image;
        address voter_address;
        uint256 voter_allowed;
        bool voter_voted;
        uint256 voter_vote;
        string voter_ipfs;
    }

    event VoterCreated (
        uint256 indexed voter_voterId,
        string voter_name,
        string voter_image,
        address voter_address,
        uint256 voter_allowed,
        bool voter_voted,
        uint256 voter_vote,
        string voter_ipfs
    );

    constructor (){
        votingOrganizer = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == votingOrganizer, "Only organizer can call this function");
        _;
    }

    function setCandidate(address _address, string memory _profile, string memory _name, string memory _image, string memory _ipfs) public onlyAdmin {
        _candidateId.increment();
        uint256 idNumber = _candidateId.current();

        Candidate storage candidate = candidates[_address];
        candidate.profile = _profile;
        candidate.name = _name;
        candidate.candidateId = idNumber;
        candidate.image = _image;
        candidate.voteCount = 0;
        candidate._address = _address;
        candidate.ipfs = _ipfs;

        candidateAddress.push(_address);

        emit CandidateCreate(idNumber, _profile, _name, _image, candidate.voteCount, _address, _ipfs);
    }

    function getCandidate() public view returns (address[] memory) {
        return candidateAddress;
    }

    function getCandidateLength() public view returns (uint256) {
        return candidateAddress.length;
    }

    function getCandidateData(address _address) public view returns (string memory, string memory, uint256, string memory, uint256, string memory, address) {
        Candidate memory candidate = candidates[_address];
        return (candidate.profile, candidate.name, candidate.candidateId, candidate.image, candidate.voteCount, candidate.ipfs, candidate._address);
    }

    function voterRight(address _address, string memory _name, string memory _image, string memory _ipfs) public onlyAdmin {
        _voterId.increment();
        uint256 idNumber = _voterId.current();

        Voter storage voter = voters[_address];
        require(voter.voter_allowed == 0, "Voter already registered");

        voter.voter_allowed = 1;
        voter.voter_name = _name;
        voter.voter_image = _image;
        voter.voter_address = _address;
        voter.voter_voterId = idNumber;
        voter.voter_vote = 1000;
        voter.voter_voted = false;
        voter.voter_ipfs = _ipfs;

        votersAddress.push(_address);

        emit VoterCreated(idNumber, _name, _image, _address, voter.voter_allowed, voter.voter_voted, voter.voter_vote, _ipfs);
    }

    function vote(address _candidateAddress, uint256 _candidateVoteId) external {
        Voter storage voter = voters[msg.sender];
        require(!voter.voter_voted, "You have already voted");
        require(voter.voter_allowed != 0, "You have no right to vote");
        require(block.timestamp < electionEndTime, "Election has ended");

        voter.voter_voted = true;
        voter.voter_vote = _candidateVoteId;
        votedVoters.push(msg.sender);
        candidates[_candidateAddress].voteCount += voter.voter_allowed;
    }

    function getVoterLength() public view returns (uint256) {
        return votersAddress.length;
    }

    function getVoterdata(address _address) public view returns (uint256, string memory, string memory, address, string memory, uint256, bool) {
        Voter memory voter = voters[_address];
        return (voter.voter_voterId, voter.voter_name, voter.voter_image, voter.voter_address, voter.voter_ipfs, voter.voter_allowed, voter.voter_voted);
    }

    function getVotedVoterList() public view returns (address[] memory) {
        return votedVoters;
    }

    function getVoterList() public view returns (address[] memory) {
        return votersAddress;
    }

    function setElectionTimer(uint256 _timeInSeconds) external onlyAdmin {
        require(_timeInSeconds > 0, "Time must be greater than zero");

        // Calculate the new election end time
        uint256 newEndTime = block.timestamp + _timeInSeconds;

        // Ensure that the new end time is in the future
        require(newEndTime > block.timestamp, "Invalid election end time");

        electionEndTime = newEndTime;
    }

    // Function to fetch election end time
    function getElectionEndTime() external view returns (uint256) {
        return electionEndTime;
    }

    function announceWinner() external view returns (address) {
        // require(block.timestamp >= electionEndTime, "Election is still ongoing");

        address winner;
        uint256 highestVotes = 0;

        for (uint256 i = 0; i < candidateAddress.length; i++) {
            address candidateAddr = candidateAddress[i];
            if (candidates[candidateAddr].voteCount > highestVotes) {
                highestVotes = candidates[candidateAddr].voteCount;
                winner = candidateAddr;
            }
        }

        return winner;
    }
}

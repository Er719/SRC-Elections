import React, { useState, useCallback, useEffect, useContext } from "react";
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// INTERNAL IMPORT
import { VotingContext } from "../context/Voter";
import Style from '../styles/allowedVoter.module.css';
import images from '../assets';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';

const projectId = '8bfd01924df54c39b688c8f426bd5877'; // Your Infura Project ID
const projectSecret = 'Y87NJQ111vPYm1mQTjRcpUgw41mWI1BcFnXuhVrLXDzSS66gWdM3lA'; // Your Infura Project Secret
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = ipfsHttpClient({
  host: 'infura-ipfs.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

const candidateRegistration = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    address: "",
    profile: "",
  });
  const [error, setError] = useState(null);

  const router = useRouter();
  const { setCandidate, uploadToIPFSCandidate, candidateArray, getNewCandidate } = useContext(VotingContext);

  //-----------CANDIDATE IMAGE DROP
  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      const url = await uploadToIPFSCandidate(acceptedFiles[0]);
      setFileUrl(url);
    } catch (err) {
      console.error("Error uploading file to IPFS:", err);
      setError("Error uploading file. Please try again.");
    }
  }, [uploadToIPFSCandidate]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    maxSize: 5000000,
  });

  // Handle candidate creation
  const handleSetCandidate = async () => {
    console.log("Candidate Form Data: ", candidateForm);
    console.log("File URL: ", fileUrl);

    if (!candidateForm.name || !candidateForm.address || !candidateForm.profile || !fileUrl) {
      setError("All fields are required. Please fill out the form completely.");
      return;
    }

    try {
      await setCandidate(candidateForm, fileUrl);
      await getNewCandidate();  // Ensure this function is called correctly and safely
      router.push("/");
    } catch (err) {
      console.error("Error setting candidate:", err);
      if (err.code === 4001) {
        setError("Transaction was denied. Please approve the transaction in MetaMask.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  useEffect(() =>{
    getNewCandidate();
  }, []);

  return (
    <div className={Style.createVoter}>
      <div>
        {fileUrl && (
          <div className={Style.voterInfo}>
            <img src={fileUrl} alt="Voter Image" />
            <div className={Style.voterInfo_paragraph}>
              <p>
                Name: <span>{candidateForm.name}</span>
              </p>
              <p>
                Address: <span>{candidateForm.address}</span>
              </p>
              <p>
                Profile: <span>{candidateForm.profile}</span>
              </p>
            </div>
          </div>
        )}

        {!fileUrl && (
          <div className={Style.sideInfo}>
            <div className={Style.sideInfo_box}>
              <h4>Create candidate for Voting</h4>
              <p>Blockchain voting organization</p>
              <p className={Style.sideInfo_para}>Contract Candidate</p>

              <div className={Style.card}>
                {candidateArray.map((el, i) => (
                  <div key={i + 1} className={Style.card_box}>
                    <div className={Style.image}>
                      <img src={el[3]} alt="Profile photo" />
                    </div>

                    <div className={Style.card_info}>
                      <p>{el[1]} #{el[2].toNumber()}</p>
                      <p>{el[0]}</p>
                      <p>Address: {el[6].slice(0,10)}..</p>
                    </div>
                  </div>
                ))} 
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={Style.voter}>
        <div className={Style.voter__container}>
          <h1>Create New Candidate</h1>
          <div className={Style.voter__container__box}>
            <div className={Style.voter__container__box__div}>
              <div {...getRootProps()}>
                <input {...getInputProps()} />

                <div className={Style.voter__container__box__div__info}>
                  <p>Upload File: JPG, PNG, GIF, WEBM Max 10MB</p>

                  <div className={Style.voter__container__box__div__image}>
                    <Image
                      src={images.upload}
                      width={150}
                      height={150}
                      objectFit="contain"
                      alt="File upload"
                    />
                  </div>
                  <p>Drag & Drop File</p>
                  <p>or Browse Media on Your Device</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={Style.input__container}>
          <Input
            inputType="text"
            title="Name"
            placeholder="Candidate Name"
            handleClick={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
          />
          <Input
            inputType="text"
            title="Address"
            placeholder="Candidate Address"
            handleClick={(e) => setCandidateForm({ ...candidateForm, address: e.target.value })}
          />
          <Input
            inputType="text"
            title="Profile"
            placeholder="Candidate Profile"
            handleClick={(e) => setCandidateForm({ ...candidateForm, profile: e.target.value })}
          />

          <div className={Style.Button}>
            <Button btnName="Authorize Candidate" handleClick={handleSetCandidate} />
          </div>
        </div>
      </div>
      {error && <div className={Style.error}>{error}</div>}
      <div className={Style.createdVoter}>
        <div className={Style.createdVoter__info}>
        <Image src={images.notice} alt="user Profile" />
          <p>Notice for Admins</p>
          <p>Please login to the admin wallet to create new candidates</p>
        </div>
      </div>
    </div>
  );
};

export default candidateRegistration;

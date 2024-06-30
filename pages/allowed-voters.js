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

const allowedVoters = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, setFormInput] = useState({
    name: "",
    address: "",
    profile: "",
  });

  const router = useRouter();
  const { uploadToIPFS, createVoter, voterArray } = useContext(VotingContext);

  //-----------VOTERS IMAGE DROP
  const onDrop = useCallback(async (acceptedFiles) => {
    const url = await uploadToIPFS(acceptedFiles[0]);
    setFileUrl(url);
  }, [uploadToIPFS]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    maxSize: 5000000,
  });

  // useEffect(()=>{
  //   getAllVoterData();
  // }, []);

  //----JSX PART
  return (
    <div className={Style.createVoter}>
      <div>
        {fileUrl && (
          <div className={Style.voterInfo}>
            <img src={fileUrl} alt="Voter Image" />
            <div className={Style.voterInfo_paragraph}>
              <p>
                Name: <span>{formInput.name}</span>
              </p>
              <p>
                Address: <span>{formInput.address}</span>
              </p>
              <p>
                Faculty: <span>{formInput.faculty}</span>
              </p>
            </div>
          </div>
        )}

        {!fileUrl && (
          <div className={Style.sideInfo}>
            <div className={Style.sideInfo_box}>
              <h4>Create Voters</h4>
              <p>Blockchain voting organization</p>
              <p className={Style.sideInfo_para}>Voters</p>

              <div className={Style.card}>
                {voterArray.map((eL, i) => (
                  <div key={i + 1} className={Style.card_box}>
                    <div className={Style.image}>
                      <img src={eL[4]} alt="Profile photo" />
                    </div>

                    <div className={Style.card_info}>
                      <p>{eL[1]}</p>
                      <p>Address: {eL[3].slice(0,10)}...</p>
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
          <h1>Create New Voter</h1>
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
            placeholder="Voter Name"
            handleClick={(e) => setFormInput({ ...formInput, name: e.target.value })}
          />
          <Input
            inputType="text"
            title="Address"
            placeholder="Voter Address"
            handleClick={(e) => setFormInput({ ...formInput, address: e.target.value })}
          />
          <Input
            inputType="text"
            title="Voter Faculty"
            placeholder="Voter Faculty"
            handleClick={(e) => setFormInput({ ...formInput, faculty: e.target.value })}
          />

          <div className={Style.Button}>
            <Button btnName="Authorized Voter" handleClick={() => createVoter(formInput, fileUrl)} />
          </div>
        </div>
      </div>
      <div className={Style.createdVoter}>
        <div className={Style.createdVoter__info}>
          <Image src={images.notice} alt="user Profile" />
          <p>Notice for Admins</p>
          <p>Please login to the admin wallet to create new voters</p>
        </div>
      </div>
    </div>
  );
};

export default allowedVoters;

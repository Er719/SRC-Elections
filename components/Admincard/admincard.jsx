import React from "react";
import Image from "next/image";

//INTERNAL IMPORT
import Style from './admincard.module.css';
import images from '../../assets';

const admincard = ({candidateArray, giveVote}) => {
  return (
    <div className = {Style.card}>
      {candidateArray.map((el, i) => (
        <div className={Style.card_box}>
          <div className={Style.image}>
            <img src={el[3]} alt=""/>
          </div>

          <div className={Style.card_info}>
            <h2>
              {el[1]} #{el[2].toNumber()}
            </h2>
            <p>{el[0]}</p>
            <p>Address: {el[6].slice(0,30)}...</p>
            <p className={Style.total}>Total Vote</p>
          </div>

          <div className={Style.card_vote}>
            <p>{el[4].toNumber()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default admincard;

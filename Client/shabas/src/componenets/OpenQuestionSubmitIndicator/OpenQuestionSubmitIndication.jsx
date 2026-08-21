import React, { useState } from 'react';


const OpenQuestionSubmitIndication = ({submitted}) => {
    const style= {
        minHeight:'40px',
        color:'#72C770',
        display:'flex',
        flexDirection:'column',
        alignContent:'center',
        fontSize:'20px'
    }

    return (
        <div style={style}>
            {submitted && "נשמר בהצלחה!"}
        </div>
    );
};

export default OpenQuestionSubmitIndication;

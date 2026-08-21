import React, { useState } from 'react';
// import './SingleChoice.css';  // Make sure to create a CSS file with the styles provided below

const data = {
    1:{
        audio:'audio',
        question:"מה אתה אוהב לאכול בבוקר?"
    },
    2:{
        audio:'audio',
        question:"בן כמה יוב שרגי?"
    },
    3:{
        audio:'audio',
        question:"למה אתה לא נקרא בשם אחר ממה שנתנו לך?"
    },
    4:{
        audio:'audio',
        question:"שדגכשדג מה אתה אוהב לאכול בבוקר?"
    },
    5:{
        audio:'audio',
        question:"מדכדכה אתדכדכה אוהב לדכדכדאכול בבוקדכדכדכר?"
    },
    6:{
        audio:'audio',
        question:"מה אתה אוהבשדגעשדגעשדגע לאכול בשדגכעשדעג בוקר?"
    },
    7:{
        audio:'audio',
        question:"מה אגכחגכעחתידעה שדגדגעאוהב לאכול בבודגשדגעקר?חגכעחגכ"
    },
}

const FinalWorkForm = ({}) => {
    
    const [fields, setFields] = useState(data);

    const handleChange = (name, event) => {
        setFields({
            ...fields,
            [name]: event.target.value
        });
    };

    return (
        <div className="dynamic-form">
            {Object.keys(fields).map((id) => (
                <>
                    <label>{fields[id].question}</label>
                    <AutosizeTextAreaField
                        id={id}
                        value={fields[id]}
                        onChange={(event) => handleChange(id, event)}
                        minRows={3}
                        className="textarea"
                    />
                </>
            ))}
        </div>
    );
};

export default FinalWorkForm;

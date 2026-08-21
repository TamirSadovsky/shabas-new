import React, { useEffect, useRef, useState } from 'react';
// import './SingleChoice.css';  // Make sure to create a CSS file with the styles provided below
import TextareaAutosize from 'react-textarea-autosize';
import './AutosizeTextAreaField.css'
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import x_mark from '../../assets/x_mark.svg'
import check_mark from '../../assets/check-empty.svg'
import arrow from '../../assets/arrow.svg'
import teachers_note from '../../assets/teachers_note.svg'
import ContentEditable from 'react-contenteditable';
import Modal from '../Modal/Modal';
import TeacherModal from '../TeacherModal/TeacherModal';



const AutosizeTextAreaField = ({onChange, value, id, minRows, width, currentLength, maxLength, teachers_comment = false}) => {
    
    const [placeholder, setPlaceholder] = useState('רשום את תשובתך כאן');
    const [isFocused, setIsFocused] = useState(false);
    const contentEditableRef = useRef(null);
    const [showModal,  setShowModal] = useState(false);
    
    const style = {
        width:width ? width : '90%',
        borderRadius:"20px",
        paddingText:'5',
        fontSize:'18px',
        fontFamily:'Rubik',
        padding:'25px 25px 35px 20px',
        border: "solid 2px #3072AF",
        color:'black',
        textAlign:'right',
        minHeight:"150px"
    }

    const decodeHtmlEntities = (text) => {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }
    const getLength = () => {
        console.log(value)
        const text = value.replace(/<[^>]+>/g, ''); // Remove HTML tags
        const decodedText = decodeHtmlEntities(text); // Decode HTML entities
        // const cleanedText = decodedText.replace(/\s+/g, ' ').trim(); // Normalize whitespace and trim
        return decodedText.length;
    }

    const handleFocus = () => {
        setIsFocused(true);
        console.log(value)
        if (value === '') {
            setPlaceholder('');
        }
    };

    const handleBlur = () => {
        console.log("testssd")
        setIsFocused(false);
        if (value === '') {
            setPlaceholder('רשום את תשובתך כאן');
        }
    };

    const handleContentChange = (e) => {
        const cleanedText = e.target.value.replace(/<[^>]+>/g, ''); // Remove HTML tags
        const decodedText = decodeHtmlEntities(cleanedText);
    
        if (decodedText.length <= maxLength) {
          onChange(e);  // Call parent onChange if within limit
        } else {
          const truncatedText = decodedText.substring(0, maxLength);
          e.target.value = truncatedText;  // Update the ContentEditable's value
          onChange({ target: { value: truncatedText } });
        }
      };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contentEditableRef.current && !contentEditableRef.current.contains(event.target)) {
                handleBlur();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    
    return (
        <>
            <Modal show={showModal} setShow={setShowModal} child={<TeacherModal setShow={setShowModal} show={showModal} title={"הערת המורה"} notes={teachers_comment}></TeacherModal>}></Modal>
            <div key={id} className="textarea-autosize-wrapper"
                onFocus={handleFocus}
                onBlur={handleBlur}
            >
                {teachers_comment && teachers_comment.length > 0 &&
                    <div className='textarea-teachers-note' onClick={()=> setShowModal(true)}>
                        <img src={teachers_note} />
                    </div>
                }
                <ContentEditable
                    id={id}
                    html={value}
                    onChange={handleContentChange}
                    minRows={minRows ? minRows : 1}
                    className="textarea"
                    style={style}
                    onFocus={()=>console.log("test")}
                    data-placeholder={placeholder}
                />
                <div className='textarea-lettercounter'>
                    {`${maxLength} / ${getLength()} `}
                </div>
            </div>
        </>    
    );
};

export default AutosizeTextAreaField;

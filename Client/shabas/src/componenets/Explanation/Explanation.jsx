import React from 'react';
import './Explanation.css';  // Make sure to create a CSS file with the styles provided below
import ImageComponenet from '../ImageComponenet/ImageComponent';
import { getImageUrl } from '../../constants/importImage';


const Explanation = ({questionInfo, className}) => {
    
   const formatText = () =>{
       let text = questionInfo.options?.[0]?.label || ''
        if(typeof questionInfo.explanation === 'string' && questionInfo.explanation.length > 0) {
            text = questionInfo.explanation;
        }
        let formattedText = text;
        if(text.includes('<B>')){
            formattedText = text.replaceAll('<B>', '<b>').replaceAll('</B>', '</b>')
        }
        if(text.includes('<br>')){
            formattedText = text.replaceAll('<br>', '<br>').replaceAll('</br>', '<br/>')
        }
        return formattedText;
   }

   const img = getImageUrl(questionInfo.img)
    return (
        <div className='explanation-wrapper'>
            <ImageComponenet
                width={"220px"}
                height={"220px"}
                padding={'30px'}
                src={img}
            />
            <div className={'explanation-section'} style={{width: !img ? '100%' : ''}}>
                <div className={className ? className : ''}>
                    {/* <div className='explanation-title'>
                        {questionInfo.title}
                    </div> */}
                    <div className='explanation-content' dangerouslySetInnerHTML={{__html: formatText()}}>
                        {/* {formatText()} */}
                    </div>
                </div>
            </div>
        </div>    
    );
};

export default Explanation;

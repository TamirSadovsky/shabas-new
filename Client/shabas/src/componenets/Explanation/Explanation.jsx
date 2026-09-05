import React from 'react';
import { useSelector } from 'react-redux';
import './Explanation.css';  // Make sure to create a CSS file with the styles provided below
import ImageComponenet from '../ImageComponenet/ImageComponent';
import { getImageUrl } from '../../constants/importImage';

const visibleExplanationText = (html) =>
    String(html || '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .trim();

const Explanation = ({questionInfo, className}) => {
    const bookId = useSelector((state) => state.page.bookId);
    
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
   const enlargeImage = Boolean(img) && !visibleExplanationText(formatText()) && Number(bookId) > 1
    return (
        <div className={enlargeImage ? 'explanation-wrapper explanation-image-only' : 'explanation-wrapper'}>
            <ImageComponenet
                width={enlargeImage ? "860px" : "220px"}
                height={enlargeImage ? "auto" : "220px"}
                padding={enlargeImage ? "0" : "30px"}
                src={img}
            />
            {!enlargeImage && (
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
            )}
        </div>    
    );
};

export default Explanation;

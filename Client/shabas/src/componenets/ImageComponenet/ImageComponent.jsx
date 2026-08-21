
import React, { useState } from 'react';



const ImageComponenet = ({width, height, padding, src}) => {
    

    return (
        <div className='single-choice_image_section'>
            {src ? <img style={{height:height, width:width, padding:padding}}src={src}></img> : null}
        </div>
    )
}

export default ImageComponenet
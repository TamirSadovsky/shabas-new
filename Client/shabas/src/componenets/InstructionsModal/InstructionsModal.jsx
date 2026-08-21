import { useState } from 'react'
import './InstructionsModal.css'
import instructions from '../../assets/instructions.pdf'
const InstructionsModal = ({title, text, setShow}) => {
    
    const handleClosePopup = ()=>{
        setShow(false)
    }
    console.log(title)

    // var pdf = new PDFObject({
    //     url: "https://something.com/HTC_One_XL_User_Guide.pdf",
    //     id: "pdfRendered",
    //     pdfOpenParams: {
    //       view: "FitH"
    //     }
    // }).embed("pdfRenderer");

    return (
        <>   

                 <div onClick={handleClosePopup} className='inst_popup_x' >&#x2715;</div>
            <div className={`inst_popup_body`}>
                 <iframe src={`${instructions}#toolbar=0`} width="800" height="720"></iframe>
                {/* <header className='inst_popup_header'>
                    <div id='inst_popup_title'>
                        {title}
                    </div>
                </header>
                <section className='inst_popup_text'>
                    {text}
                </section> */}
            </div>
        </>
    )
}

export default InstructionsModal;
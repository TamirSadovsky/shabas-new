import { useState } from 'react'
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import './FinalWorkModal.css'

const FinalWorkModal = ({title, notes, setShow}) => {
    
    const handleClosePopup = ()=>{
        setShow(false)
    }
    return (
        <>   

            <div className={`popup_body`}>
                 <div onClick={handleClosePopup} className='popup_x' >&#x2715;</div>
                <header className='popup_header'>
                    <div id='popup_title'>
                        עבודת גמר
                    </div>
                </header>
                <section className='popup_text'>
                    עבודת הגמר הוגשה בהצלחה!            
                </section>
            </div>
        </>
    )
}

export default FinalWorkModal;
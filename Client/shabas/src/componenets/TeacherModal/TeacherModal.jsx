import { useState } from 'react'
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import './TeacherModal.css'

const TeacherModal = ({title, notes, setShow}) => {
    
    const handleClosePopup = ()=>{
        setShow(false)
    }
    console.log(title)
    return (
        <>   

            <div className={`popup_body`}>
                 <div onClick={handleClosePopup} className='popup_x' >&#x2715;</div>
                <header className='popup_header'>
                    <div id='popup_title'>
                        {title}
                    </div>
                </header>
                <section className='popup_text'>
                <TableContainer component={Paper} dir='rtl'>
                    <Table sx={{ minWidth: 650, maxWidth: 750 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="right">טקסט התלמיד</TableCell>
                                <TableCell align="right">הערת המורה</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {notes.map((row) => (
                            <TableRow
                            key={row.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                            <TableCell align="right">{row.QDes}</TableCell>
                            <TableCell align="right">{row.Tip}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>                
                </section>
            </div>
        </>
    )
}

export default TeacherModal;
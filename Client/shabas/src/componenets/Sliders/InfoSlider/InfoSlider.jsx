import { useState } from 'react'
import './InfoSlider.css'
import { useDispatch, useSelector } from 'react-redux'
import info_icon from '../../../assets/info_icon.svg'
import Modal from '../../Modal/Modal';
import InstructionsModal from '../../InstructionsModal/InstructionsModal';

const InfoSlider = ({ slider_type }) => {
    const [showModal, setShowModal] = useState(false);
    const dispatch = useDispatch()

    const handleClick = () => {
        dispatch({type:'PICK_CATEGORY', page:'tutorial', id:1})
    }


    return (
        <>
            {/* <Modal setShow={setShowModal} show={showModal} child={<InstructionsModal setShow={setShowModal}></InstructionsModal>}></Modal> */}
            <div className="info-costum-slider" onClick={handleClick}>
                <img className="costum-slider-icon" src={info_icon}/>
                <div className='info_slider_text'>
                    מדריך ללומד
                </div>
            </div>
        </>
    );
};

export default InfoSlider;



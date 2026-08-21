
import { useEffect } from 'react';
import Tutorial from '../../componenets/Tutorial/Tutorial';
import './TutorialPage.css';
import { useDispatch, useSelector } from 'react-redux';


const ToturialPage = ({ setPageDirection }) => {

    useEffect(()=>{
        setPageDirection(prev => !prev)
    },[])

    return (
        <div>
            <div className='tutorial-section'>
                <div className='tutorial-wrapper'>
                    <div className='tutorial-block' style={{padding:'65px', height: 'calc(90vh - 132px)', overflowY:'scroll'}}>
                        <Tutorial></Tutorial>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToturialPage;

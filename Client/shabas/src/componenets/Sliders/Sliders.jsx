import { useEffect, useState } from 'react'
import './Sliders.css'
import { useSelector } from 'react-redux'
import CostumSlider from './CostumSlider/CostumSlider'
import InfoSlider from './InfoSlider/InfoSlider'
import BrightnessSlider from './BrightnessSlider/BrightnessSlider'
import BackToHomeSlider from './BackToHomeSlider/BackToHomeSlider'

function Sliders({ setPageDirection }) {
    const state = useSelector(state => state.settings)
    useEffect(()=>{
        // console.log("brightness")
        // document.documentElement.style.setProperty('--brightness', state.brightness  + '%');
        // maybe change to BE using npm i brightness https://www.npmjs.com/package/brightness
    },[state.brightness])
    return (
        <>
            <main className='sliders'>
                <CostumSlider slider_type='volume' step={0.01} min={0} max={1}/>
                <BrightnessSlider slider_type='brightness' min={30} max={100}/>
                <InfoSlider/>
                <BackToHomeSlider setPageDirection={setPageDirection}/>
            </main>
        </>
    )
}

export default Sliders

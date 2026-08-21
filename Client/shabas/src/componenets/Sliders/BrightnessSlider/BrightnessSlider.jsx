import { useState } from 'react'
import './BrightnessSlider.css'
import { useDispatch, useSelector } from 'react-redux'
import volume_icon from '../../../assets/volume_icon.svg'
import brightness_icon from '../../../assets/brightness_icon.svg'
import axiosInstance from '../../../constants/axios.config'

const BrightnessSlider = ({ step, min, max }) => {
    const [brightness, setBrightness] = useState(50);
    const dispatch = useDispatch();
  
    const handleBrightnessChange = async (event) => {
      const value = event.target.value;
      
      try {
        // Update local state
        setBrightness(value);
        
        // Update Redux store
        dispatch({ type: "CHANGE_SETTING", selector: "brightness", value });
        
        // Send request to server
        await axiosInstance.post('/brightness', { value })
      } catch (error) {
        console.error('Failed to update brightness:', error);
      }
    };
  
    const percentage = ((brightness - min) / (max - min)) * 100;
    const sliderStyle = {
      background: `linear-gradient(to right, #3072AF ${percentage}%, #8AB5D8 ${percentage}%)`
    };
  
    return (
      <div className="costum-slider">
        <img className="costum-slider-icon" src={brightness_icon} alt="brightness"/>
        <input
          type="range"
          step={step} 
          min={min}
          max={max}
          value={brightness}
          className="slider"
          onChange={handleBrightnessChange}
          style={sliderStyle}
        />
      </div>
    );
  };
  
  export default BrightnessSlider;
  




import { useState } from 'react'
import './CostumSlider.css'
import { useDispatch, useSelector } from 'react-redux'
import volume_icon from '../../../assets/volume_icon.svg'
import brightness_icon from '../../../assets/brightness_icon.svg'

const CostumSlider = ({ slider_type, step, min ,max }) => {
  const [volume, setVolume] = useState(50);
  const dispatch = useDispatch();

  const typeIcon = (slider_type)=> {
    switch(slider_type){
        case 'volume':
            return volume_icon
        case 'brightness':
            return brightness_icon
    }
  }
  const handleVolumeChange = (event) => {
    const value = event.target.value
    dispatch({type: "CHANGE_SETTING", selector: slider_type, value:value })
    // console.log(event.target.value)
    setVolume(event.target.value);
  };
  const percentage = ((volume - min) / (max - min)) * 100;
  const sliderStyle = {
    background: `linear-gradient(to right, #3072AF ${slider_type === "volume" ? volume * 100 :percentage}%, #8AB5D8 ${slider_type === "volume" ? volume * 100 : percentage}%)`
  };

  return (
    <div className="costum-slider">
      <img className="costum-slider-icon" src={typeIcon(slider_type)}/>
      <input
        type="range"
        step={step} 
        min={min}
        max={max}
        value={volume}
        className="slider"
        onChange={handleVolumeChange}
        style={sliderStyle}
      />
    </div>
  );
};

export default CostumSlider;



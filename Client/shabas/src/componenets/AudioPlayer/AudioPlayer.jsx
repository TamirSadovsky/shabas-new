import React, { useState, useEffect, useRef, useCallback } from "react";
import song from "../../assets/sounds/אם חיים נולד ב.mp3";
import audio_icon from '../../assets/sound_icon.svg'
import pause_icon from '../../assets/pause_icon.svg'
import play_icon from '../../assets/play_icon.svg'
import { useDispatch, useSelector } from "react-redux";
import { getAudio } from "../../constants/audioManager";
import { useAudio } from "../../context/AudioContext";


const AudioPlayer = ({audioName, id}) => {
    const [audio, setAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const volumeState = useSelector(state => state.settings.volume)
    const { setPlayingAudio } = useAudio();
    const resetAudio = ()=>{
        // setAudio(null)
        setIsPlaying(false)
        setIsClicked(false)
    }
    useEffect(() => {
        resetAudio()
        if (typeof audioName !== 'string' || audioName.trim().length === 0) {
            setAudio(null)
            return
        }

        try{
            import(`../../assets/sounds/${audioName.replace('.mp3', '')}.mp3`)
                .then(audioModule => {
                    const newAudio = new Audio(audioModule.default);
                    setAudio(newAudio);
                })
                .catch(e => console.error("Failed to load the audio file:", e));
        } catch(e){
            console.log("Error loading audio")
        }
        return ()=> setAudio(null)
    }, [audioName, id])

    useEffect(() => {
        if(audio){
            audio.addEventListener('ended', handleAudioEnd);
            audio.addEventListener('pause', handlePause);
            return () => {
                audio.pause();
                audio.removeEventListener('ended', handleAudioEnd);
                audio.removeEventListener('pause', handlePause);
            };
        }

    }, [audio]);


    useEffect(() => {
        if(audio)
            audio.volume = volumeState;  // Update the volume of the audio object
    }, [volumeState]);


    const handleAudioEnd = useCallback(() => {
        setIsPlaying(false);  // Update state to indicate the audio has finished playing
        setIsClicked(false)
    },[]);

    const handlePause = ()=>{
        setIsPlaying(false)
    }

    const playPause = () => {
        if(!audio) return;

        setPlayingAudio(audio)
        setIsClicked(false)


        if (isPlaying) {
            audio.pause();
        } else {
            audio.play()
        }

        setIsPlaying(!isPlaying);
        setIsClicked(true)
    };


    return (
        <div style={{height:'38px', width:'38px'}}>
            <div onClick={playPause}>
                {!isClicked && <img src={audio_icon} style={{height:'38px', width:'38px' ,filter: !audio ? 'grayscale(100%)' : 'unset'}}/>}
                {!isPlaying && isClicked && <img src={play_icon}/>}
                {isPlaying && isClicked && <img src={pause_icon}/>}
                
            </div>
        </div>
    );
}

export default AudioPlayer;
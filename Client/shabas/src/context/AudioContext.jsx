// AudioContext.js
import React, { createContext, useContext, useRef, useState } from "react";

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const currentlyPlayingAudioRef = useRef(null);
    const setPlayingAudio = (audio) => {
        if (currentlyPlayingAudioRef.current && currentlyPlayingAudioRef.current !== audio) {
            currentlyPlayingAudioRef.current.pause();
            // currentlyPlayingAudioRef.current.currentTime = 0;
        }
        currentlyPlayingAudioRef.current = audio;
    };

    return (
        <AudioContext.Provider value={{ setPlayingAudio, currentlyPlayingAudioRef }}>
            {children}
        </AudioContext.Provider>
    );
};
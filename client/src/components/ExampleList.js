import React, { useEffect, useState, useRef } from 'react';
import { getExamples, queryHuggingFaceAPI, getAyah } from '../services/api';
import axios from 'axios';

const ExampleList = () => {
    const [examples, setExamples] = useState([]);
    const [audioBlob, setAudioBlob] = useState(null); // State to store recorded audio blob
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(''); // State to store audio playback URL

    const mediaRecorderRef = useRef(null); // Ref to hold mediaRecorder instance

    useEffect(() => {
        fetchExamples();
    }, []);

    const fetchExamples = async () => {
        const examplesData = await getExamples();
        setExamples(
            examplesData.map((example) => ({
                ...example,
                isRecording: false,
                audioBlob: null,
                audioURL: '',
                answer: '', // Add an answer property to each example
                isCorrect: null, // Add a property to store if the answer is correct
                correctAyah: null, // Add a property to store the correct ayah data
            }))
        );
    };

    const handlesubmitbutton = async (index) => {
        const audioBlob = examples[index].audioBlob;

        if (!audioBlob) {
            console.error('No audio blob recorded.');
            return;
        }

        try {
            const response = await queryHuggingFaceAPI(audioBlob);
            console.log('Response from Hugging Face API:', response);

            const updatedExamples = [...examples];
            updatedExamples[index].answer = response.text; // Update the answer property with the received answer

            // Compare the user's answer with the correct answer
            const correctAnswer = updatedExamples[index].word;
            updatedExamples[index].isCorrect = response.text === correctAnswer;

            setExamples(updatedExamples);

            if (!updatedExamples[index].isCorrect) {
                // Fetch and store the correct ayah
                fetchAndStoreCorrectAyah(updatedExamples[index],index);
            }
        } catch (error) {
            console.error('Error querying Hugging Face API:', error);
        }
    };

    const fetchAndStoreCorrectAyah = async (example,index) => {
        try {
            const { surah, ayah } = example;
            const ayahData = await getAyah(surah, ayah);

            // Assuming ayahData contains the URL to play the correct ayah
            const correctAyah = {
                audioURL: ayahData.data.audio, // Adjust according to your API response structure
                surahName: ayahData.data.surah.englishName,
                ayahNumber: ayahData.data.numberInSurah,
                text: ayahData.data.text,
            };

            const updatedExamples = [...examples];
            updatedExamples[index].correctAyah = correctAyah;
            setExamples(updatedExamples);
        } catch (error) {
            console.error('Error fetching correct ayah:', error);
        }
    };

    const handleMicButtonClick = (index) => {
        const updatedExamples = [...examples];
        const currentExample = updatedExamples[index];

        if (!currentExample.isRecording) {
            startRecording(index);
        } else {
            stopRecording(index);
        }

        setExamples(updatedExamples);
    };

    const startRecording = (index) => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                const mediaRecorder = new MediaRecorder(stream);
                const chunks = [];

                mediaRecorder.ondataavailable = (e) => {
                    chunks.push(e.data);
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
                    const audioURL = URL.createObjectURL(blob);

                    const updatedExamples = [...examples];
                    updatedExamples[index] = {
                        ...updatedExamples[index],
                        audioBlob: blob,
                        audioURL: audioURL,
                    };

                    setExamples(updatedExamples);
                };

                mediaRecorder.start();
                const updatedExamples = [...examples];
                updatedExamples[index] = {
                    ...updatedExamples[index],
                    isRecording: true,
                };
                setExamples(updatedExamples);

                // Store mediaRecorder instance in ref
                mediaRecorderRef.current = mediaRecorder;
            })
            .catch((error) => {
                console.error('Error accessing microphone:', error);
            });
    };

    const stopRecording = (index) => {
        const mediaRecorder = mediaRecorderRef.current;
        if (mediaRecorder) {
            mediaRecorder.stop();
        }

        const updatedExamples = [...examples];
        updatedExamples[index] = {
            ...updatedExamples[index],
            isRecording: false,
        };
        setExamples(updatedExamples);
    };

    const handleAudioPlay = (index) => {
        const audioURL = examples[index].audioURL;
        if (audioURL) {
            const audio = new Audio(audioURL);
            audio.play();
        }
    };

    const handlePlayCorrectAyah = async (index) => {
        const correctAyah = examples[index].correctAyah;
        if (correctAyah) {
            // Play the correct ayah
            const audioURL = correctAyah.audioURL;
            if (audioURL) {
                const audio = new Audio(audioURL);
                audio.play();
            }
        }
    };

    return (
        <div>
            <h1>Quranic Questions</h1>

            {/* List of Quranic questions */}
            <ul>
                {examples.map((example, index) => (
                    <li key={index}>
                        <p>
                            Question ID: {example.question_id} Surah: {example.surah} Ayah: {example.ayah}
                        </p>
                        <p>Question Aya: {example.question_aya}</p>
                        <p>Options: {example.options.join(', ')}</p>
                        <button onClick={() => handleMicButtonClick(index)}>
                            {example.isRecording ? 'Stop Recording 🎤' : 'Start Recording 🎤'}
                        </button>
                        {/* Playback button */}
                        <button onClick={() => handleAudioPlay(index)} disabled={!example.audioURL}>
                            Play Recorded Audio 🎧
                        </button>
                        <button onClick={() => handlesubmitbutton(index)}>Submit</button>
                        {/* Display the user's answer */}
                        {example.answer && (
                            <div>
                                <p>User's Answer: {example.answer}</p>
                                {example.isCorrect !== null && (
                                    <p>{example.isCorrect ? 'Correct Answer' : 'Wrong Answer'}</p>
                                )}
                                {!example.isCorrect && example.correctAyah && (
                                    <div>
                                        <p>Correct Ayah: Surah {example.correctAyah.surahName}, Ayah {example.correctAyah.ayahNumber}</p>
                                        <p>{example.correctAyah.text}</p>
                                        <button onClick={() => handlePlayCorrectAyah(index)}>Play Correct Ayah</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ExampleList;

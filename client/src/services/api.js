import axios from 'axios';

const API_URL = 'http://localhost:5000/api/';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/tarteel-ai/whisper-base-ar-quran';
const HUGGINGFACE_TOKEN = 'hf_##########################'; // Replace with your actual token
const ALQURAN_API_URL = 'http://api.alquran.cloud/v1/ayah/';

export const queryHuggingFaceAPI = async (data) => {
    try {
        console.log('Querying Hugging Face API...');
        const response = await axios.post(HUGGINGFACE_API_URL, data, {
            headers: {
                Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                'Content-Type': 'application/json', // Ensure correct content type for FormData
            },
        });
        console.log('Response from Hugging Face API:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error querying Hugging Face API:', error);
        throw error; // Optionally handle error further up the chain
    }
};

export const getExamples = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching examples:', error);
        throw error; // Optionally handle error further up the chain
    }
};

export const getAyah = async (surah,ayah) => {
    try {
        const response = await axios.get(ALQURAN_API_URL+surah+':'+ayah+"/ar.alafasy");
        console.log('Response from Alquran API:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching ayah:', error);
        throw error; // Optionally handle error further up the chain
    }
};

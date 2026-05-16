require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI, Type, Schema } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve your HTML/JS/CSS from a folder named 'public'

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The available doctors mapping
const medicalData = `
Departments and Doctors:
- cardiology: Dr. Sarah Johnson, Dr. Ahmed Hassan
- dermatology: Dr. Lisa Park, Dr. David Brown
- neurology: Dr. James Wilson, Dr. Maria Garcia
- orthopedics: Dr. Robert Kim, Dr. Jennifer Lee
- pediatrics: Dr. Amanda White, Dr. Kevin Moore
- general: Dr. Michael Chen, Dr. Jessica Taylor
`;

app.post('/api/triage', async (req, res) => {
    try {
        const { symptoms } = req.body;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze these symptoms: "${symptoms}". \n\nBased on the following available staff, assign the most appropriate department and doctor. \n${medicalData}`,
            config: {
                systemInstruction: "You are an AI triage nurse. Analyze symptoms and return ONLY a JSON object.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        urgency: { type: Type.STRING, enum: ["urgent", "moderate", "normal"], description: "Urgency level" },
                        department: { type: Type.STRING, description: "Lowercase department name (e.g., cardiology)" },
                        doctor: { type: Type.STRING, description: "Exact name of the assigned doctor from the provided list" },
                        doctorTitle: { type: Type.STRING, description: "Professional title, e.g., Cardiologist" },
                        recommendation: { type: Type.STRING, description: "A brief, 1-2 sentence recommendation for the patient" }
                    },
                    required: ["urgency", "department", "doctor", "doctorTitle", "recommendation"]
                }
            }
        });
        
        res.json(JSON.parse(response.text));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to analyze symptoms' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: "You are MediBot, a helpful AI medical assistant for the MediFlow clinic. Keep answers concise, helpful, and friendly. Advise users to book appointments for specific medical issues based on our departments: cardiology, dermatology, neurology, orthopedics, pediatrics, and general medicine."
            }
        });
        res.json({ response: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate chat response' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
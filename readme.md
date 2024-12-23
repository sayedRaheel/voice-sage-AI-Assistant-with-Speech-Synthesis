# Voice and Text Chat Assistant Documentation

## Overview
This application is a full-stack chat assistant made by Sayed Raheel Hussain that supports both voice and text interactions. It transcribes voice input, processes it through LLMs, and provides both text and audio responses.

## Features
- Voice recording and transcription
- Text input support
- Real-time audio transcription
- AI-powered responses
- Text-to-Speech responses
- Modern dark-themed UI
- Message history
- Support for both audio and text inputs

## Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- OpenAI API key
- Groq API key

## Project Structure
```
voice-assistant/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── AudioChat.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Backend Setup

1. Create and activate a Python virtual environment:
```bash
python -m venv voice_test
source voice_test/bin/activate  # For Unix/macOS
# or
.\voice_test\Scripts\activate  # For Windows
```

2. Install required Python packages:
```bash
pip install fastapi uvicorn python-multipart groq openai python-dotenv
```

3. Create `.env` file in backend directory:
```env
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. Dependencies used:
- `fastapi`: Web framework for building APIs
- `uvicorn`: ASGI server for FastAPI
- `groq`: Groq API client for STT
- `openai`: OpenAI API client for TTS
- `python-dotenv`: Environment variable management

## Frontend Setup

1. Create a new React project:
```bash
npx create-react-app frontend
cd frontend
```

2. Install required packages:
```bash
npm install lucide-react
```

3. Dependencies used:
- `lucide-react`: Icon library
- `react`: Frontend framework
- `react-dom`: React DOM manipulation

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload --port 8003
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

## API Endpoints

### 1. Process Audio
- **Endpoint**: `/process-audio`
- **Method**: POST
- **Request Body**:
```json
{
  "audio": "base64_encoded_audio_string",
  "type": "audio"
}
```
- **Response**:
```json
{
  "user_input": {
    "type": "audio",
    "transcription": "transcribed_text"
  },
  "assistant_response": {
    "text": "ai_response_text",
    "audio": "base64_encoded_audio"
  }
}
```

### 2. Process Text
- **Endpoint**: `/process-text`
- **Method**: POST
- **Request Body**:
```json
{
  "text": "user_input_text",
  "type": "text"
}
```
- **Response**:
```json
{
  "user_input": {
    "type": "text",
    "text": "user_input_text"
  },
  "assistant_response": {
    "text": "ai_response_text",
    "audio": "base64_encoded_audio"
  }
}
```

## How It Works

1. **Voice Input Flow**:
   - User clicks microphone button to start recording
   - Audio is captured using MediaRecorder API
   - Audio is converted to base64
   - Sent to backend for processing
   - Groq transcribes audio to text
   - Text is processed by LLM
   - Response is converted to speech using OpenAI TTS
   - Both text and audio responses are sent back to frontend

2. **Text Input Flow**:
   - User types message and clicks send
   - Text is sent to backend
   - Text is processed by LLM
   - Response is converted to speech
   - Both text and audio responses are returned

## Important Notes

1. **API Keys**:
   - Get OpenAI API key from: https://platform.openai.com/api-keys
   - Get Groq API key from: https://console.groq.com/keys

2. **CORS Configuration**:
   - Backend is configured to accept requests from localhost:3000 and localhost:3001
   - Update CORS settings if using different ports

3. **Audio Format**:
   - Recording uses WAV format
   - Audio responses are in MP3 format

4. **Browser Support**:
   - Requires modern browser with MediaRecorder API support
   - Requires microphone permissions for voice input

## Customization

1. **Voice Settings**:
   - Change TTS voice in backend:
```python
tts_response = openai_client.audio.speech.create(
    model="tts-1",
    voice="nova",  # Change voice here
    input=ai_response
)
```

2. **UI Customization**:
   - All styling uses Tailwind CSS classes
   - Color scheme can be modified in the className strings

3. **Message Display**:
   - Modify the message component in AudioChat.js
   - Add additional message types if needed

## Troubleshooting

1. **API Key Errors**:
   - Verify API keys are correctly set in .env
   - Ensure .env is in correct directory
   - Check API key permissions

2. **CORS Errors**:
   - Verify frontend port matches CORS settings
   - Check backend URL in frontend fetch calls

3. **Audio Issues**:
   - Check microphone permissions
   - Verify audio format compatibility
   - Check browser console for MediaRecorder errors

## Security Considerations

1. Keep API keys secure and never commit them to version control
2. Use environment variables for sensitive data
3. Implement proper authentication for production use
4. Consider rate limiting for API endpoints
5. Validate and sanitize user inputs

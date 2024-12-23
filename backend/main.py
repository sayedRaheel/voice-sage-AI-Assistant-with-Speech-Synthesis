from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import io
from groq import Groq
from openai import OpenAI

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class AudioRequest(BaseModel):
    audio: str
    type: str = "audio"

class TextRequest(BaseModel):
    text: str
    type: str = "text"

# Initialize clients (replace with your API keys)
groq_client = Groq(api_key="GROQ_API_KEY")
openai_client = OpenAI(api_key="OPENAI_API_KEY")


@app.post("/process-audio")
async def process_audio(request: AudioRequest):
    try:
        # Decode base64 audio
        audio_bytes = base64.b64decode(request.audio)
        
        # Save temporary file
        temp_filename = "temp_recording.wav"
        with open(temp_filename, "wb") as f:
            f.write(audio_bytes)

        # Transcribe using Groq
        with open(temp_filename, "rb") as file:
            translation = groq_client.audio.translations.create(
                file=(temp_filename, file.read()),
                model="whisper-large-v3",
                response_format="json",
                temperature=0.0
            )
        transcription = translation.text

        # Process through LLM
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Keep answers concise in just one line."
                },
                {
                    "role": "user",
                    "content": transcription
                }
            ],
            model="llama3-8b-8192",
            temperature=0.5,
            max_tokens=2048,
            top_p=1,
            stream=False
        )
        ai_response = chat_completion.choices[0].message.content

        # Generate TTS response
        tts_response = openai_client.audio.speech.create(
            model="tts-1",
            voice="onyx",
            input=ai_response
        )

        # Convert to base64
        audio_response = io.BytesIO()
        for chunk in tts_response.iter_bytes():
            audio_response.write(chunk)
        audio_base64 = base64.b64encode(audio_response.getvalue()).decode()

        # Return structured response
        return {
            "user_input": {
                "type": "audio",
                "transcription": transcription
            },
            "assistant_response": {
                "text": ai_response,
                "audio": audio_base64
            }
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-text")
async def process_text(request: TextRequest):
    try:
        # Process through LLM
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a Sayed Raheel's assistant. Sayed Raheel is a ML engineer who made you. Keep answers concise."
                },
                {
                    "role": "user",
                    "content": request.text
                }
            ],
            model="llama-3.3-70b-versatile",#"llama3-8b-8192",
            temperature=0.5,
            max_tokens=2048,
            top_p=1,
            stream=False
        )
        ai_response = chat_completion.choices[0].message.content

        # Generate TTS response
        tts_response = openai_client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=ai_response
        )

        # Convert to base64
        audio_response = io.BytesIO()
        for chunk in tts_response.iter_bytes():
            audio_response.write(chunk)
        audio_base64 = base64.b64encode(audio_response.getvalue()).decode()

        # Return structured response
        return {
            "user_input": {
                "type": "text",
                "text": request.text
            },
            "assistant_response": {
                "text": ai_response,
                "audio": audio_base64
            }
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Test endpoint
@app.get("/")
async def root():
    return {"message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
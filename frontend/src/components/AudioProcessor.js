import React, { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

const AudioProcessor = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      setError(''); // Clear any previous errors
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Error accessing microphone. Please ensure microphone permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    setError(''); // Clear any previous errors
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result.split(',')[1];

          console.log('Sending request to backend...');
          const response = await fetch('http://localhost:8001/process-audio', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audio: base64Audio
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setTranscription(data.transcription);
          setAiResponse(data.ai_response);

          // Play audio response
          if (data.audio_response) {
            const audio = new Audio(`data:audio/mp3;base64,${data.audio_response}`);
            audio.play().catch(e => console.error('Error playing audio:', e));
          }
        } catch (error) {
          console.error('Error processing request:', error);
          setError(`Error processing audio: ${error.message}`);
        }
      };

      reader.onerror = () => {
        setError('Error reading audio file');
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setError(`Error processing audio: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <div className="space-y-6">
        {error && (
          <div className="p-3 text-red-500 bg-red-100 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`p-4 rounded-full ${
              isRecording ? 'bg-red-500' : 'bg-blue-500'
            } text-white hover:opacity-80 transition-opacity disabled:opacity-50`}
          >
            {isRecording ? <Square size={24} /> : <Mic size={24} />}
          </button>
        </div>

        {isProcessing && (
          <div className="text-center text-gray-600">
            Processing your audio...
          </div>
        )}

        {transcription && (
          <div className="space-y-2">
            <h3 className="font-semibold">Transcription:</h3>
            <p className="text-gray-700">{transcription}</p>
          </div>
        )}

        {aiResponse && (
          <div className="space-y-2">
            <h3 className="font-semibold">AI Response:</h3>
            <p className="text-gray-700">{aiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioProcessor;
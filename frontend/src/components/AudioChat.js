// import React, { useState, useRef } from 'react';
// import { Mic, Square, Loader, Volume2, MessageSquare, Waveform } from 'lucide-react';

// const AudioChat = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState('');
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const bottomRef = useRef(null);
//   // You're trying to use setTranscription and setAiResponse but these states aren't defined
//   const [transcription, setTranscription] = useState(''); // Add this
//   const [aiResponse, setAiResponse] = useState(''); // Add this

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = mediaRecorder;
//       audioChunksRef.current = [];

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = async () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
//         await processAudio(audioBlob);
//       };

//       mediaRecorder.start();
//       setIsRecording(true);
//     } catch (error) {
//       console.error('Error accessing microphone:', error);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//       mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//     }
//   };

//   const processAudio = async (audioBlob) => {
//     setIsProcessing(true);
//     try {
//       const reader = new FileReader();
//       reader.readAsDataURL(audioBlob);
//       reader.onloadend = async () => {
//         const base64Audio = reader.result.split(',')[1];

//         const response = await fetch('http://localhost:8003/process-audio', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             audio: base64Audio
//           })
//         });

//         if (!response.ok) throw new Error('Network response was not ok');

//         const data = await response.json();
//         setTranscription(data.transcription);
//         setAiResponse(data.ai_response);

//         if (data.audio_response) {
//           const audio = new Audio(`data:audio/mp3;base64,${data.audio_response}`);
//           audio.play();
//         }
//       };
//     } catch (error) {
//       console.error('Error processing audio:', error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-b from-[#1a1b26] to-[#232334]">
//       {/* Header */}
//       <div className="border-b border-gray-700/50 p-6 bg-[#1a1b26]/50 backdrop-blur-sm">
//         <div className="max-w-4xl mx-auto flex items-center justify-between">
//           <h1 className="text-white text-2xl font-bold flex items-center gap-3">
//             <MessageSquare className="w-6 h-6 text-blue-400" />
//             Voice Assistant
//           </h1>
//           <div className="text-gray-400 text-sm flex items-center gap-2">
//             {isRecording && (
//               <div className="flex items-center gap-2">
//                 <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>
//                 Recording...
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Chat container */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-6">
//         <div className="max-w-4xl mx-auto">
//           {messages.length === 0 && (
//             <div className="text-center py-20">
//               <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
//                 <MessageSquare className="w-8 h-8 text-blue-400" />
//               </div>
//               <h2 className="text-white text-xl font-semibold mb-2">Welcome to Voice Assistant</h2>
//               <p className="text-gray-400">Start a conversation by clicking the microphone below</p>
//             </div>
//           )}
          
//           {messages.map((message, index) => (
//             <div key={index} 
//                  className={`flex items-start space-x-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
//               <div className={`max-w-[80%] rounded-2xl p-5 shadow-lg transform transition-all duration-200 ${
//                 message.type === 'user' 
//                   ? 'bg-blue-500/10 text-white border border-blue-500/20' 
//                   : 'bg-[#2a2b3d] text-white'
//               } ${message.loading ? 'opacity-50' : 'hover:scale-[1.02]'}`}>
//                 {message.loading ? (
//                   <div className="flex items-center space-x-3">
//                     <Loader className="animate-spin" size={16} />
//                     <span>{message.content}</span>
//                   </div>
//                 ) : (
//                   <div className="flex items-start gap-3">
//                     <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
//                       {message.type === 'user' ? (
//                         <div className="bg-blue-500/20 w-full h-full rounded-full flex items-center justify-center">
//                           <Volume2 size={14} className="text-blue-400" />
//                         </div>
//                       ) : (
//                         <div className="bg-purple-500/20 w-full h-full rounded-full flex items-center justify-center">
//                           <MessageSquare size={14} className="text-purple-400" />
//                         </div>
//                       )}
//                     </div>
//                     <div className="flex-1">
//                       <div className="text-sm text-gray-400 mb-1">
//                         {message.type === 'user' ? 'You' : 'Assistant'}
//                       </div>
//                       <div className="text-white">{message.content}</div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
          
//           {error && (
//             <div className="p-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg mb-6 animate-shake">
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
//                   <span className="block w-1 h-1 rounded-full bg-red-400"></span>
//                 </div>
//                 {error}
//               </div>
//             </div>
//           )}
//           <div ref={bottomRef} />
//         </div>
//       </div>

//       {/* Control bar */}
//       <div className="border-t border-gray-700/50 p-6 bg-[#1a1b26]/50 backdrop-blur-sm">
//         <div className="max-w-4xl mx-auto flex items-center gap-4">
//           <button
//             onClick={isRecording ? stopRecording : startRecording}
//             disabled={isProcessing}
//             className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 ${
//               isRecording 
//                 ? 'bg-red-500 hover:bg-red-600' 
//                 : 'bg-blue-500 hover:bg-blue-600'
//             } text-white disabled:opacity-50 disabled:hover:scale-100 shadow-lg ${
//               isRecording ? 'shadow-red-500/20' : 'shadow-blue-500/20'
//             }`}
//           >
//             {isRecording ? <Square size={24} /> : <Mic size={24} />}
//           </button>
          
//           <div className="flex-1">
//             <div className="h-14 rounded-2xl bg-[#2a2b3d] flex items-center px-6 text-gray-400 border border-gray-700/50">
//               {isProcessing ? (
//                 <div className="flex items-center gap-3">
//                   <Loader className="animate-spin" size={16} />
//                   <span>Processing audio...</span>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-3">
//                   <MessageSquare size={16} className="text-blue-400" />
//                   <span>Click the microphone to start recording</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {isProcessing && (
//             <div className="w-14 h-14 rounded-full bg-[#2a2b3d] flex items-center justify-center border border-gray-700/50">
//               <Loader className="animate-spin text-blue-400" size={20} />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AudioChat;

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader, Volume2, MessageSquare, Send } from 'lucide-react';

const AudioChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [textInput, setTextInput] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startRecording = async () => {
    try {
      setError('');
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
      setError('Error accessing microphone. Please ensure permissions are granted.');
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
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        setMessages(prev => [...prev, { type: 'user', content: 'Processing audio...', loading: true }]);

        const response = await fetch('http://localhost:8003/process-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio: base64Audio,
            type: 'audio'
          })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        
        // Update messages with both transcription and response
        setMessages(prev => [
          ...prev.filter(msg => !msg.loading),
          { 
            type: 'user', 
            content: data.user_input.transcription,
            inputType: 'audio'
          },
          { 
            type: 'assistant', 
            content: data.assistant_response.text,
            audioResponse: data.assistant_response.audio
          }
        ]);

        // Play audio response
        if (data.assistant_response.audio) {
          const audio = new Audio(`data:audio/mp3;base64,${data.assistant_response.audio}`);
          await audio.play();
        }
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setError(`Error processing audio: ${error.message}`);
      setMessages(prev => prev.filter(msg => !msg.loading));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      // Add user message immediately
      setMessages(prev => [...prev, { 
        type: 'user', 
        content: textInput,
        inputType: 'text'
      }]);
      
      const response = await fetch('http://localhost:8003/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textInput,
          type: 'text'
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      // Add assistant response
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: data.assistant_response.text,
        audioResponse: data.assistant_response.audio
      }]);

      // Play audio response
      if (data.assistant_response.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${data.assistant_response.audio}`);
        await audio.play();
      }

      setTextInput('');
    } catch (error) {
      console.error('Error processing text:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#1a1b26] to-[#232334]">
      {/* Header */}
      <div className="border-b border-gray-700/50 p-6 bg-[#1a1b26]/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            Sayed Raheel's Voice Assistant
          </h1>
          <div className="text-gray-400 text-sm flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-2">
                <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>
                Recording...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-white text-xl font-semibold mb-2">Welcome to Voice Assistant</h2>
              <p className="text-gray-400">Start a conversation by typing or recording your message</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} 
                 className={`flex items-start space-x-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
              <div className={`max-w-[80%] rounded-2xl p-5 shadow-lg transform transition-all duration-200 ${
                message.type === 'user' 
                  ? 'bg-blue-500/10 text-white border border-blue-500/20' 
                  : 'bg-[#2a2b3d] text-white'
              } ${message.loading ? 'opacity-50' : 'hover:scale-[1.02]'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    {message.type === 'user' ? (
                      <div className="bg-blue-500/20 w-full h-full rounded-full flex items-center justify-center">
                        {message.inputType === 'audio' ? (
                          <Volume2 size={14} className="text-blue-400" />
                        ) : (
                          <MessageSquare size={14} className="text-blue-400" />
                        )}
                      </div>
                    ) : (
                      <div className="bg-purple-500/20 w-full h-full rounded-full flex items-center justify-center">
                        <MessageSquare size={14} className="text-purple-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">
                      {message.type === 'user' ? `You (${message.inputType})` : 'Assistant'}
                    </div>
                    <div className="text-white">{message.content}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {error && (
            <div className="p-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="block w-1 h-1 rounded-full bg-red-400"></span>
                </div>
                {error}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Control bar */}
      <div className="border-t border-gray-700/50 p-6 bg-[#1a1b26]/50 backdrop-blur-sm">
        <form onSubmit={handleTextSubmit} className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white disabled:opacity-50 disabled:hover:scale-100 shadow-lg ${
              isRecording ? 'shadow-red-500/20' : 'shadow-blue-500/20'
            }`}
          >
            {isRecording ? <Square size={24} /> : <Mic size={24} />}
          </button>
          
          <div className="flex-1">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isRecording || isProcessing}
              placeholder={isProcessing ? 'Processing...' : 'Type a message or click the microphone to record'}
              className="w-full h-14 rounded-2xl bg-[#2a2b3d] px-6 text-white border border-gray-700/50 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!textInput.trim() || isProcessing || isRecording}
            className="p-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/20"
          >
            <Send size={24} />
          </button>

          {isProcessing && (
            <div className="w-14 h-14 rounded-full bg-[#2a2b3d] flex items-center justify-center border border-gray-700/50">
              <Loader className="animate-spin text-blue-400" size={20} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AudioChat;
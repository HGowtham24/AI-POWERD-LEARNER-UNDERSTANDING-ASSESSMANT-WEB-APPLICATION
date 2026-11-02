import React, { useState } from 'react';
import { Question } from '../types.js';
import { useAudioRecorder } from '../hooks/useAudioRecorder.js';
import { WaveformVisualizer } from '../components/WaveformVisualizer.js';
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Send,
  HelpCircle,
  Headphones,
  Check,
  Edit3,
} from 'lucide-react';

interface VoiceRecordingPageProps {
  questions: Question[];
  currentQuestionIndex: number;
  onSubmitAnswer: (submission: {
    question: Question;
    audioBase64: string | null;
    mimeType: string;
    transcription: string;
    duration: number;
  }) => void;
  onCancel: () => void;
}

export const VoiceRecordingPage: React.FC<VoiceRecordingPageProps> = ({
  questions,
  currentQuestionIndex,
  onSubmitAnswer,
  onCancel,
}) => {
  const currentQuestion = questions[currentQuestionIndex] || questions[0];
  const [isPlayingTts, setIsPlayingTts] = useState<boolean>(false);
  const [manualTranscriptEdit, setManualTranscriptEdit] = useState<boolean>(false);
  const [editedTranscript, setEditedTranscript] = useState<string>('');

  const {
    status,
    isRecording,
    isPaused,
    duration,
    audioUrl,
    audioBase64,
    mimeType,
    waveformFrequencies,
    volumeLevel,
    liveTranscript,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    setLiveTranscript,
  } = useAudioRecorder();

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Text-To-Speech for Question
  const handleListenQuestion = async () => {
    if (isPlayingTts) return;
    setIsPlayingTts(true);

    try {
      // 1. Try server-side TTS
      const res = await fetch('/api/speech/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentQuestion.questionText }),
      });
      const data = await res.json();

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => setIsPlayingTts(false);
        audio.onerror = () => setIsPlayingTts(false);
        await audio.play();
        return;
      }
    } catch (e) {
      console.warn('Server TTS failed, fallback to browser speech synthesis:', e);
    }

    // 2. Fallback to Browser SpeechSynthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.questionText);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingTts(false);
      utterance.onerror = () => setIsPlayingTts(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingTts(false);
    }
  };

  const currentTranscript = manualTranscriptEdit
    ? editedTranscript
    : liveTranscript;

  const handleSubmit = () => {
    const finalTranscript = manualTranscriptEdit
      ? editedTranscript
      : liveTranscript;

    onSubmitAnswer({
      question: currentQuestion,
      audioBase64: audioBase64 || null,
      mimeType,
      transcription: finalTranscript,
      duration: duration || 30,
    });
  };

  // Determine user-friendly recording status text
  const getStatusBadge = () => {
    if (isRecording) {
      return {
        label: 'Recording in Progress • Speak Freely',
        classes: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse',
      };
    }
    if (isPaused) {
      return {
        label: 'Recording Paused',
        classes: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      };
    }
    if (status === 'stopped') {
      return {
        label: 'Answer Captured • Ready for Evaluation',
        classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      };
    }
    return {
      label: 'Ready to Record',
      classes: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Navigation & Session Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            ← Exit Session
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Target Time:</span>
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            ~{currentQuestion.expectedDurationSeconds}s
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
              {currentQuestion.subjectName}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {currentQuestion.topic}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                currentQuestion.difficulty === 'Beginner'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : currentQuestion.difficulty === 'Intermediate'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
              }`}
            >
              {currentQuestion.difficulty}
            </span>

            {/* Read aloud TTS button */}
            <button
              onClick={handleListenQuestion}
              disabled={isPlayingTts}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              title="Listen to question spoken aloud"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingTts ? 'animate-bounce' : ''}`} />
              <span>{isPlayingTts ? 'Playing...' : 'Listen to Question'}</span>
            </button>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
          "{currentQuestion.questionText}"
        </h2>

        <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            Instructions: Explain the mechanism in your own words. Do not worry about memorizing exact formulas; explain the concepts clearly.
          </span>
        </div>
      </div>

      {/* Permission or Hardware Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Microphone Access Notice</p>
            <p>{error}</p>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 underline cursor-pointer pt-1" onClick={startRecording}>
              Click here to re-request microphone permissions
            </p>
          </div>
        </div>
      )}

      {/* Voice Recording Control Center */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 text-center">
        {/* Status Badge */}
        <div className="flex justify-center">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${statusBadge.classes}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* Live Waveform Canvas */}
        <div className="max-w-lg mx-auto">
          <WaveformVisualizer
            frequencies={waveformFrequencies}
            isRecording={isRecording}
            isPaused={isPaused}
            volumeLevel={volumeLevel}
          />
        </div>

        {/* Timer Display */}
        <div className="space-y-1">
          <div className="font-mono text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatTime(duration)}
          </div>
          <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
            {isRecording ? 'Speaking Duration' : status === 'stopped' ? 'Recorded Duration' : '00:00'}
          </span>
        </div>

        {/* Large Interactive Recording Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {status === 'idle' && (
            <button
              onClick={startRecording}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 active:scale-95 transition-all"
            >
              <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="absolute -bottom-7 text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                Click to Speak
              </span>
            </button>
          )}

          {isRecording && (
            <>
              <button
                onClick={pauseRecording}
                className="w-14 h-14 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all active:scale-95"
                title="Pause recording"
              >
                <Pause className="w-5 h-5" />
              </button>

              <button
                onClick={stopRecording}
                className="relative flex items-center justify-center w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/40 active:scale-95 transition-all animate-pulse"
                title="Stop & Save Answer"
              >
                <Square className="w-7 h-7 fill-white" />
                <span className="absolute -bottom-7 text-xs font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                  Finish Speaking
                </span>
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                onClick={resumeRecording}
                className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                title="Resume recording"
              >
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </button>

              <button
                onClick={stopRecording}
                className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md active:scale-95"
                title="Finish recording"
              >
                <Square className="w-5 h-5 fill-white" />
              </button>
            </>
          )}

          {status === 'stopped' && (
            <div className="flex items-center gap-3">
              <button
                onClick={resetRecording}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Re-record Answer</span>
              </button>
            </div>
          )}
        </div>

        {/* Audio Playback Player when recorded */}
        {audioUrl && (
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-left space-y-2 mt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-indigo-500" />
                <span>Review Your Spoken Recording:</span>
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">{formatTime(duration)}</span>
            </div>
            <audio src={audioUrl} controls className="w-full h-10 rounded-lg outline-none" />
          </div>
        )}

        {/* Live / Transcribed Answer Text Box */}
        {(isRecording || liveTranscript || status === 'stopped') && (
          <div className="max-w-xl mx-auto text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Speech-to-Text Transcription:</span>
              </span>
              {status === 'stopped' && (
                <button
                  type="button"
                  onClick={() => {
                    if (!manualTranscriptEdit) {
                      setEditedTranscript(liveTranscript || '');
                    }
                    setManualTranscriptEdit(!manualTranscriptEdit);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{manualTranscriptEdit ? 'Lock Edit' : 'Edit Transcript'}</span>
                </button>
              )}
            </div>

            {manualTranscriptEdit ? (
              <textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 focus:outline-none dark:text-white"
                placeholder="Refine or add to your transcribed words..."
              />
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 min-h-[50px]">
                {currentTranscript || (
                  <span className="text-slate-400 not-italic">
                    Listening to your voice... Spoken words will transcribe in real-time.
                  </span>
                )}
              </p>
            )}

            <p className="text-[11px] text-slate-400">
              Note: Whisper/Gemini audio transcription runs on server submission to verify verbatim scientific terminology.
            </p>
          </div>
        )}

        {/* Submit Answer Button */}
        {status === 'stopped' && (
          <div className="pt-4 max-w-md mx-auto">
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Submit Answer for AI Understanding Evaluation</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import { RootState } from "@/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Speech from "expo-speech";
import { AudioModule } from "expo-audio";
import { StoredText } from "@/types/StoredText";

type UseSpeechProps = {
  onBoundary?: (e: { charIndex: number; charLength: number }) => void;
  onError?: () => void;
  onDone?: () => void;
  voiceOverride?: string;
};

export const useSpeech = () => {
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);

  const [isPaused, setIsPaused] = useState<boolean>(false);

  const preferences = useSelector((state: RootState) => state.preferences);

  const [boundary, setBoundary] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });
  const [isDone, setIsDone] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!isSpeakingId) {
      setIsSpeakingId(null);
      return;
    }
    const interval = setInterval(async () => {
      if (!(await Speech.isSpeakingAsync())) {
        setIsSpeakingId(null);
        setBoundary({
          start: 0,
          end: 0,
        });
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isSpeakingId]);

  const handleSay = async (text: StoredText, props?: UseSpeechProps) => {
    const toSay = text.text || "";
    const id = text.id;
    const voiceId = text.voiceId || preferences.preferredVoice;
    await AudioModule.setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    });

    if (isSpeakingId !== null) {
      Speech.stop();
    }
    if (id !== null && isSpeakingId === id) {
      setIsSpeakingId(null);
      return;
    }

    setIsSpeakingId(id);
    setIsDone(false);
    setIsError(false);
    setBoundary({ start: 0, end: 0 });

    Speech.speak(toSay, {
      voice: props?.voiceOverride ?? voiceId,
      rate: preferences.speechRate,
      pitch: preferences.speechPitch,
      onDone: () => {
        if (isSpeakingId === id) {
          setIsSpeakingId(null);
          setIsDone(true);
        }
        setBoundary({
          start: 0,
          end: 0,
        });
        if (props?.onDone) {
          props.onDone();
        }
      },
      onError: () => {
        if (isSpeakingId === id) {
          setIsSpeakingId(null);
          setIsError(true);
        }
        setBoundary({
          start: 0,
          end: 0,
        });
        if (props?.onError) {
          props.onError();
        }
      },
      onBoundary: (e: { charIndex: number; charLength: number }) => {
        const { charIndex, charLength } = e;
        setBoundary({
          start: charIndex,
          end: charIndex + charLength,
        });

        if (props?.onBoundary) {
          props.onBoundary(e);
        }
      },
    });
  };

  const handlePause = async () => {
    await Speech.pause();
    setIsPaused(true);
  };

  const handleStop = async () => {
    await Speech.stop();
    setIsSpeakingId(null);
    setBoundary({
      start: 0,
      end: 0,
    });
  };

  const handleResume = async () => {
    await Speech.resume();
    setIsPaused(false);
  };
  return {
    isSpeakingId,
    handleSay,
    handleStop,
    boundary,
    isDone,
    isError,
    handlePause,
    isPaused,
    handleResume,
  };
};

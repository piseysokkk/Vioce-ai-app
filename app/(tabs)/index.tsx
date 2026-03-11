import { askVoiceAssistant } from "@/services/api";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import React, { useMemo, useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");

  const canRecord = useMemo(() => !isLoading, [isLoading]);

  const startRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow microphone access.");
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      await recorder.record();
      setIsRecording(true);
      setTranscript("");
      setAnswer("");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not start recording.");
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsLoading(true);

      await recorder.stop();
      const recordingUri = recorder.uri;

      if (!recordingUri) {
        throw new Error("No recording URI found.");
      }

      const result = await askVoiceAssistant(recordingUri);

      setTranscript(result.transcript);
      setAnswer(result.answerText);

      if (result.audioBase64) {
        const outputPath = FileSystem.cacheDirectory + "ai-response.mp3";

        await FileSystem.writeAsStringAsync(outputPath, result.audioBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        player.replace({ uri: outputPath });
        player.play();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not process your voice request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Voice Top 10 App</Text>
      <Text style={styles.subtitle}>
        Ask something like: "Give me the top 10 reasons people fail interviews."
      </Text>

      <View style={styles.buttonWrap}>
        {!isRecording ? (
          <Button
            title="Start Recording"
            onPress={startRecording}
            disabled={!canRecord}
          />
        ) : (
          <Button title="Stop Recording" onPress={stopRecording} />
        )}
      </View>

      {isRecording && <Text style={styles.status}>Listening...</Text>}
      {isLoading && <Text style={styles.status}>Thinking...</Text>}

      <View style={styles.card}>
        <Text style={styles.label}>Transcript</Text>
        <Text style={styles.content}>{transcript || "-"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>AI Answer</Text>
        <Text style={styles.content}>{answer || "-"}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
  buttonWrap: {
    marginTop: 8,
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: "#007AFF",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  label: {
    fontWeight: "700",
    marginBottom: 8,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
  },
});


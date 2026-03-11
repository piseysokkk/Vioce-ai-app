export async function askVoiceAssistant(recordingUri: string): Promise<{
  transcript: string;
  answerText: string;
  audioBase64?: string;
}> {
  const formData = new FormData();

  formData.append("audio", {
    uri: recordingUri,
    name: "recording.m4a",
    type: "audio/m4a",
  } as any);

  const response = await fetch("http://172.20.10.4:3000/ask-voice", {
    method: "POST",
    body: formData,
  });

  return response.json();
}

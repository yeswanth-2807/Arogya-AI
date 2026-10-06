import React, { useState, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { 
  AgoraRTCProvider, 
  LocalVideoTrack, 
  RemoteUser, 
  useJoin, 
  useLocalCameraTrack, 
  useLocalMicrophoneTrack, 
  usePublish, 
  useRemoteUsers,
  useConnectionState
} from 'agora-rtc-react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, AlertCircle } from 'lucide-react';

class VideoCallErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[600px] bg-red-950 flex flex-col items-center justify-center text-white p-4 text-center rounded-2xl">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Video Component Crashed</h2>
          <p className="text-sm text-red-300 font-mono bg-red-900/50 p-4 rounded-xl">{this.state.errorMsg}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

function CallContainer({ channelName, token, appId, uid, onLeave, remoteParticipantName, localParticipantName }) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  // Connection state
  const connectionState = useConnectionState();
  const isConnecting = connectionState === 'CONNECTING' || connectionState === 'RECONNECTING';

  // Join channel (pass null so Agora safely auto-generates the UID)
  useJoin({ appid: appId, channel: channelName, token: token, uid: null }, true);

  // Initialize tracks
  const { localMicrophoneTrack, error: micError } = useLocalMicrophoneTrack(micEnabled);
  const { localCameraTrack, error: camError } = useLocalCameraTrack(camEnabled);

  // Isolate publishing streams! 
  // If we group them together [mic, cam] and the mic is denied, Agora throws an error and rejects the camera too.
  // By separating them, a blocked mic will NEVER prevent the camera from publishing.
  const audioTracks = React.useMemo(() => localMicrophoneTrack ? [localMicrophoneTrack] : [], [localMicrophoneTrack]);
  const videoTracks = React.useMemo(() => localCameraTrack ? [localCameraTrack] : [], [localCameraTrack]);

  usePublish(audioTracks);
  usePublish(videoTracks);

  // Track state management
  useEffect(() => {
    if (localMicrophoneTrack) localMicrophoneTrack.setMuted(!micEnabled);
  }, [micEnabled, localMicrophoneTrack]);

  useEffect(() => {
    if (localCameraTrack) localCameraTrack.setMuted(!camEnabled);
  }, [camEnabled, localCameraTrack]);

  // Remote users
  const remoteUsers = useRemoteUsers();
  
  const handleEndCall = async () => {
    try {
      localCameraTrack?.close();
      localMicrophoneTrack?.close();
      await client.leave();
    } catch (e) {
      console.error(e);
    }
    if (onLeave) onLeave();
  };

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-2xl relative shadow-2xl overflow-hidden border border-slate-800 flex flex-col">
      {/* Status Banner */}
      {isConnecting && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500/90 text-white text-xs font-bold py-1.5 px-4 flex justify-between items-center backdrop-blur-sm">
          <span>{connectionState === 'RECONNECTING' ? 'Reconnecting to secure channel...' : 'Connecting...'}</span>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      {/* Video Grid */}
      <div className="flex-1 relative flex bg-black">
        {/* Remote Video (Main) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {remoteUsers.length > 0 ? (
            remoteUsers[0].hasVideo ? (
              <RemoteUser user={remoteUsers[0]} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-slate-400 space-y-4">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700">
                  <VideoOff className="w-10 h-10 text-slate-500" />
                </div>
                <p className="text-lg">{remoteParticipantName || "Participant"}'s camera is off</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center text-slate-400 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                <span className="text-2xl animate-pulse">👥</span>
              </div>
              <p>Waiting for {remoteParticipantName || "the other participant"} to join...</p>
            </div>
          )}
          {remoteUsers.length > 0 && (
            <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-white text-xs font-bold backdrop-blur-md">
              {remoteParticipantName || "Participant"}
            </div>
          )}
        </div>

        {/* Local Video (PiP) */}
        <div className="absolute bottom-20 right-4 w-32 h-44 sm:w-48 sm:h-64 bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700/50 z-20">
          {camEnabled && localCameraTrack ? (
            <LocalVideoTrack track={localCameraTrack} play={true} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500">
              <VideoOff className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-[10px] uppercase font-bold">Camera Off</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1.5">
            {localParticipantName || "You"}
            {!micEnabled && <MicOff className="w-3 h-3 text-red-400" />}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4 px-4 z-30">
        <button 
          onClick={() => setMicEnabled(!micEnabled)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${micEnabled ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
        >
          {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button 
          onClick={handleEndCall}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg transition-colors flex items-center gap-2"
        >
          <PhoneOff className="w-4 h-4" /> End Call
        </button>

        <button 
          onClick={() => setCamEnabled(!camEnabled)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${camEnabled ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
        >
          {camEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Permissions Error Alert */}
      {(micError || camError) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xl flex items-center gap-2 z-50">
          <AlertCircle className="w-4 h-4" />
          Camera or microphone access denied. Please check your browser permissions.
        </div>
      )}
    </div>
  );
}

export default function VideoCallWrapper({ channelName, token, appId, uid, onLeave, remoteParticipantName, localParticipantName }) {
  if (!token || !appId || !channelName) {
    return (
      <div className="w-full h-[600px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center border border-slate-800 shadow-2xl space-y-4">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 font-medium">Authenticating & Joining Secure Room...</span>
      </div>
    );
  }
  
  return (
    <VideoCallErrorBoundary>
      <AgoraRTCProvider client={client}>
        <CallContainer 
          channelName={channelName} 
          token={token} 
          appId={appId} 
          uid={uid} 
          onLeave={onLeave} 
          remoteParticipantName={remoteParticipantName}
          localParticipantName={localParticipantName}
        />
      </AgoraRTCProvider>
    </VideoCallErrorBoundary>
  );
}

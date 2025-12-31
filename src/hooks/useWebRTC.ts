import { useState, useCallback, useRef, useEffect } from "react";
import Peer from "simple-peer";

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const peerRef = useRef<Peer.Instance | null>(null);

  // Initialize local media stream
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      return null;
    }
  }, []);

  // Start a call (initiator)
  const startCall = useCallback(async () => {
    let stream = localStream;
    if (!stream) {
      stream = await initLocalStream();
    }
    
    if (!stream) {
      console.error("No local stream available");
      return;
    }

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (data) => {
      console.log("=== OFFER SIGNAL (Copy this) ===");
      console.log(JSON.stringify(data));
      console.log("================================");
    });

    peer.on("stream", (remoteStream) => {
      console.log("Received remote stream!");
      setRemoteStream(remoteStream);
    });

    peer.on("connect", () => {
      console.log("Peer connected!");
      setIsCallActive(true);
    });

    peer.on("error", (error) => {
      console.error("Peer error:", error);
    });

    peer.on("close", () => {
      console.log("Peer connection closed");
      setIsCallActive(false);
      setRemoteStream(null);
    });

    peerRef.current = peer;
    setIsCallActive(true);
  }, [localStream, initLocalStream]);

  // Answer a call (receiver)
  const answerCall = useCallback(
    async (offerSignal: string) => {
      let stream = localStream;
      if (!stream) {
        stream = await initLocalStream();
      }
      
      if (!stream) {
        console.error("No local stream available");
        return;
      }

      try {
        const signalData = JSON.parse(offerSignal);
        
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream,
        });

        peer.on("signal", (data) => {
          console.log("=== ANSWER SIGNAL (Copy this) ===");
          console.log(JSON.stringify(data));
          console.log("=================================");
        });

        peer.on("stream", (remoteStream) => {
          console.log("Received remote stream!");
          setRemoteStream(remoteStream);
        });

        peer.on("connect", () => {
          console.log("Peer connected!");
          setIsCallActive(true);
        });

        peer.on("error", (error) => {
          console.error("Peer error:", error);
        });

        peer.on("close", () => {
          console.log("Peer connection closed");
          setIsCallActive(false);
          setRemoteStream(null);
        });

        peer.signal(signalData);
        peerRef.current = peer;
        setIsCallActive(true);
      } catch (error) {
        console.error("Invalid signal data:", error);
      }
    },
    [localStream, initLocalStream]
  );

  // Complete connection with answer signal (for initiator)
  const completeConnection = useCallback((answerSignal: string) => {
    if (!peerRef.current) {
      console.error("No peer connection to complete");
      return;
    }

    try {
      const signalData = JSON.parse(answerSignal);
      peerRef.current.signal(signalData);
    } catch (error) {
      console.error("Invalid signal data:", error);
    }
  }, []);

  // End the call
  const endCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    
    setRemoteStream(null);
    setIsCallActive(false);
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  // Expose functions to window for console testing
  useEffect(() => {
    (window as any).answerCall = answerCall;
    (window as any).completeConnection = completeConnection;
    
    console.log("=== WebRTC Ready ===");
    console.log("To answer a call: answerCall('paste offer signal here')");
    console.log("To complete connection: completeConnection('paste answer signal here')");
    console.log("====================");
    
    return () => {
      delete (window as any).answerCall;
      delete (window as any).completeConnection;
    };
  }, [answerCall, completeConnection]);

  return {
    localStream,
    remoteStream,
    isCallActive,
    initLocalStream,
    startCall,
    answerCall,
    completeConnection,
    endCall,
  };
};

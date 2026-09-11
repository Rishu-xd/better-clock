"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Peer, { type MediaConnection } from "peerjs";
import { createClient } from "@/lib/supabase/client";

type Participant = { userId: string; peerId: string; name: string };
type RemoteVideo = Participant & { stream: MediaStream };
type Room = { id: string; host_id: string; max_participants: number };

export default function VideoGrindRoom() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const roomId = params.roomId;
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const connectionsRef = useRef(new Map<string, MediaConnection>());
  const [room, setRoom] = useState<Room | null>(null);
  const [userId, setUserId] = useState("");
  const participantsRef = useRef<Participant[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [remoteVideos, setRemoteVideos] = useState<RemoteVideo[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice((current) => current === message ? "" : current), 3000);
  }, []);

  const addRemoteStream = useCallback((participant: Participant, stream: MediaStream) => {
    setRemoteVideos((current) => {
      if (current.some((video) => video.peerId === participant.peerId)) return current;
      return [...current, { ...participant, stream }];
    });
  }, []);

  const callParticipant = useCallback((participant: Participant, ownPeerId: string) => {
    const stream = localStreamRef.current;
    const peer = peerRef.current;
    if (!stream || !peer || participant.peerId === ownPeerId || connectionsRef.current.has(participant.peerId)) return;

    const connection = peer.call(participant.peerId, stream);
    if (!connection) return;
    connectionsRef.current.set(participant.peerId, connection);
    connection.on("stream", (remoteStream) => addRemoteStream(participant, remoteStream));
    connection.on("close", () => {
      connectionsRef.current.delete(participant.peerId);
      setRemoteVideos((current) => current.filter((video) => video.peerId !== participant.peerId));
    });
    connection.on("error", () => connectionsRef.current.delete(participant.peerId));
  }, [addRemoteStream]);

  useEffect(() => {
    let active = true;
    let currentUserId = "";
    const connections = connectionsRef.current;

    async function enterRoom() {
      if (!roomId) return;
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace(`/login?next=${encodeURIComponent(`/video-grind/${roomId}`)}`);
        return;
      }
      currentUserId = authData.user.id;
      setUserId(currentUserId);

      const [{ data: roomData, error: roomError }, { data: joinData, error: joinError }] = await Promise.all([
        supabase.from("video_rooms").select("id, host_id, max_participants").eq("id", roomId).maybeSingle<Room>(),
        supabase.rpc("join_video_room", { room_id_input: roomId }),
      ]);
      const joinResult = (joinData as { accepted: boolean; reason: string }[] | null)?.[0];
      if (roomError || joinError || !roomData || !joinResult?.accepted) {
        setError(roomError?.message || joinError?.message || joinResult?.reason || "Unable to join this video room.");
        return;
      }
      if (!active) return;
      setRoom(roomData);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!active) { stream.getTracks().forEach((track) => track.stop()); return; }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const peer = new Peer({ debug: 1 });
        peerRef.current = peer;
        peer.on("open", async (openedPeerId) => {
          if (!active) return;
          const channel = supabase.channel(`video-room:${roomId}`, { config: { presence: { key: currentUserId } } });
          channelRef.current = channel;
          channel.on("presence", { event: "sync" }, () => {
            const state = channel.presenceState<Participant>();
            const nextParticipants = Object.values(state).flat().filter((item) => item.peerId);
            participantsRef.current = nextParticipants;
            setParticipants(nextParticipants);
            nextParticipants.forEach((participant) => {
              if (openedPeerId < participant.peerId) callParticipant(participant, openedPeerId);
            });
          });
          channel.on("presence", { event: "join" }, ({ newPresences }) => {
            const joined = newPresences[0] as unknown as Participant | undefined;
            if (joined && joined.userId !== currentUserId) showNotice(`${joined.name || "Someone"} joined the room.`);
          });
          await channel.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              await channel.track({ userId: currentUserId, peerId: openedPeerId, name: authData.user.email?.split("@")[0] || "Guest" });
            }
          });
        });
        peer.on("call", (connection) => {
          connection.answer(stream);
          connectionsRef.current.set(connection.peer, connection);
          connection.on("stream", (remoteStream) => {
            const participant = participantsRef.current.find((item) => item.peerId === connection.peer) || { userId: connection.peer, peerId: connection.peer, name: "Guest" };
            addRemoteStream(participant, remoteStream);
          });
          connection.on("close", () => setRemoteVideos((current) => current.filter((video) => video.peerId !== connection.peer)));
        });
        peer.on("error", (peerError) => setError(peerError.message));
      } catch (mediaError) {
        setError(mediaError instanceof Error ? mediaError.message : "Camera and microphone access is required.");
      }
    }

    void enterRoom();
    return () => {
      active = false;
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      peerRef.current?.destroy();
      if (channelRef.current) void supabase.removeChannel(channelRef.current);
      connections.clear();
    };
  }, [addRemoteStream, callParticipant, roomId, router, showNotice, supabase]);

  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/video-grind/${roomId}` : "";
  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Join my Better Clock video grind", url: inviteUrl });
      return;
    }
    await copyLink();
  };

  const toggleMute = () => {
    const next = !muted;
    localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = !next; });
    setMuted(next);
  };
  const toggleCamera = () => {
    const next = !cameraOff;
    localStreamRef.current?.getVideoTracks().forEach((track) => { track.enabled = !next; });
    setCameraOff(next);
  };
  const leaveRoom = async () => {
    setLeaving(true);
    await supabase.from("video_room_members").delete().eq("room_id", roomId).eq("user_id", userId);
    router.push("/video-grind");
  };

  if (error) return <RoomMessage message={error} onBack={() => router.push("/video-grind")} />;
  if (!room) return <RoomMessage message="Opening your video room..." />;

  const shownVideos = remoteVideos.slice(0, visibleCount);
  return (
    <main className="min-h-screen bg-[#171714] px-4 py-5 text-[#f9f7f0] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
          <div><p className="text-[10px] uppercase tracking-[.2em] text-[#d8ff3f]/70">Live room</p><h1 className="mt-1 text-xl font-semibold">Video Grind</h1></div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">{participants.length || 1} / {room.max_participants} connected</span>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={() => void shareLink()} className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:bg-white/[.08]">Share link</button>
            <button type="button" onClick={copyLink} className="rounded-full bg-[#d8ff3f] px-4 py-2 text-xs font-semibold text-[#171714]">{copied ? "Link copied" : "Copy invite link"}</button>
            <button type="button" onClick={() => void leaveRoom()} disabled={leaving} className="rounded-full border border-red-300/30 px-4 py-2 text-xs text-red-200 transition hover:bg-red-400/10">{leaving ? "Leaving..." : "Leave room"}</button>
          </div>
        </header>
        {notice && <div role="status" className="mt-4 rounded-xl border border-[#d8ff3f]/20 bg-[#d8ff3f]/10 px-4 py-3 text-sm text-[#efffb5]">{notice}</div>}
        <section className="mt-5 min-h-0 flex-1">
          <div onScroll={(event) => { const target = event.currentTarget; if (target.scrollTop + target.clientHeight >= target.scrollHeight - 80) setVisibleCount((count) => Math.min(count + 6, remoteVideos.length)); }} className="grid max-h-[calc(100vh-13rem)] min-h-[18rem] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            <VideoTile label="You" stream={null} videoRef={localVideoRef} muted cameraOff />
            {shownVideos.map((video) => <VideoTile key={video.peerId} label={video.name} stream={video.stream} />)}
            {remoteVideos.length === 0 && <div className="col-span-full flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-white/15 text-sm text-white/45">Your invite is ready. Waiting for people to join.</div>}
          </div>
        </section>
        <footer className="mt-4 flex items-center justify-center gap-3 border-t border-white/10 pt-4">
          <button type="button" onClick={toggleMute} className={`rounded-full px-5 py-2.5 text-sm ${muted ? "bg-red-400 text-[#171714]" : "bg-white/10 text-white"}`}>{muted ? "Unmute" : "Mute"}</button>
          <button type="button" onClick={toggleCamera} className={`rounded-full px-5 py-2.5 text-sm ${cameraOff ? "bg-red-400 text-[#171714]" : "bg-white/10 text-white"}`}>{cameraOff ? "Start camera" : "Stop camera"}</button>
        </footer>
      </div>
    </main>
  );
}

function VideoTile({ label, stream, videoRef, muted = false, cameraOff = false }: { label: string; stream: MediaStream | null; videoRef?: React.RefObject<HTMLVideoElement | null>; muted?: boolean; cameraOff?: boolean }) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef || internalRef;
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream; }, [ref, stream]);
  return <article className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#25251f] shadow-[0_16px_40px_rgba(0,0,0,.2)]"><video ref={ref} autoPlay playsInline muted={muted} className={`h-full w-full object-cover ${cameraOff ? "opacity-0" : "opacity-100"}`} /><div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8 text-sm"><span>{label}</span>{cameraOff && <span className="text-xs text-white/55">Camera off</span>}</div></article>;
}

function RoomMessage({ message, onBack }: { message: string; onBack?: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#171714] px-4 text-[#f9f7f0]"><section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.07] p-7 text-center backdrop-blur-2xl"><p className="text-sm text-white/65">{message}</p>{onBack && <button onClick={onBack} className="mt-5 rounded-xl bg-[#d8ff3f] px-5 py-2.5 text-sm font-medium text-[#171714]">Back to Video Grind</button>}</section></main>;
}

import { useState, useCallback, useRef } from 'react';
import Peer from 'peerjs';

export const useMultiplayer = () => {
    // Connection states: disconnected, hosting, joining, connected
    const [connectionState, setConnectionState] = useState('disconnected');
    const [roomId, setRoomId] = useState(null);
    const [opponentData, setOpponentData] = useState(null);
    const [opponentStartSync, setOpponentStartSync] = useState(null); // Used to sync word seeds

    const peerRef = useRef(null);
    const connRef = useRef(null);

    const setupConnectionListeners = useCallback((conn) => {
        conn.on('data', (data) => {
            if (data.type === 'progress') {
                setOpponentData(data.payload);
            } else if (data.type === 'start') {
                setOpponentStartSync(data.payload);
            }
        });

        conn.on('close', () => {
            setConnectionState('disconnected');
            setOpponentData(null);
        });

        conn.on('error', (err) => {
            console.error('Connection error:', err);
            setConnectionState('disconnected');
        });
    }, []);

    const hostRoom = useCallback(() => {
        setConnectionState('hosting');

        // Generate a simple 4 letter/number ID for easy sharing
        const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
        const peerId = `typebro-${shortId}`;

        const peer = new Peer(peerId);

        peer.on('open', (id) => {
            setRoomId(shortId);
        });

        peer.on('connection', (conn) => {
            // A guest has connected!
            connRef.current = conn;
            setConnectionState('connected');
            setupConnectionListeners(conn);
        });

        peerRef.current = peer;
    }, [setupConnectionListeners]);

    const joinRoom = useCallback((hostId) => {
        setConnectionState('joining');

        const peer = new Peer();
        peerRef.current = peer;

        peer.on('open', () => {
            const targetId = `typebro-${hostId.toUpperCase()}`;
            const conn = peer.connect(targetId);

            conn.on('open', () => {
                connRef.current = conn;
                setConnectionState('connected');
                setRoomId(hostId.toUpperCase());
                setupConnectionListeners(conn);
            });

            conn.on('error', (err) => {
                console.error('Connection failed:', err);
                setConnectionState('disconnected');
            });
        });
    }, [setupConnectionListeners]);

    const sendProgress = useCallback((payload) => {
        if (connRef.current && connRef.current.open) {
            connRef.current.send({ type: 'progress', payload });
        }
    }, []);

    const sendStartSync = useCallback((payload) => {
        if (connRef.current && connRef.current.open) {
            connRef.current.send({ type: 'start', payload });
        }
    }, []);

    const disconnect = useCallback(() => {
        if (connRef.current) connRef.current.close();
        if (peerRef.current) peerRef.current.destroy();
        setConnectionState('disconnected');
        setRoomId(null);
        setOpponentData(null);
    }, []);

    return {
        connectionState,
        roomId,
        opponentData,
        opponentStartSync,
        hostRoom,
        joinRoom,
        sendProgress,
        sendStartSync,
        disconnect
    };
};

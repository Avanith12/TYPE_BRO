import React, { useState } from 'react';

const Lobby = ({ multiplayer, startMultiplayerTest }) => {
    const { connectionState, roomId, hostRoom, joinRoom, disconnect } = multiplayer;
    const [joinId, setJoinId] = useState('');

    if (connectionState === 'connected') {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem', animation: 'smooth-slide 0.5s ease' }}>
                <h2 style={{ color: 'var(--main-color)' }}>Player Connected!</h2>
                <p style={{ color: 'var(--sub-color)', margin: '1rem 0 2rem' }}>Both players are in the room.</p>
                {roomId && <p style={{ color: 'var(--sub-alt-color)' }}>Room ID: {roomId}</p>}

                <div style={{ marginTop: '2rem' }}>
                    <button className="restart-btn" onClick={startMultiplayerTest}>
                        Start Race (Host)
                    </button>

                    <button className="restart-btn" style={{ marginLeft: '1rem', background: 'transparent', border: '1px solid var(--sub-alt-color)' }} onClick={disconnect}>
                        Leave Room
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '4rem', animation: 'smooth-slide 0.5s ease' }}>
            <h2 style={{ color: 'var(--text-color)', marginBottom: '2rem' }}>Multiplayer Race (Peer-to-Peer)</h2>
            <p style={{ color: 'var(--sub-color)', marginBottom: '3rem', fontSize: '0.9rem' }}>
                Race against a friend in real-time. No accounts or central servers required.
            </p>

            <div style={{ display: 'flex', gap: '4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {/* Host Section */}
                <div style={{ padding: '2rem', background: 'var(--bg-color)', border: '2px solid var(--sub-alt-color)', borderRadius: '8px', minWidth: '250px' }}>
                    <h3 style={{ color: 'var(--main-color)', marginBottom: '1rem' }}>Create Private Room</h3>
                    {connectionState === 'hosting' ? (
                        <>
                            <p style={{ color: 'var(--sub-color)', marginBottom: '1rem' }}>Waiting for opponent...</p>
                            <div style={{ background: 'var(--sub-alt-color)', color: 'var(--text-color)', padding: '1rem', borderRadius: '4px', fontSize: '1.5rem', letterSpacing: '4px', fontFamily: 'monospace' }}>
                                {roomId || '...'}
                            </div>
                            <button className="restart-btn" style={{ marginTop: '1rem', background: 'var(--error-color)' }} onClick={disconnect}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button className="restart-btn" onClick={hostRoom} disabled={connectionState !== 'disconnected'}>
                            Host Game
                        </button>
                    )}
                </div>

                {/* Join Section */}
                <div style={{ padding: '2rem', background: 'var(--bg-color)', border: '2px solid var(--sub-alt-color)', borderRadius: '8px', minWidth: '250px' }}>
                    <h3 style={{ color: 'var(--main-color)', marginBottom: '1rem' }}>Join Private Room</h3>
                    {connectionState === 'joining' ? (
                        <>
                            <p style={{ color: 'var(--sub-color)' }}>Connecting...</p>
                            <button className="restart-btn" style={{ marginTop: '1rem', background: 'var(--error-color)' }} onClick={disconnect}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="Enter 4-digit code"
                                value={joinId}
                                onChange={e => setJoinId(e.target.value)}
                                style={{
                                    padding: '0.8rem',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: 'var(--sub-alt-color)',
                                    color: 'var(--text-color)',
                                    fontFamily: 'monospace',
                                    fontSize: '1.2rem',
                                    textAlign: 'center',
                                    width: '100%',
                                    textTransform: 'uppercase'
                                }}
                                maxLength={4}
                            />
                            <button className="restart-btn" onClick={() => joinRoom(joinId)} disabled={joinId.length !== 4 || connectionState !== 'disconnected'}>
                                Join Game
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Lobby;

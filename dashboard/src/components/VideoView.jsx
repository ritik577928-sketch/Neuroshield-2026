import React, { useState, useRef, useEffect } from 'react'
import { 
  Film, 
  CheckCircle, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Maximize2, 
  RotateCcw 
} from './Icons.jsx'

export default function VideoView() {
  const videoRef = useRef(null)
  const cardRef = useRef(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(1.0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showUnmutePrompt, setShowUnmutePrompt] = useState(true)

  // Direct static path in public/video
  const videoSrc = '/video/3d-model-neuroshield.mp4'

  // Initialize playback safely on mount
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Initialize volume & muted state in DOM properties
    video.muted = true
    video.volume = 1.0

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true)
          setIsLoading(false)
        })
        .catch((err) => {
          console.warn('Autoplay initiated in muted fallback state:', err)
          setIsPlaying(false)
          setIsLoading(false)
        })
    }
  }, [])

  // Time & progress updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setIsLoading(false)
    }
  }

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Audio unmute / enable sound
  const enableAudio = () => {
    if (!videoRef.current) return
    videoRef.current.muted = false
    videoRef.current.volume = 1.0
    setIsMuted(false)
    setVolume(1.0)
    setShowUnmutePrompt(false)
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error)
    }
  }

  // Audio mute toggle
  const toggleMute = () => {
    if (!videoRef.current) return
    const nextMuted = !isMuted
    videoRef.current.muted = nextMuted
    setIsMuted(nextMuted)
    if (!nextMuted) {
      setShowUnmutePrompt(false)
      if (volume === 0) {
        setVolume(1.0)
        videoRef.current.volume = 1.0
      }
    }
  }

  // Volume slider change
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value)
    setVolume(newVol)
    if (!videoRef.current) return
    videoRef.current.volume = newVol
    if (newVol > 0 && isMuted) {
      videoRef.current.muted = false
      setIsMuted(false)
      setShowUnmutePrompt(false)
    } else if (newVol === 0 && !isMuted) {
      videoRef.current.muted = true
      setIsMuted(true)
    }
  }

  // Scrub bar seek
  const handleSeek = (e) => {
    const targetTime = parseFloat(e.target.value)
    setCurrentTime(targetTime)
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime
    }
  }

  // Rewind to start
  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error)
    }
  }

  // Fullscreen
  const toggleFullscreen = () => {
    const el = cardRef.current || videoRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen()
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    } else {
      if (document.exitFullscreen) document.exitFullscreen()
    }
  }

  // Helper format seconds -> mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="video-section-viewport">
      <div className="video-theater-card" ref={cardRef}>
        
        {/* Card Header */}
        <div className="theater-header">
          <div className="theater-header-left">
            <Film size={18} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <div className="theater-title">NeuroShield — 3D Pipeline Trajectory</div>
              <div className="theater-subtitle">
                3d-Model Neuroshield Video.mp4 • 1080p • 48kHz AAC Stereo
              </div>
            </div>
          </div>

          <div className="theater-header-right">
            {/* Quick Unmute Action in Header */}
            {isMuted ? (
              <button 
                className="audio-status-btn muted" 
                onClick={enableAudio}
                title="Click to enable 48kHz audio track"
              >
                <VolumeX size={15} />
                <span>UNMUTE AUDIO</span>
              </button>
            ) : (
              <div className="audio-status-btn active" title="Audio active">
                <Volume2 size={15} />
                <span>AUDIO ACTIVE ({Math.round(volume * 100)}%)</span>
              </div>
            )}

            <div className="stat-chip theater-chip">
              <CheckCircle size={13} style={{ color: 'var(--status-success)' }} />
              <span className="stat-chip-value" style={{ color: 'var(--status-success)' }}>AUTHENTIC ASSET</span>
            </div>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="theater-screen">
          {isLoading && !hasError && (
            <div className="video-loading-overlay">
              <div className="video-spinner" />
              <span>INITIALIZING 1080p VIDEO STREAM...</span>
            </div>
          )}

          {hasError ? (
            <div className="video-error-banner">
              <AlertTriangle size={32} style={{ margin: '0 auto 12px' }} />
              <h4 style={{ marginBottom: '8px', color: '#fff' }}>Video Stream Playback Notice</h4>
              <p style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                Unable to load the local video source directly. Please ensure the asset file 
                <code style={{ margin: '0 4px' }}>3d-Model Neuroshield Video.mp4</code> is present in the video directory.
              </p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="theater-video"
                src={videoSrc}
                playsInline
                loop
                onClick={isMuted ? enableAudio : togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => {
                  setIsLoading(false)
                  setIsPlaying(true)
                }}
                onPause={() => setIsPlaying(false)}
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
              />

              {/* High-visibility Unmute Prompt Banner */}
              {showUnmutePrompt && isMuted && !isLoading && (
                <div className="unmute-floating-banner" onClick={enableAudio}>
                  <div className="pulse-speaker">
                    <VolumeX size={20} />
                  </div>
                  <div className="banner-text">
                    <div className="banner-heading">Audio Is Currently Muted</div>
                    <div className="banner-sub">Click here or on the video to enable full 48kHz sound</div>
                  </div>
                  <button className="banner-btn" onClick={enableAudio}>
                    Enable Sound
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Integrated Player Control Bar */}
        <div className="theater-controls-bar">
          <div className="ctrl-left-group">
            <button 
              className="player-ctrl-btn primary-play" 
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <button 
              className="player-ctrl-btn" 
              onClick={handleRestart}
              title="Restart from beginning"
              aria-label="Restart"
            >
              <RotateCcw size={15} />
            </button>

            <div className="timeline-timer">
              <span>{formatTime(currentTime)}</span>
              <span className="timer-sep">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Scrubber / Progress slider */}
          <div className="scrubber-track-container">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="video-scrubber"
              aria-label="Video timeline scrubber"
            />
          </div>

          <div className="ctrl-right-group">
            {/* Audio Volume Controls */}
            <div className="volume-control-block">
              <button 
                className={`player-ctrl-btn ${isMuted ? 'muted-warn' : ''}`}
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                aria-label="Volume slider"
              />
            </div>

            <div className="ctrl-divider" />

            <button 
              className="player-ctrl-btn" 
              onClick={toggleFullscreen}
              title="Fullscreen"
              aria-label="Fullscreen"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>

        {/* Technical Metadata Footer */}
        <div className="theater-footer">
          <div className="meta-badge">
            <span className="meta-k">Source:</span>
            <span className="meta-v">3d-Model Neuroshield Video.mp4</span>
          </div>
          <div className="meta-badge">
            <span className="meta-k">Dimensions:</span>
            <span className="meta-v">1920 × 1080 (16:9)</span>
          </div>
          <div className="meta-badge">
            <span className="meta-k">Audio Stream:</span>
            <span className="meta-v">AAC Stereo (48000 Hz, 16-bit)</span>
          </div>
          <div className="meta-badge">
            <span className="meta-k">Engine:</span>
            <span className="meta-v">React Three Fiber WebGL</span>
          </div>
        </div>

      </div>
    </div>
  )
}

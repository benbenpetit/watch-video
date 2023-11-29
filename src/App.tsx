import clsx from 'clsx'
import gsap from 'gsap'
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import Thumbnail from './assets/thumbnail.jpg'
import Video from './assets/video.mp4'
import './main.scss'

const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b

const App = () => {
  const requestRef = useRef(0)
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [lerpMousePos, setLerpMousePos] = useState({ x: 0, y: 0 })
  const thumbnailElRef = useRef<HTMLVideoElement>(null)
  const videoElRef = useRef<HTMLVideoElement>(null)
  const timeElRef = useRef<HTMLDivElement>(null)
  const volumeElRef = useRef<HTMLDivElement>(null)
  const thumbnailOffset = useMemo(
    () => ({
      x: windowDimensions.width / 12,
      y: windowDimensions.height / 12,
    }),
    [windowDimensions]
  )
  const [thumbnailPlayPos, setThumbnailPlayPos] = useState({
    x: 0,
    y: 0,
  })
  const [isInsideThumbnail, setIsInsideThumbnail] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDraggingTime, setIsDraggingTime] = useState(false)
  const [isDraggingVolume, setIsDraggingVolume] = useState(false)
  const timerTimeoutRef = useRef<number | null>(null)
  const [isOverVideo, setIsOverVideo] = useState(false)
  const [isOverControls, setIsOverControls] = useState(false)
  const [isShowControls, setIsShowControls] = useState(false)

  useEffect(() => {
    const raf = () => {
      setLerpMousePos({
        x: lerp(lerpMousePos.x, mousePos.x, 0.075),
        y: lerp(lerpMousePos.y, mousePos.y, 0.075),
      })

      if (isInsideThumbnail) {
        setThumbnailPlayPos({
          x:
            lerpMousePos.x -
            (thumbnailElRef.current?.getBoundingClientRect().left || 0),
          y:
            lerpMousePos.y -
            (thumbnailElRef.current?.getBoundingClientRect().top || 0),
        })
      }

      requestRef.current = requestAnimationFrame(raf)
    }

    requestRef.current = requestAnimationFrame(raf)

    return () => cancelAnimationFrame(requestRef.current)
  }, [mousePos, lerpMousePos, isInsideThumbnail])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleOpenModal = () => {
    setIsModalOpen(true)
    gsap.to('.modal', {
      y: 0,
      duration: 0.85,
      ease: 'power4.inOut',
      onComplete: () => {
        videoElRef.current!.play()
        setIsPlaying(true)
      },
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    gsap.to('.modal', {
      y: '100%',
      duration: 0.65,
      ease: 'power4.inOut',
      onComplete: () => {
        videoElRef.current!.currentTime = 0
        videoElRef.current!.pause()
        setIsPlaying(false)
      },
    })
  }

  const setVideoTime = (mouseX: number) => {
    const percentage =
      (mouseX - (timeElRef.current?.getBoundingClientRect().left || 0)) /
      (timeElRef.current?.getBoundingClientRect().width || 0)
    videoElRef.current!.currentTime =
      (videoElRef.current?.duration || 0) * percentage
  }

  const handleTimeMouseDown = (e: React.MouseEvent) => {
    videoElRef.current!.pause()
    setVideoTime(e.clientX)
    setIsPlaying(false)
    setIsDraggingTime(true)
  }

  useEffect(() => {
    const handleTimeMouseMove = (e: MouseEvent) => {
      if (isDraggingTime) {
        setVideoTime(e.clientX)
      }
    }

    const handleTimeMouseUp = () => {
      if (!isPlaying && isDraggingTime) {
        videoElRef.current!.play()
        setIsPlaying(true)
        setIsDraggingTime(false)
      }
    }

    window.addEventListener('mousemove', handleTimeMouseMove)
    window.addEventListener('mouseup', handleTimeMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleTimeMouseMove)
      window.removeEventListener('mouseup', handleTimeMouseUp)
    }
  }, [isPlaying, isDraggingTime])

  const handlePlayPauseClick = () => {
    if (isPlaying) {
      videoElRef.current!.pause()
      setIsPlaying(false)
    } else {
      videoElRef.current!.play()
      setIsPlaying(true)
    }
  }

  const setVideoVolume = (mouseY: number) => {
    const percentage =
      (mouseY - (volumeElRef.current?.getBoundingClientRect().top || 0)) /
      (volumeElRef.current?.getBoundingClientRect().height || 0)
    // max volume is 0.5 and min volume is 0
    videoElRef.current!.volume = (1 - Math.max(0, Math.min(1, percentage))) / 2
  }

  const handleVolumeMouseDown = (e: React.MouseEvent) => {
    setVideoVolume(e.clientY)
    setIsDraggingVolume(true)
  }

  useEffect(() => {
    const handleVolumeMouseMove = (e: MouseEvent) => {
      if (isDraggingVolume) {
        setVideoVolume(e.clientY)
      }
    }

    const handleVolumeMouseUp = () => {
      if (isDraggingVolume) {
        setIsDraggingVolume(false)
      }
    }

    window.addEventListener('mousemove', handleVolumeMouseMove)
    window.addEventListener('mouseup', handleVolumeMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleVolumeMouseMove)
      window.removeEventListener('mouseup', handleVolumeMouseUp)
    }
  }, [isDraggingVolume])

  const handleVideoPlayerMouseEnter = () => {
    setIsOverVideo(true)
  }

  const handleVideoPlayerMouseMove = () => {
    setIsOverVideo(true)

    if (timerTimeoutRef.current) {
      clearTimeout(timerTimeoutRef.current)
    }

    timerTimeoutRef.current = setTimeout(() => {
      setIsOverVideo(false)
    }, 1000)
  }

  const handleVideoPlayerMouseLeave = () => {
    setIsOverVideo(false)
  }

  useEffect(() => {
    if (isOverVideo || isOverControls) {
      if (isShowControls) return
      gsap.to('.controls', {
        opacity: 1,
        duration: 0.3,
        ease: 'power4.inOut',
        onStart: () => {
          setIsShowControls(true)
        },
      })
    } else {
      if (!isShowControls || isDraggingTime || isDraggingVolume) return
      gsap.to('.controls', {
        opacity: 0,
        duration: 0.3,
        ease: 'power4.inOut',
        onComplete: () => {
          setIsShowControls(false)
        },
      })
    }
  }, [
    isOverVideo,
    isOverControls,
    isShowControls,
    isDraggingTime,
    isDraggingVolume,
  ])

  return (
    <div
      style={
        {
          '--vw': windowDimensions.width / 100 + 'px',
          '--vh': windowDimensions.height / 100 + 'px',
        } as CSSProperties
      }
    >
      <header>
        <a
          href="https://www.benjamingeffroy.com/la-plante-sauvage"
          target="_blank"
        >
          Benjamin Geffroy
        </a>
      </header>
      <main>
        <section className="left">
          <h1>La planète sauvage</h1>
          <span>Direction & Animation: Benjamin Geffroy</span>
        </section>
        <div
          className="picture-container"
          style={{
            transform: `translate3d(${
              -thumbnailOffset.x +
              (thumbnailOffset.x * lerpMousePos.x) / windowDimensions.width
            }px, ${
              -thumbnailOffset.y +
              (thumbnailOffset.y * lerpMousePos.y) / windowDimensions.height
            }px, 0)`,
          }}
          onMouseEnter={() => setIsInsideThumbnail(true)}
          onMouseLeave={() => setIsInsideThumbnail(false)}
          onClick={() => handleOpenModal()}
        >
          <div
            className="play-button"
            style={{
              left: `${thumbnailPlayPos.x}px`,
              top: `${thumbnailPlayPos.y}px`,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <figure ref={thumbnailElRef}>
            <img src={Thumbnail} alt="Grosse tête bleu de la planète sauvage" />
          </figure>
        </div>
        <span
          className={clsx('backdrop', isModalOpen && 'is-active')}
          onClick={() => handleCloseModal()}
        />
        <div className="modal">
          <div
            className="video-player"
            onMouseEnter={() => handleVideoPlayerMouseEnter()}
            onMouseLeave={() => handleVideoPlayerMouseLeave()}
            onMouseMove={() => handleVideoPlayerMouseMove()}
          >
            <video
              ref={videoElRef}
              onClick={() => handlePlayPauseClick()}
              crossOrigin="anonymous"
              loop
              onLoadStart={() => {
                videoElRef.current!.volume = 0.5
              }}
            >
              <source src={Video} type="video/mp4" />
            </video>
            <div
              className="controls"
              onMouseEnter={() => setIsOverControls(true)}
              onMouseLeave={() => setIsOverControls(false)}
            >
              <button
                className="play-pause"
                onClick={() => handlePlayPauseClick()}
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <div
                className="time"
                onMouseDown={handleTimeMouseDown}
                ref={timeElRef}
              >
                <span
                  className="time__inside"
                  style={{
                    width: `${
                      ((videoElRef.current?.currentTime || 0) /
                        (videoElRef.current?.duration || 0)) *
                      100
                    }%`,
                  }}
                />
              </div>
              <div className={clsx('volume', isDraggingVolume && 'is-active')}>
                <svg
                  onClick={() => {
                    if (videoElRef.current!.volume > 0) {
                      videoElRef.current!.volume = 0
                    } else {
                      videoElRef.current!.volume = 0.25
                    }
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                  <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                </svg>
                <div
                  className="volume__bar"
                  onMouseDown={handleVolumeMouseDown}
                  ref={volumeElRef}
                >
                  <span
                    className="volume__bar__inside"
                    style={{
                      height: `${(videoElRef.current?.volume || 0) * 100 * 2}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

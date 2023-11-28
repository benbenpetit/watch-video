import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import Video from './assets/video.mp4'
import Thumbnail from './assets/thumbnail.jpg'
import './main.scss'
import gsap from 'gsap'
import clsx from 'clsx'

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
  const videoOffset = useMemo(
    () => ({
      x: windowDimensions.width / 12,
      y: windowDimensions.height / 12,
    }),
    [windowDimensions]
  )
  const [videoPlayPos, setVideoPlayPos] = useState({
    x: 0,
    y: 0,
  })
  const [isInsideVideoPopup, setIsInsideVideoPopup] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const raf = () => {
      setLerpMousePos({
        x: lerp(lerpMousePos.x, mousePos.x, 0.075),
        y: lerp(lerpMousePos.y, mousePos.y, 0.075),
      })

      if (isInsideVideoPopup) {
        setVideoPlayPos({
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
  }, [mousePos, lerpMousePos])

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
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    gsap.to('.modal', {
      y: '100%',
      duration: 0.85,
      ease: 'power4.inOut',
    })
  }

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
              -videoOffset.x +
              (videoOffset.x * lerpMousePos.x) / windowDimensions.width
            }px, ${
              -videoOffset.y +
              (videoOffset.y * lerpMousePos.y) / windowDimensions.height
            }px, 0)`,
          }}
          onMouseEnter={() => setIsInsideVideoPopup(true)}
          onMouseLeave={() => setIsInsideVideoPopup(false)}
          onClick={() => handleOpenModal()}
        >
          <div
            className="play-button"
            style={{ left: `${videoPlayPos.x}px`, top: `${videoPlayPos.y}px` }}
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
          <div className="video-player">
            <video
              onClick={() => setIsPlaying(!isPlaying)}
              crossOrigin="anonymous"
              autoPlay={false}
            >
              <source src={Video} type="video/mp4" />
            </video>
            <div className="controls">
              <button
                className="play-pause"
                onClick={() => setIsPlaying(!isPlaying)}
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
              <div className="time">
                <span className="time__inside" />
              </div>
              <div className="volume">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                  <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                </svg>
                <div className="volume__bar">
                  <span className="volume__bar__inside" />
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

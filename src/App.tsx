import { useEffect, useMemo, useRef, useState } from 'react'
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
  const videoElRef = useRef<HTMLVideoElement>(null)
  const videoOffset = useMemo(
    () => ({
      x: windowDimensions.width / 12,
      y: windowDimensions.height / 12,
    }),
    [windowDimensions]
  )
  const videoDimensions = useMemo(
    () => ({
      width: videoElRef.current?.getBoundingClientRect().width || 0,
      height: videoElRef.current?.getBoundingClientRect().height || 0,
    }),
    [videoElRef.current]
  )

  useEffect(() => {
    const raf = () => {
      setLerpMousePos({
        x: lerp(lerpMousePos.x, mousePos.x, 0.1),
        y: lerp(lerpMousePos.y, mousePos.y, 0.1),
      })

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

  return (
    <>
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
          className="video-container"
          style={{
            transform: `translate3d(${
              -videoOffset.x +
              (videoOffset.x * lerpMousePos.x) / windowDimensions.width
            }px, ${
              -videoOffset.y +
              (videoOffset.y * lerpMousePos.y) / windowDimensions.height
            }px, 0)`,
          }}
        >
          <video ref={videoElRef} crossOrigin="anonymous">
            <source src={Video} type="video/mp4" />
          </video>
        </div>
      </main>
    </>
  )
}

export default App

import Video from './assets/video.mp4'
import './main.scss'

const App = () => {
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
        <div className="video-container">
          <video crossOrigin="anonymous">
            <source src={Video} type="video/mp4" />
          </video>
        </div>
      </main>
    </>
  )
}

export default App

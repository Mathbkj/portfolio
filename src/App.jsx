import { useState } from 'react'
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'

function App() {

  return (
    <ReactLenis root>
      <Navbar />
      <Hero />
    </ReactLenis>
  )
}

export default App

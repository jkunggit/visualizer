import React, { useState } from 'react'
import { useSpring, animated } from 'react-spring'
import { isBrowser, isMobile } from 'react-device-detect'

import Visualizer from '../components/Visualizer'
import DatGuiControl from '../components/DatGuiControl'

const Index = () => {
  const [isToggled, setToggled] = useState(false)
  const fade = useSpring({
    width: isToggled ? '0px' : '300px',
    config: { duration: 1000, delay: 100 }
  })

  return (
    <main className='main-container'>
      <Visualizer full={isToggled} />
      <DatGuiControl />
    </main>
  )
}

export default Index

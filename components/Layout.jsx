import { useState } from 'react'

import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'
import { VisualizerContext } from '../contexts/VisualizerContext.js'

const Layout = props => {
  const initialState = {
    activeComposer: null, // object
    scenes: null, // array
    renderer: null, // object
    showGuiControl: true,
    // gui control properties
    properties: {
      activeScene: '', // default selected
      activeSceneMesh: '',
      activeSceneLight: '',
      lightIntensity: '',
      lightDistance: '',
      lightDecay: '',
      color: '',
      // toggle settings
      showOutline: true
    }
  }
  const [data, setData] = useState(initialState)
  return (
    <>
      <Head>
        <title>Your Header Title</title>
      </Head>
      <VisualizerContext.Provider value={{ dataState: data, setDataState: setData }}>
        <Header />
        {props.children}
      </VisualizerContext.Provider>
      <Footer />
    </>
  )
}
export default Layout

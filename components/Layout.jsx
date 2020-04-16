import { useState } from 'react'

import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'
import { VisualizerContext } from '../contexts/VisualizerContext.js'

const Layout = props => {
  const initialState = {
    scene: null,
    composer: null,
    renderer: null,
    camera: null,
    showGuiControl: true,
    properties: {
      text: 'input',
      bool: true,
      color: '#2FA1D6'
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

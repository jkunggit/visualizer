import { useContext, createRef } from 'react'
import DatGui, { DatBoolean, DatColor, DatNumber, DatString } from 'react-dat-gui'
import Draggable from 'react-draggable'
import { isMobile } from 'react-device-detect'

import { VisualizerContext } from '../contexts/VisualizerContext'
import { useSpring, animated, config } from 'react-spring'

const DatGuiControl = () => {
  const { dataState, setDataState } = useContext(VisualizerContext)

  const handleUpdate = (newData) => {
    // update the object
    const object = dataState.scene.getObjectByName('myCube')
    object.material.color.set(newData.color)

    setDataState(
      (prevState) => ({
        ...prevState, 
        properties: newData
      })
    )
  }

  const closeHandler = () => {
    setDataState(
      (prevState) => ({
        ...prevState,
        showGuiControl: !prevState.showGuiControl
      })
    )
  }

  const animatedDivRef = createRef()
  const animateDatGui = !isMobile
    ? useSpring({
      from: { transform: 'scale(0)', position: 'absolute', width: '300px', top: '0px' },
      to: dataState.showGuiControl ? { transform: 'scale(1)', display: 'block' } : { transform: 'scale(0)' },
      onRest: () => {
        if (!dataState.showGuiControl) {
          animatedDivRef.current.style.display = 'none'
        }
      },
      config: dataState.showGuiControl ? config.wobbly : { duration: 200, delay: 100 }
    }) : null

  const animateToggleBtn = useSpring({
    from: { transform: 'scale(0)' },
    to: !dataState.showGuiControl ? { transform: 'scale(1)' } : { transform: 'scale(0)' },
    config: !dataState.showGuiControl ? config.wobbly : { duration: 200, delay: 100 }
  })

  return (
    <>
      {!dataState.showGuiControl &&
        <animated.div className='toggle-dat-gui-control-btn' style={animateToggleBtn} onClick={closeHandler}>[ Show Gui Control ]</animated.div>
      }
      <animated.div className='animated-draggable' ref={animatedDivRef} style={animateDatGui}>
        <Draggable
          disabled={isMobile}
          handle='header'
          bounds='.visualizer-container'>
          <div className='dat-gui-container'>
            <header>
              <div className='header-label'>3D GUI Control</div>
              <div className='close-btn' onClick={closeHandler}>Close</div>
            </header>
            <DatGui data={dataState.properties} onUpdate={handleUpdate}>
              <DatString path='text' label='Some Input' />
              <DatBoolean path='bool' label='Some Boolean' />
              <DatColor path='color' label='color' />
            </DatGui>
          </div>
        </Draggable>
      </animated.div>
    </>
  )
}

export default DatGuiControl

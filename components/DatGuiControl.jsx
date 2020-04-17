import { useContext, createRef } from 'react'
import DatGui, { DatBoolean, DatColor, DatNumber, DatString, DatSelect, DatFolder } from 'react-dat-gui'
import Draggable from 'react-draggable'
import { isMobile } from 'react-device-detect'

import { VisualizerContext } from '../contexts/VisualizerContext'
import { useSpring, animated, config } from 'react-spring'

const DatGuiControl = () => {
  const { dataState, setDataState } = useContext(VisualizerContext)

  const handleUpdate = (newData) => {
    // update the object
    const activeScene = newData.activeScene
    dataState.scenes.activeScene = activeScene
    const scenes = dataState.scenes

    // scene should have at least one mesh
    const activeSceneMesh = newData.activeSceneMesh
    scenes.activeSceneMesh = activeSceneMesh

    let sceneChanged = false

    if (dataState.properties.color !== newData.color) {
      scenes.updateMeshColor(newData.color)
    }

    if (dataState.properties.activeScene !== activeScene) {
      sceneChanged = true
    }

    if (dataState.properties.activeMesh !== activeSceneMesh) {
      // we need to get existing properties of the active mesh
      newData.color = scenes.outlineMesh()
    }

    if (dataState.properties.showOutline !== newData.showOutline || sceneChanged) {
      scenes.showOutline(newData.showOutline)
    }

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
  const animateDatGui = useSpring({
    from: { transform: 'scale(0)', position: 'absolute', width: '300px', top: '0px' },
    to: dataState.showGuiControl ? { transform: 'scale(1)', display: 'block' } : { transform: 'scale(0)' },
    onRest: () => {
      if (!dataState.showGuiControl) {
        animatedDivRef.current.style.display = 'none'
      }
    },
    config: dataState.showGuiControl ? config.wobbly : { duration: 200, delay: 100 }
  })

  const animateToggleBtn = useSpring({
    from: { transform: 'scale(0)' },
    to: !dataState.showGuiControl ? { transform: 'scale(1)' } : { transform: 'scale(0)' },
    config: !dataState.showGuiControl ? config.wobbly : { duration: 200, delay: 100 }
  })

  let sceneNames = []
  let sceneMeshes = []
  if (dataState.scenes) {
    sceneNames = dataState.scenes.sceneNames
    const scene = dataState.scenes.scene()
    sceneMeshes = scene.meshNames
  }

  return (
    <>
      {!dataState.showGuiControl &&
        <animated.div className='toggle-dat-gui-control-btn' style={animateToggleBtn} onClick={closeHandler}>[ Show GUI Control ]</animated.div>
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
              <DatSelect path='activeScene' label='Scene' options={sceneNames} />
              <DatSelect path='activeSceneMesh' label='Object Mesh' options={sceneMeshes} />
              <DatColor path='color' label='color' />
              <DatFolder title='Toggle Settings'>
                <DatBoolean path='showOutline' label='Show Active Outline' />
              </DatFolder>
            </DatGui>
          </div>
        </Draggable>
      </animated.div>
    </>
  )
}

export default DatGuiControl

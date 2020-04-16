import { Component } from 'react'
import * as THREE from 'three'
import { isBrowser, isMobile } from 'react-device-detect'

import { VisualizerContext } from '../contexts/VisualizerContext'

// can't load the es6 modules with
let dynamicallyImportPackage = async () => {
  const OrbitControls = await import('three/examples/jsm/controls/OrbitControls').then(module => module.OrbitControls).catch(e => console.log(e))
  const EffectComposer = await import('three/examples/jsm/postprocessing/EffectComposer.js').then(module => module.EffectComposer).catch(e => console.log(e))
  const ShaderPass = await import('three/examples/jsm/postprocessing/ShaderPass.js').then(module => module.ShaderPass).catch(e => console.log(e))
  const SSAARenderPass = await import('three/examples/jsm/postprocessing/SSAARenderPass.js').then(module => module.SSAARenderPass).catch(e => console.log(e))
  const CopyShader = await import('three/examples/jsm/shaders/CopyShader.js').then(module => module.CopyShader).catch(e => console.log(e))
  return { OrbitControls, EffectComposer, ShaderPass, SSAARenderPass, CopyShader }
}

class Visualizer extends Component {
  constructor (props) {
    super(props)
    this.handleResize = this.handleResize.bind(this)
  }

  static contextType = VisualizerContext
  
  async componentDidMount () {
    const { setDataState } = this.context

    // get the current height and width of the div
    this.width = this.mount.clientWidth
    this.height = this.mount.clientHeight

    window.addEventListener('resize', this.handleResize, false)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(this.width, this.height)

    const { OrbitControls, EffectComposer, ShaderPass, SSAARenderPass, CopyShader } = await dynamicallyImportPackage()
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0)

    // postprocessing
    const composer = new EffectComposer(renderer)
    const ssaaRenderPass = new SSAARenderPass(scene, camera)
    ssaaRenderPass.unbiased = false
    composer.addPass(ssaaRenderPass)

    const copyPass = new ShaderPass(CopyShader)
    composer.addPass(copyPass)

    // use ref as a mount point of the Three.js scene instead of the document.body
    this.mount.appendChild(renderer.domElement)
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    const cube = new THREE.Mesh(geometry, material)
    cube.name = "myCube"
    scene.add(cube)

    // get the properties of the active object
    const properties = {
      color: '#'+cube.material.color.getHexString()
    }
    camera.position.z = 5

    // include the three assets to the context 
    await setDataState(
      (prevState) => ({
        ...prevState,
          properties: {
            ...prevState.properties,
            ...properties
          },
          scene,
          renderer,
          composer, 
          camera
      })
    )
    
    const { dataState } = this.context

    var animate = () => {
      requestAnimationFrame(animate)
      // cube.rotation.x += 0.01
      // cube.rotation.y += 0.01
      // this.renderer.render(scene, this.camera)
      if(dataState.composer){
        dataState.composer.render();
      }
    }
    animate()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize, false)
  }

  handleResize = () => {
    
    this.width = this.mount.clientWidth
    this.height = this.mount.clientHeight
    
    const {camera, renderer, composer } = this.context.dataState
    camera.aspect = this.width / this.height
    
    camera.updateProjectionMatrix()
    renderer.setSize(this.width, this.height)
    composer.setSize(this.width, this.height)
  }

  render () {
    return (
      <div className='visualizer-container'>
        <div className='visualizer' ref={ref => (this.mount = ref)} />
      </div>
    )
  }
}

export default Visualizer

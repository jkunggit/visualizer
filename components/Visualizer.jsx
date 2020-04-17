import { Component } from 'react'
import * as THREE from 'three'
import { isBrowser, isMobile } from 'react-device-detect'

import { VisualizerContext } from '../contexts/VisualizerContext'
import Scenes from '../lib/Scenes'

// can't load the es6 modules with
let dynamicallyImportPackage = async () => {
  const OrbitControls = await import('three/examples/jsm/controls/OrbitControls').then(module => module.OrbitControls).catch(e => console.log(e))
  const EffectComposer = await import('three/examples/jsm/postprocessing/EffectComposer.js').then(module => module.EffectComposer).catch(e => console.log(e))
  const ShaderPass = await import('three/examples/jsm/postprocessing/ShaderPass.js').then(module => module.ShaderPass).catch(e => console.log(e))
  const SSAARenderPass = await import('three/examples/jsm/postprocessing/SSAARenderPass.js').then(module => module.SSAARenderPass).catch(e => console.log(e))
  const CopyShader = await import('three/examples/jsm/shaders/CopyShader.js').then(module => module.CopyShader).catch(e => console.log(e))
  const OutlinePass = await import('three/examples/jsm/postprocessing/OutlinePass.js').then(module => module.OutlinePass).catch(e => console.log(e))
  return { OrbitControls, EffectComposer, ShaderPass, SSAARenderPass, CopyShader, OutlinePass }
}

class Visualizer extends Component {
  constructor (props) {
    super(props)
    this.handleResize = this.handleResize.bind(this)
  }

  static contextType = VisualizerContext
  
  async componentDidMount () {
    const { dataState, setDataState } = this.context

    // get the current height and width of the div
    this.width = this.mount.clientWidth
    this.height = this.mount.clientHeight

    window.addEventListener('resize', this.handleResize, false)

    const camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 3000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(this.width, this.height)

    const { OrbitControls, EffectComposer, ShaderPass, SSAARenderPass, CopyShader, OutlinePass } = await dynamicallyImportPackage()
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0)
    
    const params = { setDataState, THREE, renderer, camera, EffectComposer, ShaderPass, SSAARenderPass, CopyShader, OutlinePass, width: this.width, height: this.height }
    const scenes = new Scenes(params)
  
    const scene = new THREE.Scene()
      
    // use ref as a mount point of the Three.js scene instead of the document.body
    this.mount.appendChild(renderer.domElement)

    let geometry = new THREE.BoxGeometry(1, 1, 1)
    let material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    const cube = new THREE.Mesh(geometry, material)
    cube.name = "myCube"
    cube.position.set(-2,0,0)
    scene.add(cube)

    geometry = new THREE.SphereGeometry( 1, 32, 32 );
    material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.name = 'mySphere'
    sphere.position.set(2,0,0)
    scene.add( sphere );


    var light = new THREE.PointLight( 0xff0000, 1, 100 );
    light.position.set( 50, 50, 50 );
    scene.add( light );
    
    var plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x522d02, opacity: 0.25 } ) );
    plane.visible = true;
    plane.position.set(0,-200,0)
    plane.rotateX( - Math.PI / 2);
    scene.add( plane );


    scenes.add(scene)

    const scene2 = new THREE.Scene()
    scene2.name = 'scene2'

    geometry = new THREE.TorusGeometry( 1, 0.5, 16, 100 );
    material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    var torus = new THREE.Mesh( geometry, material );
    torus.name = 'myTorus'    
    scene2.add( torus )   
  
    scenes.add(scene2)
    console.log(scenes)

    const properties = {
      activeScene: scenes.activeScene,
      activeSceneMesh: scenes.activeSceneMesh,
      color: '#'+cube.material.color.getHexString()
    }
    scenes.showOutline(dataState.properties.showOutline)

    

    // include the three assets to the context 
    await setDataState(
      (prevState) => ({
        ...prevState,
          properties: {
            ...prevState.properties,
            ...properties
          },
          scenes,
          renderer,
          camera
      })
    )

    this.animate()
  }
  
  animate = () => {
    const { dataState } = this.context

    requestAnimationFrame(this.animate)
    if (dataState.scenes.composer) {
      dataState.scenes.composer.render();
    }
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize, false)
  }

  handleResize = () => {
    this.width = this.mount.clientWidth
    this.height = this.mount.clientHeight
    
    const {camera, renderer, activeComposer } = this.context.dataState
    camera.aspect = this.width / this.height
    
    camera.updateProjectionMatrix()
    renderer.setSize(this.width, this.height)
    activeComposer.setSize(this.width, this.height)
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

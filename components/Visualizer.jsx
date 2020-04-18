import { Component } from 'react'
import * as THREE from 'three'
import { isBrowser, isMobile } from 'react-device-detect'
import FPSStats from 'react-stats-zavatta'

import { VisualizerContext } from '../contexts/VisualizerContext'
import Scenes from '../lib/Scenes'
import promisifyLoader from '../lib/promisifyLoader'

// can't load the es6 modules with
let dynamicallyImportPackage = async () => {
  const GLTFLoader = await import('three/examples/jsm/loaders/GLTFLoader.js').then(module => module.GLTFLoader).catch(e => console.log(e))
  const OrbitControls = await import('three/examples/jsm/controls/OrbitControls').then(module => module.OrbitControls).catch(e => console.log(e))
  const EffectComposer = await import('three/examples/jsm/postprocessing/EffectComposer.js').then(module => module.EffectComposer).catch(e => console.log(e))
  const ShaderPass = await import('three/examples/jsm/postprocessing/ShaderPass.js').then(module => module.ShaderPass).catch(e => console.log(e))
  const SSAARenderPass = await import('three/examples/jsm/postprocessing/SSAARenderPass.js').then(module => module.SSAARenderPass).catch(e => console.log(e))
  const RenderPass = await import('three/examples/jsm/postprocessing/RenderPass.js').then(module => module.RenderPass).catch(e => console.log(e))
  const CopyShader = await import('three/examples/jsm/shaders/CopyShader.js').then(module => module.CopyShader).catch(e => console.log(e))
  const OutlinePass = await import('three/examples/jsm/postprocessing/OutlinePass.js').then(module => module.OutlinePass).catch(e => console.log(e))
  return {  GLTFLoader, OrbitControls, EffectComposer, ShaderPass, SSAARenderPass, CopyShader, OutlinePass, RenderPass }
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

    const { GLTFLoader, OrbitControls, EffectComposer, ShaderPass, SSAARenderPass, CopyShader, OutlinePass} = await dynamicallyImportPackage()
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0)
    
    const params = { setDataState, THREE, renderer, camera, EffectComposer, ShaderPass, SSAARenderPass, CopyShader, OutlinePass, width: this.width, height: this.height }
       
    // use ref as a mount point of the Three.js scene instead of the document.body
    this.mount.appendChild(renderer.domElement)

    const scenes = new Scenes(params)

    // Next, we'll convert the GLTFLoader into a GLTFPromiseLoader
    // onProgress is optional and we are not using it here
    const GLTFPromiseLoader = promisifyLoader( new GLTFLoader() );

    // const loader = new GLTFLoader().setPath( '../assets/' );
    const p1 = GLTFPromiseLoader.load('../assets/test.gltf')
    const p2 = GLTFPromiseLoader.load('../assets/test2.gltf')

    const self = this
    Promise.all([p1, p2])
    .then( async gltfArray => {
      // loop over all the loaded scenes
      gltfArray.forEach( gltf => {
        const scene = new THREE.Scene()     
        // we need to move the meshes out of the scene group so the outlinepass does not group them a one. 
        // this causes issue with hiding none selected meshes when using the outlinepass
        let sceneGroup = null
        gltf.scene.traverse( function ( child ) {
          if(child.name === 'Scene'){
            sceneGroup = child
          }
          if (child.type === 'Object3D') {

            console.log('Exclude light', child)
          }
          else {
            scene.children.push(child)
          }
        });   

        // remove the meshes from the scene group
        const meshes = sceneGroup.children.filter(child=>child.type === 'Mesh')
        meshes.forEach(mesh=>sceneGroup.remove(mesh))
        scenes.add(scene)  
      })
      
      const mesh = scenes.scene.threeScene.children.find(child => child.name === scenes.activeSceneMesh)
      const light = scenes.scene.threeScene.children.find(child => child.name === scenes.activeSceneLight)
      const properties = {
        activeScene: scenes.activeScene,
        activeSceneMesh: scenes.activeSceneMesh,
        activeSceneLight: scenes.activeLight,
        lightIntensity: light.intensity,
        lightDistance: light.distance,
        lightDecay: light.decay,
        color: '#'+ mesh.material.color.getHexString()
      }
      // scenes.showOutline(dataState.properties.showOutline)
  
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
      console.log(scenes)

      self.animate()

    })
    .catch(err=>{
      console.log(err)
    });

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
    
    const {camera, renderer, scenes } = this.context.dataState
    const composer = scenes.composer

    camera.aspect = this.width / this.height
    
    camera.updateProjectionMatrix()
    renderer.setSize(this.width, this.height)
    composer.setSize(this.width, this.height)
  }

  render () {
    return (
      <div className='visualizer-container'>
        <div className='stats-container'><FPSStats isActive={true} /> </div>
        <div className='visualizer' ref={ref => (this.mount = ref)} />
      </div>
    )
  }
}

export default Visualizer

class Scenes {
  constructor (params) {
    Object.assign(this, params); //  assign the params to the class properties
    this._scenes = {}
    this._sceneNames = []
    this._activeScene = null
    this._index = 0;
    this.imagePath = '../skybox/'
    this.textureLoader = new this.THREE.TextureLoader();
  }

  get sceneNames () {
    return this._sceneNames
  }

  get activeScene () {
    return this._activeScene
  }

  set activeScene (sceneName) {
    this._activeScene = sceneName
  }

  get activeSceneMesh () {
    return this.scene.activeMesh
  }

  set activeSceneMesh (meshName) {
    // make sure the mesh exists in the scene
    if (this.scene.meshNames.includes(meshName)) {
      this.scene.activeMesh = meshName
    }
  }

  get composer () {
    return this.activeScene ? this.scene.composer : null
  }

  get scene () {
    return this._scenes[this.activeScene]
  } 

  add = (threeScene) => {
    this._index++;
    const sceneName = threeScene.name ? threeScene.name : `Scene ${this._index}`     
    // default the first scene as the active
    if (!this.activeScene) {
      this.activeScene = sceneName
    }

    this.addSkybox(threeScene)

    // postprocessing
    const composer = new this.EffectComposer(this.renderer)
    const ssaaRenderPass = new this.SSAARenderPass(threeScene, this.camera)
    ssaaRenderPass.unbiased = false
    ssaaRenderPass.sampleLevel = 2; 
    composer.addPass(ssaaRenderPass)

    // adds the outline shader
    const outlinePass = new this.OutlinePass( new this.THREE.Vector2( this.width, this.height ), threeScene, this.camera );
    outlinePass.visibleEdgeColor = new this.THREE.Color( 'white' );
    composer.addPass( outlinePass );

    const copyPass = new this.ShaderPass(this.CopyShader)
    composer.addPass(copyPass)

    // store the scene related data to the scenes array 
    const meshNames = []
    for(let i=0; i< threeScene.children.length; i++) {
      const child = threeScene.children[i]

      // exclude the skybox
      if(child.type === 'Mesh' && child.name && child.editable !== false) {
        console.log('returned', child)
        meshNames.push(child.name)
      }
    }
    // default the activeMesh to teh first mesh in the scene
    const activeMesh = meshNames.length ? meshNames[0] : ''
    
    this._scenes[sceneName] = {
      name: sceneName,
      threeScene, 
      composer,
      outlinePass,
      meshNames,
      activeMesh: activeMesh
    }
    this._sceneNames.push(sceneName)
    this.outlineMesh()
  }
  
  updateMeshColor(color) {
    const object = this.scene.threeScene.getObjectByName(this.activeSceneMesh)
    object.material.color.set(color)
  }

  outlineMesh () {
    const mesh = this.scene.threeScene.children.find(child => child.name === this.activeSceneMesh)
    this.scene.outlinePass.selectedObjects = [mesh]
    return  '#' + mesh.material.color.getHexString()
  }

  showOutline (show) {
    this.scene.outlinePass.edgeStrength = show ? 3 : 0
  }

	addSkybox(threeScene){
		var path = this.imagePath;
		var format = '.jpg';
		var urls = [
			path + 'posx' + format, path + 'negx' + format,
			path + 'posy' + format, path + 'negy' + format,
			path + 'posz' + format, path + 'negz' + format
		];

		var skyGeometry = new this.THREE.CubeGeometry( 1000, 1000, 1000 );   
		var materialArray = [];
		for (var i = 0; i < urls.length; i++)
			 materialArray.push( new this.THREE.MeshBasicMaterial({
			 map: this.textureLoader.load(urls[i]),
				  side: this.THREE.BackSide
			 }));
		var skyMaterial = new this.THREE.MultiMaterial( materialArray );
		
		const skyBox = new this.THREE.Mesh( skyGeometry, skyMaterial );
		skyBox.position.set(0,-60,0);
    skyBox.name = "skyBox";	
    skyBox.editable = false
		threeScene.add( skyBox );	
  }
    
}

export default Scenes

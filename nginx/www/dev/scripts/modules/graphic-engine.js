import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'


export class Renderer{
	constructor(){
		this.boardWidth = 4
		this.boardHeight = 3
		this.boardStartX = (this.boardWidth / 2) * -1
		this.boardStartY = (this.boardHeight / 2)
		this.paddleMarging_x = this.boardWidth / 12

		this.bracket = document.getElementById("bracket")
		this.ctx =  this.bracket.getContext("2d")

		this.windowWidth = window.innerWidth
		this.windowHeight = window.innerHeight
		this.textColor = "rgb(43, 194, 14)"

	}

	init (){

		this.initRenderer()
		this.initBloom()
		this.initMaterials()
		this.initGameBoard()
		this.initStars()
		this.initPaddles()
		this.initBall()
		this.initBracket()
		this.initSun()
		this.initLight()
		this.initCameraPos()
		this.initListener()

		this.renderer.setAnimationLoop(this.render.bind(this))
	}
	initRenderer()
	{
		this.canva = document.getElementById('background');
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, this.windowWidth / this.windowHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canva, antialias: true })

		this.renderer.setSize(this.windowWidth, this.windowHeight);
		this.renderer.setClearColor( 0x000000, 1);
		document.body.appendChild(this.renderer.domElement);
		this.renderer.toneMapping = THREE.CineonToneMapping
		this.renderer.toneMappingExposure = 1.5
		this.renderer.outputColorSpace = THREE.SRGBColorSpace
		
	}

	initBloom()
	{
		//Bloom
		this.renderPass = new RenderPass(this.scene, this.camera)
		this.composer = new EffectComposer(this.renderer)
		this.composer.addPass(this.renderPass)
		const fragment_shader = `
		uniform sampler2D baseTexture;
		uniform sampler2D bloomTexture;
		varying vec2 vUv;
		void main() {
			gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
		}
		`
		const vertex_shader = `
		varying vec2 vUv;	
		void main() {
		
			vUv = uv;
		
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		
		}	
		`
		this.bloomPass = new UnrealBloomPass( 
		    new THREE.Vector2(this.windowWidth, this.windowHeight),
		    0.3, //bloom intensity
		    0.1, // bloom radius
		    0.1 // pixel bloom? (experiment)
		    )
		this.composer.addPass(this.bloomPass)
		this.composer.renderToScreen = false
		
		this.mixPass = new ShaderPass(
			new THREE.ShaderMaterial({
				uniforms:{
					baseTexture: {value: null},
		            bloomTexture: {value: this.composer.renderTarget2.texture}
		        },
				vertexShader: vertex_shader,
				fragmentShader: fragment_shader
		    }), 'baseTexture'
		    )
	
		this.finalComposer = new EffectComposer(this.renderer)
		this.finalComposer.addPass(this.renderPass)
		this.finalComposer.addPass(this.mixPass)
		this.outputPass = new OutputPass()//2min
		this.finalComposer.addPass(this.outputPass)
		
		//SELECT BLOOM
		this.BLOOM_SCENE = 1
		this.bloomLayer = new THREE.Layers()
		this.bloomLayer.set(this.BLOOM_SCENE)
		this.darkMaterial = new THREE.MeshBasicMaterial({color: 0x000000})
		this.materials = {}
		
	}

	nonBloomed(obj)
	{
		if (obj.isMesh && this.bloomLayer.test(obj.layers) === false){
			this.materials[obj.uuid] = obj.material
			obj.material = this.darkMaterial
		}
	}

	restoreMaterial(obj)
	{
		if (this.materials[obj.uuid])
		{
			obj.material = this.materials[obj.uuid]
			delete this.materials[obj.uuid]
		}
	}

	initGameBoard()
	{
		const boardGeometry = new THREE.BoxGeometry(this.boardWidth, this.boardHeight, 0.05)
		const LipGeometry = new THREE.BoxGeometry(this.boardWidth, 0.027, 0.04);
		const vertBoarderGeo = new THREE.BoxGeometry(0.015, this.boardHeight, 0.0001);

		this.topLip = new THREE.Mesh(LipGeometry, this.greenGlowMat);
		this.bottomLip = new THREE.Mesh(LipGeometry, this.greenGlowMat);
		this.gameboard = new THREE.Mesh(boardGeometry, this.calizStella_mat)

	    const vertBoarderMat = new THREE.MeshBasicMaterial({ color: 0x000604 })
	    this.vertBoarderLeft = new THREE.Mesh(vertBoarderGeo, vertBoarderMat);
	    this.vertBoarderRight = new THREE.Mesh(vertBoarderGeo, vertBoarderMat);

	    this.vertBoarderLeft.position.set(this.boardWidth / 2, 0, 0)
	    this.vertBoarderRight.position.set((this.boardWidth / -2), 0, 0)

		this.topLip.position.set(0, this.boardHeight / 2, 0.05)
		this.bottomLip.position.set(0, this.boardHeight / -2, 0.05)
		this.gameboard.position.set(0,0,0)

		this.topLip.layers.toggle(this.BLOOM_SCENE)
		this.bottomLip.layers.toggle(this.BLOOM_SCENE)
		this.gameboard.layers.disable(20)
		
	}

	initBracket()
	{
		const MiddleGeometry = new THREE.BoxGeometry(this.boardWidth / 2, 0.027, 0.04);
		const EntryGeometry = new THREE.BoxGeometry(this.boardWidth / 4, 0.027, 0.04);
		const verticalGeometry = new THREE.BoxGeometry(0.027, this.boardHeight, 0.04);

		this.bracketMiddle = new THREE.Mesh(MiddleGeometry, this.greenGlowMat);
		this.entryTL = new THREE.Mesh(EntryGeometry, this.greenGlowMat);
		this.entryTR = new THREE.Mesh(EntryGeometry, this.greenGlowMat);
		this.entryBL = new THREE.Mesh(EntryGeometry, this.greenGlowMat);
		this.entryBR = new THREE.Mesh(EntryGeometry, this.greenGlowMat);
		this.verticalBracketLeft = new THREE.Mesh(verticalGeometry, this.greenGlowMat);
		this.verticalBracketRight = new THREE.Mesh(verticalGeometry, this.greenGlowMat);

		this.bracketMiddle.position.set(0, 0, 0)
		this.entryTL.position.set((this.boardWidth / -2) + this.boardWidth / 8, this.boardHeight / -2, 0)
		this.entryBL.position.set((this.boardWidth / -2) + this.boardWidth / 8, this.boardHeight / 2, 0)
		this.entryTR.position.set((this.boardWidth / 2) - this.boardWidth / 8, this.boardHeight / -2, 0)
		this.entryBR.position.set((this.boardWidth / 2) - this.boardWidth / 8, this.boardHeight / 2, 0)
		this.verticalBracketLeft.position.set((this.boardWidth / -2) + this.boardWidth / 4, 0, 0)
		this.verticalBracketRight.position.set((this.boardWidth / 2) - this.boardWidth / 4, 0, 0)

		this.bracketMiddle.layers.toggle(this.BLOOM_SCENE)
		this.entryTL.layers.toggle(this.BLOOM_SCENE)
		this.entryTR.layers.toggle(this.BLOOM_SCENE)
		this.entryBL.layers.toggle(this.BLOOM_SCENE)
		this.entryBR.layers.toggle(this.BLOOM_SCENE)
		this.verticalBracketLeft.layers.toggle(this.BLOOM_SCENE)
		this.verticalBracketRight.layers.toggle(this.BLOOM_SCENE)
	}
	
	showBracket(gameid = 1, player1 = "", player2 = "", player3 = "", player4 = "", finalist1 = "TBD", finalist2 = "TBD", winner = "")
	{
		let dpi = window.devicePixelRatio;
		let style_height = +getComputedStyle(this.bracket).getPropertyValue("height").slice(0, -2);
		let style_width = +getComputedStyle(this.bracket).getPropertyValue("width").slice(0, -2);
		this.bracket.setAttribute('height', style_height * dpi);
		this.bracket.setAttribute('width', style_width * dpi);

		this.ctx.clearRect(0, 0, this.bracket.width, this.bracket.height)
		const lenWinner = winner.length
		const lenPlayer1 = player1.length
		const lenPlayer2 = player2.length
		const lenPlayer3 = player3.length
		const lenPlayer4 = player4.length
		const nextGame = "Press Space to start next game!"
		const lenNextGame = nextGame.length
		const lenFinalist1 = finalist1.length
		const lenFinalist2 = finalist2.length

		
		const scale = 0.2 * 90
		this.scene.add(this.bracketMiddle, this.entryBL, this.entryBR, this.entryTL, this.entryTR, this.verticalBracketLeft, this.verticalBracketRight, this.bracketLight)
		
		this.ctx.font = "".concat(90, "px Impact, fantasy")
		this.ctx.fillStyle = this.textColor;
		this.ctx.fillText(player1, (this.bracket.width / 2 - this.bracket.width / 4.5) - (scale * lenPlayer1), this.bracket.height / 2 - this.bracket.height / 4 - scale)
		this.ctx.fillText(player2, (this.bracket.width / 2 - this.bracket.width / 4.5) - (scale * lenPlayer2), this.bracket.height / 2 + this.bracket.height / 4 +  4.5 * scale)
		this.ctx.fillText(player3, (this.bracket.width / 2 + this.bracket.width / 4.5) - (scale * lenPlayer3), this.bracket.height / 2 - this.bracket.height / 4 - scale)
		this.ctx.fillText(player4, (this.bracket.width / 2 + this.bracket.width / 4.5) - (scale * lenPlayer4), this.bracket.height / 2 + this.bracket.height / 4 +  4.5 * scale)
		this.ctx.fillText(finalist1, (this.bracket.width / 2) - (scale * lenFinalist1), this.bracket.height / 2 - this.bracket.height / 20 + 3.5 *scale)
		this.ctx.fillText(finalist2, (this.bracket.width / 2) - (scale * lenFinalist2), this.bracket.height / 2 + this.bracket.height / 20)
		this.ctx.stroke()
		this.ctx.fillStyle = "rgb(238, 36, 249)"
		if (gameid != 4)
		{
			this.ctx.fillText(nextGame, (this.bracket.width / 2) - (scale * lenNextGame), this.bracket.height -  this.bracket.height / 8)
			this.ctx.stroke()
		}
		if (gameid == 1)
		{
			this.ctx.fillText(player1, (this.bracket.width / 2 - this.bracket.width / 4.5) - (scale * lenPlayer1), this.bracket.height / 2 - this.bracket.height / 4 - scale)
			this.ctx.fillText(player2, (this.bracket.width / 2 - this.bracket.width / 4.5) - (scale * lenPlayer2), this.bracket.height / 2 + this.bracket.height / 4 +  4.5 * scale)
		}
		else if (gameid == 2)
		{
			this.ctx.fillText(player3, (this.bracket.width / 2 + this.bracket.width / 4.5) - (scale * lenPlayer3), this.bracket.height / 2 - this.bracket.height / 4 - scale)
			this.ctx.fillText(player4, (this.bracket.width / 2 + this.bracket.width / 4.5) - (scale * lenPlayer4), this.bracket.height / 2 + this.bracket.height / 4 +  4.5 * scale)
		}
		else if (gameid == 3)
		{
			this.ctx.fillText(finalist1, (this.bracket.width / 2) - (scale * lenFinalist1), this.bracket.height / 2 - this.bracket.height / 20 + 3.5 *scale)
			this.ctx.fillText(finalist2, (this.bracket.width / 2) - (scale * lenFinalist2), this.bracket.height / 2 + this.bracket.height / 20)
		}
		else if (gameid == 4)
		{
			this.ctx.fillText(winner, (this.bracket.width / 2) - (scale * lenWinner), this.bracket.height / 2 - this.bracket.height / 3.5)
		}
		this.ctx.stroke()
	}
	hideBracket()
	{
		this.scene.remove(this.bracketMiddle, this.entryBL, this.entryBR, this.entryTL, this.entryTR, this.verticalBracketLeft, this.verticalBracketRight, this.bracketLight)
		this.ctx.clearRect(0, 0, this.bracket.width, this.bracket.height)
	}
	showBoard()
	{
		this.scene.add(this.topLip, this.bottomLip, this.gameboard, this.vertBoarderLeft, this.vertBoarderRight, this.ball, this.paddle1, this.paddle2)
	}
	hideBoard()
	{
		this.scene.remove(this.topLip, this.bottomLip, this.gameboard, this.vertBoarderLeft, this.vertBoarderRight, this.ball, this.paddle1, this.paddle2)
	}

	initMaterials()
	{
		this.greenGlowMat = new THREE.MeshStandardMaterial({ color: 0x0FFF50, emissive: 0x2BC20E });

		this.calizStella_mat = new THREE.MeshLambertMaterial({
			color: 0x2BC20E,
			transparent: true,
			opacity: 0.2,
		});
	}

	initStars()
	{
		var stars = new Array(0);
		for ( var i = 0; i < 20000; i ++ ) {
			let x = THREE.MathUtils.randFloatSpread( 1500 );
			let y = THREE.MathUtils.randFloatSpread( 1500 );
			let z = THREE.MathUtils.randFloat( -2000, 2000 );
			if (!(x > -100 && x < 100 && y < 100 && y > -100 && z > -100 && z <100))
				stars.push(x, y, z);
		}
		var starsGeometry = new THREE.BufferGeometry();
		starsGeometry.setAttribute(
			"position", new THREE.Float32BufferAttribute(stars, 3)
			);
			var starsMaterial = new THREE.PointsMaterial( { color: 0xbbf9af } );//0x888888
			this.starField = new THREE.Points( starsGeometry, starsMaterial );
			this.scene.add( this.starField );
	}
	initPaddles()
	{
		this.hlf_pdl_height = 1/16

		let paddleGeometry = new THREE.BoxGeometry(0.05, this.boardHeight / 8, 0.05);
		this.paddle1 = new THREE.Mesh(paddleGeometry, this.greenGlowMat);
		this.paddle1.position.set(this.boardStartX + this.paddleMarging_x, 0, 0.1)
		this.paddle1.layers.toggle(this.BLOOM_SCENE)

		this.paddle2 = new THREE.Mesh(paddleGeometry, this.greenGlowMat);

		this.paddle2.position.set(this.boardStartX + this.boardWidth - this.paddleMarging_x, 0, 0.1)
		this.paddle2.layers.toggle(this.BLOOM_SCENE)
	}

	initBall()
	{
		let ballGeometry = new THREE.SphereGeometry(0.05, 32, 16)
		this.ball = new THREE.Mesh(ballGeometry, this.greenGlowMat);
		this.ball.position.set(this.boardStartX + this.boardWidth / 2, this.boardStartY + this.boardHeight / 2, 0.1)
		this.ball.layers.toggle(this.BLOOM_SCENE)
	}

	initSun()
	{
		let sunGeometry = new THREE.SphereGeometry(1, 32, 16)
		let sunmaterial = new THREE.MeshStandardMaterial({ color: 0xFDB813, emissive: 0xff5400 })
		this.sun = new THREE.Mesh(sunGeometry, sunmaterial);
		this.sun.position.set(-100,45, -100)
		this.sun.layers.toggle(this.BLOOM_SCENE)
		this.scene.add(this.sun)
		this.sunLight = new THREE.PointLight( 0xff5400, 10 )
		this.sunLight.position.set(-100, 45, -80)
		this.sunLight.intensity = 100000
		this.sunLight.layers.disableAll()
		this.sunLight.layers.enable(20)
		this.camera.layers.enable(20)
		this.scene.add(this.sunLight)
	}

	initLight()
	{
		this.pointLight = new THREE.PointLight( 0xebfde7, 10 )
		this.pointLight3 = new THREE.PointLight( 0xffffff, 10 )
		this.pointLight4 = new THREE.PointLight( 0xffffff, 10 )
		this.bracketLight = new THREE.PointLight( 0xffffff, 10 )
		this.pointLight.position.set(2, 2, 2)
		this.pointLight3.position.set(0, 0, 19)
		this.pointLight4.position.set(0, 0, -19)
		this.bracketLight.position.set(2, 2, 2)
		this.pointLight.intensity = 1
		this.pointLight3.intensity = 95
		this.pointLight4.intensity = 95
		this.bracketLight.intensity = 13
		this.scene.add(this.pointLight, this.pointLight3, this.pointLight4);
	}

	initCameraPos()
	{
		this.camera.position.set(0, 0, 4);
		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
	}
	
	render() {
		this.bracketLight.position.set(2 * Math.sin(Date.now() /1000), 2 * Math.cos(Date.now() / 1000), 2)
		this.controls.update()
		this.starField.translateX(0.01)
		this.starField.translateY(0.005)
		this.sunLight.translateX(0.003)
		this.sunLight.translateY(0.0002)
		this.sun.translateX(0.003)
		this.sun.translateY(0.0002)
		this.scene.traverse(this.nonBloomed.bind(this))
		this.pointLight.intensity = (Math.sin(Date.now() / 1000) + 1) * 0.025
		this.sunLight.intensity = 8000 * (Math.sin(Date.now() / 5000) + 3)
		this.composer.render()
		
		
		this.scene.traverse(this.restoreMaterial.bind(this))
		this.finalComposer.render()
	};

	initListener()
	{
		window.addEventListener("resize", (function (e) {
			this.windowWidth = window.innerWidth
			this.windowHeight = window.innerHeight

			this.camera.aspect = this.windowWidth / this.windowHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(this.windowWidth, this.windowHeight);
			this.composer.setSize(this.windowWidth, this.windowHeight);
			this.finalComposer.setSize(this.windowWidth, this.windowHeight);
		}).bind(this));
	}
}

export const renderer = new Renderer()

export class graphicEngine
{
	constructor(){
		this.board = document.getElementById("board")
		this.ctx =  this.board.getContext("2d")

		let dpi = window.devicePixelRatio;
		let style_height = +getComputedStyle(this.board).getPropertyValue("height").slice(0, -2);
		let style_width = +getComputedStyle(this.board).getPropertyValue("width").slice(0, -2);
		this.board.setAttribute('height', style_height * dpi);
		this.board.setAttribute('width', style_width * dpi);
		
		// this.generalTopMargin = this.height / 10;
		this.board.style.top = 'calc(30% + 5em)'
		this.width = this.board.width
		this.height = this.board.height
		this.mid = this.board.width / 2
		this.textColor = "rgb(43, 194, 14)"

		this.scoreScale = this.height / 5
		this.scoreMarginRight = (this.mid + this.width / 4) - (this.scoreScale * 0.2)
		this.scoreMarginLeft = (this.mid - this.width / 4) - (this.scoreScale * 0.2)
		this.scoreMarginTop = this.board.height / 2.3

		this.messageCenter = this.mid - this.width / 7
		this.messageMargin = this.height / 2 + this.height / 4
		this.messageScale = this.width / 15

		this.startTimerMargin = this.height / 2 + this.height / 4
		this.startTimerScale = this.height / 3
		this.startTimerCenter = this.mid  - (this.startTimerScale * 0.2)

		this.marginNames = this.board.height / 5
		
		this.Renderer = renderer
		this.Renderer.showBoard()
	}

	display(model) {

		if (model != "none" && model != undefined)
		{
			this.clearFrame()
			this.displayStartTimer(model.startTimer)
			this.displayBall(model.ball.x, model.ball.y, model.ball.radius)
			this.displayPaddle1(model.paddle1.x, model.paddle1.y)
			this.displayPaddle2(model.paddle2.x, model.paddle2.y)
			this.displayScore(model.player1Score, model.player2Score)
			this.displayMessage(model.message)
			this.displayNames(model.player1, model.player2)
		}
		// render()
		this.ctx.stroke()
	}

	clearFrame(){
		this.ctx.clearRect(0, 0, this.board.width, this.board.height)
	}

	displayBall(ball_x, ball_y, ball_radius){
		this.Renderer.ball.position.set(this.Renderer.boardStartX + ball_x * this.Renderer.boardWidth, this.Renderer.boardStartY - (ball_y * this.Renderer.boardHeight) , 0.1)
		this.Renderer.pointLight.position.set(this.Renderer.boardStartX + ball_x * this.Renderer.boardWidth, this.Renderer.boardStartY - (ball_y * this.Renderer.boardHeight) , 0.2)
	}

	displayPaddle1(paddle_x, paddle_y){
		this.Renderer.paddle1.position.set(this.Renderer.boardStartX + (paddle_x) * this.Renderer.boardWidth, this.Renderer.boardStartY - ((paddle_y + this.Renderer.hlf_pdl_height) * this.Renderer.boardHeight), 0.1)
	}
	displayPaddle2(paddle_x, paddle_y){
		this.Renderer.paddle2.position.set(this.Renderer.boardStartX + (paddle_x) * this.Renderer.boardWidth, this.Renderer.boardStartY - ((paddle_y + this.Renderer.hlf_pdl_height) * this.Renderer.boardHeight), 0.1)
	}

	displayScore(player1Score, player2Score)
	{
		if (player1Score == undefined || player2Score == undefined)
			return
		const dis1 = `${player1Score}`
		const dis2 = `${player2Score}`
		this.ctx.font = "".concat(`${this.scoreScale}`, "px Impact, fantasy")
		this.ctx.fillStyle = this.textColor;

		this.ctx.fillText(dis1, this.scoreMarginLeft, this.scoreMarginTop)

		this.ctx.fillText(dis2, this.scoreMarginRight, this.scoreMarginTop)
	}

	displayMessage(message)
	{
		if (message == "" || message == undefined)
			return
		const len = message.length
		this.ctx.font = "".concat(`${this.messageScale}`, "px Impact, fantasy")
		this.ctx.fillStyle = "rgb(238, 36, 249)"
		this.ctx.fillText(message, this.mid - len * this.messageScale * 0.2, this.messageMargin)
	}

	displayNames(player1, player2)
	{
		if (player1 == undefined)
			player1 = "Player 1"
		if (player2 == undefined)
			player2 = "Player 2"
		const len1 = player1.length
		const len2 = player2.length
		this.ctx.font = "".concat(`${this.messageScale}`, "px Impact, fantasy")
		this.ctx.fillStyle = this.textColor;
		this.ctx.fillText(player1, (this.mid - this.width / 4) - (this.messageScale * 0.2 * len1), this.marginNames)
		this.ctx.fillText(player2, (this.mid + this.width / 4) - (this.messageScale * 0.2 * len2), this.marginNames)
	}

	displayStartTimer(timeToWait)
	{
		if (timeToWait <= 0)
			return
		let display = `${timeToWait}`
		this.ctx.font = "".concat(`${this.startTimerScale}`, "px Impact, fantasy")
		this.ctx.fillStyle = this.textColor;
		this.ctx.fillText(display, this.startTimerCenter, this.startTimerMargin)
	}
}


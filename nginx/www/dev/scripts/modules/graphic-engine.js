import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';


const boardWidth = 4
const boardHeight = 3
const boardStartX = (boardWidth / 2) * -1
const boardStartY = (boardHeight / 2)
const paddleMarging_x = boardWidth / 12


const canva = document.getElementById('background');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canva, antialias: true })

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor( 0x000000, 1);
document.body.appendChild(renderer.domElement);


//Bloom
renderer.toneMapping = THREE.CineonToneMapping
renderer.toneMappingExposure = 1.5
renderer.outputColorSpace = THREE.SRGBColorSpace
const renderPass = new RenderPass(scene, camera)
const composer = new EffectComposer(renderer)
composer.addPass(renderPass)

const bloomPass = new UnrealBloomPass( 
    new THREE.Vector2(canva.innerWidth, canva.innerHeight),
    0.3, //bloom intensity
    0.1, // bloom radius
    0.1 // pixel bloom? (experiment)
    )
composer.addPass(bloomPass)
composer.renderToScreen = false

const mixPass = new ShaderPass(
	new THREE.ShaderMaterial({
		uniforms:{
			baseTexture: {value: null},
            bloomTexture: {value: composer.renderTarget2.texture}
        },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent
    }), 'baseTexture'
    )
    
const finalComposer = new EffectComposer(renderer)
finalComposer.addPass(renderPass)
finalComposer.addPass(mixPass)


const outputPass = new OutputPass()//2min
finalComposer.addPass(outputPass)

//SELECT BLOOM

const BLOOM_SCENE = 1
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_SCENE)
const darkMaterial = new THREE.MeshBasicMaterial({color: 0x000000})
const materials = {}

function nonBloomed(obj){
	if (obj.isMesh && bloomLayer.test(obj.layers) === false){
		materials[obj.uuid] = obj.material
		obj.material = darkMaterial
	}
}

function restoreMaterial(obj){
	if (materials[obj.uuid]){
		obj.material = materials[obj.uuid]
		delete materials[obj.uuid]
	}
}
	
	
	
const greenGlowMat = new THREE.MeshStandardMaterial({ color: 0x0FFF50, emissive: 0x2BC20E });

const calizStella_mat = new THREE.MeshLambertMaterial({
	color: 0x2BC20E,
	transparent: true,
	opacity: 0.12,
});
		

//STARS
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
	var starField = new THREE.Points( starsGeometry, starsMaterial );
	scene.add( starField );

			
			
//TOP-BOTTOM lip
function initGameBoard()
{
	const boardGeometry = new THREE.BoxGeometry(boardWidth, boardHeight, 0.05)
	const LipGeometry = new THREE.BoxGeometry(boardWidth, 0.027, 0.04);
	const vertBoarderGeo = new THREE.BoxGeometry(0.015, boardHeight, 0.0001);

	const topLip = new THREE.Mesh(LipGeometry, greenGlowMat);
	const bottomLip = new THREE.Mesh(LipGeometry, greenGlowMat);
	const gameboard = new THREE.Mesh(boardGeometry, calizStella_mat)
	
    const vertBoarderMat = new THREE.MeshBasicMaterial({ color: 0x000604 })
    const vertBoarderLeft = new THREE.Mesh(vertBoarderGeo, vertBoarderMat);
    const vertBoarderRight = new THREE.Mesh(vertBoarderGeo, vertBoarderMat);

    vertBoarderLeft.position.set(boardWidth / 2, 0, 0)
    vertBoarderRight.position.set((boardWidth / -2), 0, 0)

	topLip.position.set(0, boardHeight / 2, 0.05)
	bottomLip.position.set(0, boardHeight / -2, 0.05)
	gameboard.position.set(0,0,0)

	topLip.layers.toggle(BLOOM_SCENE)
	bottomLip.layers.toggle(BLOOM_SCENE)
	gameboard.layers.disable(20)

	scene.add(topLip, bottomLip, gameboard, vertBoarderLeft, vertBoarderRight)
}

const hlf_pdl_height = 1/16

const paddleGeometry = new THREE.BoxGeometry(0.05, boardHeight / 8, 0.05);
const paddle1 = new THREE.Mesh(paddleGeometry, greenGlowMat);
paddle1.position.set(boardStartX + paddleMarging_x, 0, 0.1)
paddle1.layers.toggle(BLOOM_SCENE)

// const material3 = new THREE.MeshStandardMaterial({ color: 0x0FFF50, emissive: 0x2BC20E })
const paddle2 = new THREE.Mesh(paddleGeometry, greenGlowMat);

paddle2.position.set(boardStartX + boardWidth - paddleMarging_x, 0, 0.1)
paddle2.layers.toggle(BLOOM_SCENE)
scene.add(paddle1, paddle2)





//ball
const ballGeometry = new THREE.SphereGeometry(0.05, 32, 16)
const ballmaterial = new THREE.MeshStandardMaterial({ color: 0x0FFF50, emissive: 0x2BC20E })
const ball = new THREE.Mesh(ballGeometry, ballmaterial);
ball.position.set(boardStartX + boardWidth / 2,boardStartY + boardHeight / 2, 0.1)
ball.layers.toggle(BLOOM_SCENE)
scene.add(ball)

//sun
const sunGeometry = new THREE.SphereGeometry(1, 32, 16)
const sunmaterial = new THREE.MeshStandardMaterial({ color: 0xFDB813, emissive: 0xff5400 })
const sun = new THREE.Mesh(sunGeometry, sunmaterial);
sun.position.set(-100,45, -100)
sun.layers.toggle(BLOOM_SCENE)
scene.add(sun)
const sunLight = new THREE.PointLight( 0xff5400, 10 )
sunLight.position.set(-100, 45, -80)
sunLight.intensity = 100000
sunLight.layers.disableAll()
sunLight.layers.enable(20)
camera.layers.enable(20)
scene.add(sunLight)


//Light
const ambLight = new THREE.AmbientLight(0x2BC20E)
const pointLight = new THREE.PointLight( 0xebfde7, 10 )
const pointLight2 = new THREE.PointLight( 0xe9fde5, 10 )
const pointLight3 = new THREE.PointLight( 0xffffff, 10 )
const pointLightHelper = new THREE.PointLightHelper( pointLight2 )
pointLight.position.set(2, 2, 2)
pointLight2.position.set(0, 0, 100)
pointLight3.position.set(0, 0, 19)
ambLight.intensity = 0.2
pointLight.intensity = 1
pointLight2.intensity = 0
pointLight3.intensity = 100
scene.add(ambLight, pointLight, pointLight2, pointLight3);


//Other
camera.position.set(0, 0, 4);

const controls = new OrbitControls( camera, renderer.domElement );

controls.maxPolarAngle = Math.PI
// Render loop
function render() {
	controls.update()
	starField.translateX(0.01)
	starField.translateY(0.005)
	sunLight.translateX(0.003)
	sunLight.translateY(0.0002)
	sun.translateX(0.003)
	sun.translateY(0.0002)
    scene.traverse(nonBloomed)
	pointLight.intensity = (Math.sin(Date.now() / 1000) + 1.2) * 0.025
    composer.render()
	
    
    scene.traverse(restoreMaterial)
    finalComposer.render()
};    

window.addEventListener("resize", function(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.updateProjectionMatrix()
	render();
})



















initGameBoard()
render()

export class graphicEngine
{
	constructor(mode="basic"){
		this.ctx =  board.getContext("2d")
		this.board = document.getElementById("board")
		
		this.width = this.board.width
		this.height = this.board.height
		this.mid = board.width / 2
		this.scoreMarginRight = this.mid + this.width / 8
		this.scoreMarginLeft = this.mid - this.width / 8
		this.scoreMarginTop = this.height / 10
		this.scoreScale = this.height / 10
		this.winnerMessageCenter = this.width / 2 - this.width / 7
		this.winnerMessageMargin = this.height / 4.8
		this.startTimerCenter = this.width / 2 - this.width / 48
		this.startTimerMargin = this.height / 4
		this.startTimerScale = this.height / 6
		this.textColor = "rgb(43, 194, 14)"
		this.paddleHeigt = 1 / 8
		
		render()
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
			this.displayWinner(model.winnerMessage)
		}
		render()
		this.ctx.stroke()
	}

	clearFrame(){
		this.ctx.clearRect(0, 0, board.width, board.height)
	}

	displayBall(ball_x, ball_y, ball_radius){
		ball.position.set(boardStartX + ball_x * boardWidth, boardStartY - (ball_y * boardHeight) , 0.1)
		pointLight.position.set(boardStartX + ball_x * boardWidth, boardStartY - (ball_y * boardHeight) , 0.2)
	}

	displayPaddle1(paddle_x, paddle_y){
		paddle1.position.set(boardStartX + (paddle_x) * boardWidth, boardStartY - ((paddle_y + hlf_pdl_height) * boardHeight), 0.1)
	}
	displayPaddle2(paddle_x, paddle_y){
		paddle2.position.set(boardStartX + (paddle_x) * boardWidth, boardStartY - ((paddle_y + hlf_pdl_height) * boardHeight), 0.1)
	}

	displayScore(player1Score, player2Score)
	{
		const dis1 = `${player1Score}`
		const dis2 = `${player2Score}`
		this.ctx.font = "".concat(`${this.scoreScale}`, "px Impact, fantasy")
		this.ctx.fillStyle = this.textColor;

		this.ctx.fillText(dis1, this.scoreMarginLeft, this.scoreMarginTop)
		this.ctx.fillText(dis2, this.scoreMarginRight, this.scoreMarginTop)
	}

	displayWinner(winnerMessage)
	{
		if (winnerMessage == "" || winnerMessage == undefined)
			return
		const y = 50
		this.ctx.font = "".concat(`${this.scoreScale}`, "px Impact, fantasy")
		this.ctx.fillStyle = this.textColor;
		this.ctx.fillText(winnerMessage, this.winnerMessageCenter, this.winnerMessageMargin)
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

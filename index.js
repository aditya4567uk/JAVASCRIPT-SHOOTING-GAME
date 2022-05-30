//console.log(gsap);

const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = innerHeight;

//CREATING VARIABLE FOR DIFFERENT TARGETING IDS

console.log('its working iam developer');
const scoreEl = document.querySelector('#scoreEl');
const startgamebtn = document.querySelector('#startgamebtn');
const modalEl = document.querySelector('#modalEl');
let gameover = document.getElementById('gameover');
gameover.style.display = 'none';
const containerscore = document.querySelector('#containerscore');
var audio = new Audio('AUDIOGAMEOVER.mp3');
var audioplaygame = new Audio('AUDIOPLAYGAME.mp3');


//CREATING CLASS PLAYER WITH ITS CHILD FUNCTIONS AND VALUES
class Player{
    constructor(x, y, radius, color){
        this.x =x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

//CREATING CLASS PROJECTILE WITH ITS CHILD FUNCTIONS AND VALUES WHICH WILL BE SHOOTED AFTER WE CLICK
class Projectile{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

//CREATING CLASS PLAYER WITH ITS CHILD FUNCTIONS AND VALUES
class Enemy{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    // This Function will draw enemies
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    // This function will give movements to enemy objects
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;

class Particle{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw(){
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width/2;
const y = canvas.height/2;

let player =new Player(x, y ,20, 'white');
//player.draw();
//console.log(player);
//const projectile = new Projectile(canvas.width/2, canvas.height/2, 5,'red',{x:1,y:1});

let projectiles = []
let enemies = []
let particles = []

// this i
function init(){
    player = new Player(x, y ,20, 'white');
    projectiles = []
    enemies = []
    particles = []
    score = 0;
    scoreEl.innerText = score;
    containerscore.innerText = score;
}

// This function will randomly generate enemies and project it into screen
function spawnEnemies(){
    setInterval(()=>{
        //console.log('goooo');
        const radius = Math.random()* (30-10)+10;
        let x;
        let y;

        if(Math.random()<0.5){
            x = Math.random() <0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }
        else{
            x = Math.random()* canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        randclr = Math.random()*360;
        //const color = `hsl(${Math.random()*360}, 50%, 50%)`;
        const color = `hsl(${randclr}, 50%, 50%)`;
        const angle = Math.atan2(
            canvas.height / 2 - y, canvas.width / 2 - x 
        )
        const velocity = {
            x:Math.cos(angle),
            y:Math.sin(angle)
        }
        
        enemies.push(new Enemy(x,y,radius,color,velocity))
        console.log(enemies);
    },1000)
}

let animationId;
let score = 0;

// Function for playing in game music
function musicplay(){
    audioplaygame.play();
    audioplaygame.loop = true;
    console.log('music on');
}

// This the driving function of the whole code all the important calculations and projections are happening over here!! ; enemy projection , player throwing projectile etc etc...
function animate(){
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0,0,canvas.width,canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index, 1)
        }else{
            particle.update();
        }
    })
    projectiles.forEach((projectile, index) =>{
        projectile.update();
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height){
            setTimeout(()=>{
                projectiles.splice(index, 1)
            },0)
        }
    })
    console.log('animate is working');

    enemies.forEach((enemy,index) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x,player.y - enemy.y)
        // This condition is for checking GAMEOVER and calling functions on GAMEOVER
        if(dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId);
            containerscore.innerText = score;
            modalEl.style.display = 'flex';
            gameover.style.display = 'flex';
            audioplaygame.pause();
            audio.play();
            //console.log('endgame');

        }
        projectiles.forEach((projectile,projectileIndex)=>{
            const dist = Math.hypot(projectile.x - enemy.x,projectile.y - enemy.y)
            if (dist - enemy.radius - projectile.radius<1){

                score +=100;
                scoreEl.innerText = score;

                for(let i = 0; i< enemy.radius * 2; i++){
                    particles.push(new Particle(projectile.x,projectile.y, Math.random()*2 ,enemy.color,{x:Math.random()-0.5 * (Math.random()*8),y:Math.random()-0.5 * (Math.random()*8)}))
                }

                if(enemy.radius - 10 >5)
                {
                    gsap.to(enemy, {
                        radius:enemy.radius - 10
                    })
                    //enemy.radius -= 10;
                    setTimeout(()=>{
                        projectiles.splice(projectileIndex, 1)
                    },0)
                }
                else
                {
                    score += 250;
                    scoreEl.innerText=score;
                    setTimeout(()=>{
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    },0)
                } 
            }
        })
    })
}
musicplay();
addEventListener('mousedown', (event)=>
{
    console.log(projectiles);
    const angle = Math.atan2(event.clientY-canvas.height/2,event.clientX - canvas.width/2)
    console.log(angle);
    const velocity ={
        x:Math.cos(angle) * 5,
        y:Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 5, 'white',velocity))
})

//This is the startgame panel , it will call the important functions when we click on start game
startgamebtn.addEventListener('click',()=>{
    modalEl.style.display = 'none';
    init();
    animate();
    spawnEnemies();
    musicplay();
})
//alert('Made by Team PICKACHU - ADITYA KUMAR, CHETAN SAINI, TANZEEL KHAN, AYUSH KESARWANI');

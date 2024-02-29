import kaboom from "kaboom"
import { gameStart } from "./start.js";
import { gameLose } from "./lose.js";
// kabum()

export const kabum = kaboom({
    fullscreen: true,
    font: "sans-serif",
    scale: 0.8,
    debug: false,
    background: [255, 255, 255, 0],
    root: document.getElementById('jueguito'), // Especifica el contenedor del juek.go,
    global: false
})

console.log(kabum.width(), kabum.height())

let SCALE = 2.5;
let JUMP_FORCE = 2500;
if(kabum.width() < 1000){
    SCALE=1.5;
    JUMP_FORCE=2100;
}else if(kabum.width() < 2200){
    SCALE =2.5;
    JUMP_FORCE=2500
}else{  
   SCALE=3;
    JUMP_FORCE=3000;
}


const FLOOR_HEIGHT = 4;
let FLOOR_HIGHT = 40*SCALE;
const FLOOR_COLLISION = 5*SCALE;
if(kabum.width()<1000){
    FLOOR_HIGHT=300;
}
// const JUMP_FORCE = 1700;
// const GRAVITY = 4000;

let GRAVITY = 8000;
let SPEED = 10;

const numHorizon = 12;

const randn_bm = (min, max, skew = 1) => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}

function randParallax(min = 0, max = numHorizon) {
    let num = randn_bm(-30, 70, 1);
    while (num < 0 || num > 10) {
        num = randn_bm(-30, 70, 1);
    }
    return Math.round(num); // Redondear el número al entero más cercano
}

kabum.loadFont("pixelFont", "fonts/Minecraft.ttf");

kabum.loadSpriteAtlas("sprites/miquiDino.png", {
    "miquiDino": {
        x: 0,
        y: 0,
        width: 192,
        height: 64,
        sliceX: 3,
        anims: {
            idle: 0,
            run: { from: 1, to: 2, speed: 15, loop: true },
            jump: 2,
        },

    }
});

kabum.loadSpriteAtlas("sprites/mexican.png", {
    "mexican": {
        x: 0,
        y: 0,
        width: 1344,
        height: 64,
        sliceX: 21,
        anims: {
            idle: 0,
            wait: { from: 0, to: 20, speed: 10, loop: true },
            jump: 2,
        },

    }
});

kabum.loadSpriteAtlas("sprites/bird.png", {
    "bird": {
        x: 0,
        y: 0,
        width: 512,
        height: 64,
        sliceX: 8,
        anims: {
            idle: 0,
            fly: { from: 0, to: 7, speed: 10, loop: true }
        },

    }
});

kabum.loadSpriteAtlas("sprites/clouds.png", {
    "cloud1": {
        x: 4,
        y: 13,
        width: 54,
        height: 30,
    }
});

kabum.loadSpriteAtlas("sprites/clouds.png", {
    "cloud2": {
        x: 7,
        y: 12,
        width: 54,
        height: 30,
    }
});
kabum.loadSpriteAtlas("sprites/clouds.png", {
    "cloud3": {
        x: 60,
        y: 11,
        width: 65,
        height: 20,
    }
});

kabum.loadSpriteAtlas("sprites/clouds.png", {
    "cloud4": {
        x: 60,
        y: 38,
        width: 65,
        height: 23,
    }
});

kabum.loadSpriteAtlas("sprites/clouds.png", {
    "cloud5": {
        x: 60,
        y: 66,
        width: 65,
        height: 23,
    }
});

kabum.loadSpriteAtlas("sprites/clouds.png", {
    "cloud6": {
        x: 6,
        y: 86,
        width: 114,
        height: 31,
    }
});


// kabum.loadSprite("cloud1","sprites/clouds.png");



kabum.loadSpriteAtlas("sprites/boom.png", {
    "boom": {
        x: 0,
        y: 0,
        width: 1216,
        height: 93,
        sliceX: 19,
        anims: {
            boom: { from: 0, to: 18, speed: 19 },
        }

    }
});



kabum.loadSpriteAtlas("sprites/miquiCactus.png", {
    "cactus": {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        sliceX: 4,
    }
});
kabum.loadSpriteAtlas("sprites/miquiCactus.png", {
    "cactus2": {
        x: 100,
        y: 0,
        width: 50,
        height: 50
    }
});

kabum.loadSprite("face", "sprites/miquiFace.png")



kabum.scene("game", () => {
    kabum.destroyAll();
    let score = 0;
    let player;
    let lives = 4;
    let livesSprites = []; // Array para almacenar los sprites de las vidas
    let respawnTime = RespawnTime();
    function showLives() {

        for (let i = 0; i < lives - 1; i++) {
            const lifeSprite = kabum.add([
                kabum.sprite("miquiDino"),
                kabum.pos(80 + 60 * i, 40),
                kabum.scale(SCALE / 2),
                kabum.rotate(30),
                kabum.color(255, 255, 255),
                kabum.z(1000),
            ]);

            livesSprites.push(lifeSprite); // Añade el kabum.sprite al array
        }
    }

    kabum.add([
        kabum.rect(kabum.width(), FLOOR_HEIGHT),
        // outline(4),
        kabum.pos(0, kabum.height() - FLOOR_HIGHT),
        kabum.anchor("botleft"),
        kabum.area({ offset: kabum.vec2(0, FLOOR_COLLISION) }),
        kabum.body({ isStatic: true }),
        kabum.color(200, 200, 200),
        "floor"
    ]);


    showLives();
    // define gravity
    kabum.setGravity(1000*SCALE);

    // kabum.add a game object to screen

    
    // let horizonColor = 100
    // let horizonSeparation = 5 * SCALE;
    // let numHorizon = 50;
    // for (let i = 1; i < numHorizon; i++) {
    //     kabum.add([
    //         kabum.rect(kabum.width(), FLOOR_HEIGHT / 2),
    //         // outline(4),
    //         kabum.pos(0, kabum.height() - FLOOR_HEIGHT - FLOOR_HIGHT - horizonSeparation),
    //         kabum.anchor("botleft"),
    //         kabum.color(horizonColor - i * horizonColor / numHorizon, horizonColor  -i * horizonColor / numHorizon, horizonColor -i * horizonColor / numHorizon),
    //         "horizon"
    //     ]);
    //     horizonSeparation += numHorizon * SCALE / (numHorizon - i);
    // }

    const horizonColor = 130
    let horizonSeparation = 0;
    const horizonM=7;
    for (let i = 1; i < numHorizon; i++) {
        horizonSeparation += horizonM * SCALE - i * horizonM * SCALE / numHorizon;
        kabum.add([
            kabum.rect(kabum.width(), FLOOR_HEIGHT / 2),
            // outline(4),
            kabum.pos(0, kabum.height() - FLOOR_HEIGHT - FLOOR_HIGHT - horizonSeparation),
            kabum.anchor("botleft"),
            kabum.color(horizonColor - i * horizonColor / numHorizon, horizonColor - i * horizonColor / numHorizon, horizonColor - i * horizonColor / numHorizon),
            "horizon"
        ]);
    }

    function addCloud(){
        let cloudIndex = kabum.randi(1, 6);
        let cloud = kabum.add([
            kabum.sprite("cloud"+cloudIndex),
            kabum.scale(SCALE),
            kabum.pos(5*kabum.width()/4, kabum.rand(0, kabum.height()/2)),
            kabum.anchor("center"),
            "cloud",
            speed(SPEED/8),
            kabum.z(0),
            kabum.color(220, 220, 220)
        ]);

        clouds.push(cloud); // Añadir el cactus al array de cacti
        clouds.length > 10 && kabum.destroy(clouds.shift());
    }


    function addParallax() {

        let frameIndex = kabum.randi(0, 5);
        let far = randParallax(1, numHorizon);
        let par;
        let parallaxColor = 150;
        let horizonSeparation2 = 0;
        for (let i = 1; i < far; i++) {
            horizonSeparation2 += horizonM * SCALE - i * horizonM * SCALE / numHorizon;
        }

        if (frameIndex == 4) {
            par = kabum.add([
                kabum.sprite("cactus2"),
                kabum.scale(SCALE - (far + 2) * SCALE / numHorizon),
                kabum.pos(kabum.width(), kabum.height() - FLOOR_HIGHT - horizonSeparation2),
                kabum.anchor("botleft"),
                "cactus",
                speed(SPEED - (far + 1) * SPEED / numHorizon),
                kabum.color(parallaxColor - far * parallaxColor / numHorizon, parallaxColor - far * parallaxColor / numHorizon, parallaxColor - far * parallaxColor / numHorizon)
            ]);
        } else if (frameIndex < 4) {
            par = kabum.add([
                kabum.sprite("cactus", { frame: frameIndex }),
                kabum.scale(SCALE - (far + 2) * SCALE / numHorizon),
                kabum.pos(kabum.width(), kabum.height() - FLOOR_HIGHT - horizonSeparation2),
                kabum.anchor("botleft"),
                "cactus",
                speed(SPEED - (far + 1) * SPEED / numHorizon),
                kabum.color(parallaxColor - far * parallaxColor / numHorizon, parallaxColor - far * parallaxColor / numHorizon, parallaxColor - far * parallaxColor / numHorizon)
            ]);
        }

        parallax.push(par); // Añadir el cactus al array de cacti
        parallax.length > 80 && kabum.destroy(parallax.shift());
    }



    addPlayer();
    function addPlayer() {
        player = kabum.add([
            // list of components
            kabum.sprite("miquiDino"),
            kabum.pos(80, 40),
            kabum.scale(SCALE, SCALE),
            kabum.area({
                offset: kabum.vec2(12, 3),
                shape: new kabum.Polygon([kabum.vec2(16,5), kabum.vec2(28, 5), kabum.vec2(25, 47), kabum.vec2(10, 47)]),
            }),
            kabum.body(),
            kabum.z(5000),
        ]);
        onColide();
        player.onCollide("floor", () => {
            player.play("run");
            kabum.setGravity(GRAVITY);
        });
    }




    function jump() {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE);
            player.play("jump");
        }
    }

    // jump when user press space
    kabum.onKeyPress("space", jump);
    kabum.onClick(jump);
    let cacti = [];
    let parallax = [];
    let clouds= [];
    let moving = true;
    let spawn = true;

    function addBird() {

        let bird = kabum.add([
            kabum.sprite("bird"),
            kabum.scale(-SCALE, SCALE),
            kabum.area({ shape: new kabum.Polygon([kabum.vec2(15, -25), kabum.vec2(15, -50), kabum.vec2(35, -50), kabum.vec2(35, -25)]) }),
            // kabum.pos(kabum.width(), kabum.height() - FLOOR_HEIGHT - FLOOR_HIGHT + FLOOR_COLLISION - SCALE * 10 - 30 * SCALE * kabum.randi(0, 2)),
            kabum.pos(kabum.width()*2.5/SCALE, kabum.height() - FLOOR_HEIGHT - FLOOR_HIGHT + FLOOR_COLLISION - SCALE * 10 - 30 * SCALE),

            kabum.anchor("botleft"),
            "cactus",
            speed(SPEED * 1.3),
            kabum.z(120)
        ]);
        bird.play("fly");
        cacti.push(bird); // Añadir el cactus al array de cacti
    }

    function addCactus() {
        let cactus;
        let frameIndex = kabum.randi(0, 21);
        if (frameIndex < 20) {
            frameIndex = frameIndex % 5
        }
        if (frameIndex == 4) {
            cactus = kabum.add([
                kabum.sprite("cactus2"),
                kabum.scale(SCALE, SCALE),
                kabum.area({ shape: new kabum.Polygon([kabum.vec2(2,7), kabum.vec2(48, 0), kabum.vec2(46, -45), kabum.vec2(4, -45)]) }),
                kabum.pos(kabum.width()*3.5/SCALE, kabum.height() - FLOOR_HEIGHT - FLOOR_HIGHT + FLOOR_COLLISION+SCALE*7),
                kabum.anchor("botleft"),
                // move(LEFT, SPEED),
                "cactus",
                speed(SPEED),
                kabum.z(100)
            ]);
        } else if (frameIndex < 4) {
            cactus = kabum.add([
                kabum.sprite("cactus", { frame: frameIndex }),
                kabum.scale(SCALE, SCALE),
                kabum.area({ shape: new kabum.Polygon([kabum.vec2(2), kabum.vec2(23, 0), kabum.vec2(21, -45), kabum.vec2(4, -45)]) }),
                kabum.pos(kabum.width()*2.5/SCALE, kabum.height() - FLOOR_HEIGHT - FLOOR_HIGHT + FLOOR_COLLISION+SCALE*7),
                kabum.anchor("botleft"),
                // move(LEFT, SPEED),
                "cactus",
                speed(SPEED),
                kabum.z(100)
            ]);
        } else {
            cactus = kabum.add([ // kabum.add a game object to screen  
                kabum.sprite("mexican"), // render as a kabum.sprite
                kabum.pos(kabum.width()*2.5/SCALE, kabum.height() - FLOOR_HEIGHT - FLOOR_HIGHT + FLOOR_COLLISION+SCALE*7), // position in world
                kabum.scale(-SCALE, SCALE),
                kabum.area({ shape: new kabum.Polygon([kabum.vec2(23, 0), kabum.vec2(36, 0), kabum.vec2(36, -45), kabum.vec2(23, -45)]) }),
                kabum.anchor("botleft"),
                speed(SPEED),
                "cactus",
                kabum.z(100)
            ]);
            cactus.play("wait");
        }
        cacti.push(cactus); // Añadir el cactus al array de cacti
    }




    function speed(sp) {
        let speed = sp;
        return {
            getSpeed() {
                return speed;
            },
            setSpeed(newSpeed) {
                speed = newSpeed;
            },
        }
    }




    function spawnCactus() {
        if (moving & spawn) {
            addCactus();
        }

        kabum.wait(respawnTime.getRandom(), spawnCactus);
        cacti.length > 5 && kabum.destroy(cacti.shift());

    }
    function spawnParallax() {
        if (moving) {
            addParallax();
        }
        kabum.wait(kabum.rand(0.05, 0.2), spawnParallax);
    }

    function spawnCloud() {
        if (moving) {
            addCloud();
        }
        kabum.wait(kabum.rand(2, 6), spawnCloud);
    }

    function spawnBird() {
        if (moving && spawn&&score > 3000) {
            addBird(); // Llama a la función para añadir un cactus
        }
        kabum.wait(respawnTime.getRandom() * 4, spawnBird);
        cacti.length > 5 && kabum.destroy(cacti.shift());

    }
    spawnCactus();
    spawnBird();
    spawnParallax();
    spawnCloud();

    function RespawnTime() {
        let factor = 1;
        return {
            setRespawnFactor(factor2) {
                factor = factor2;
            },
            getRandom() {
                let random = kabum.rand(factor, 3.5 * factor);
                return random;
            },
            getFactor() {
                return factor;
            }
        }
    }



    //stop all cacti elements
    function updateCactiMovement() {
        cacti.forEach(cactus => {
            if (moving) {
                cactus.pos.x -= cactus.getSpeed();
            }
        });
    }

    function updateParallaxMovement() {
        parallax.forEach(par => {
            if (moving) {
                par.pos.x -= par.getSpeed();
            }
        });
    }

    function updateCloudMovement() {
        clouds.forEach(par => {
            if (moving) {
                par.pos.x -= par.getSpeed();
            }
        });
    }

    function setCactiSpeed(speed) {
        SPEED = speed;
        cacti.forEach(cactus => {
            cactus.setSpeed(speed);
        });
    }

    function stopCacti() {
        moving = false; // Cambia el estado para detener el movimiento
        spawn = false;
    }
    function addBoom(x, y) {
        let boom = kabum.add([
            kabum.sprite("boom"),
            kabum.anchor("center"),
            kabum.pos(x, y),
            kabum.scale(SCALE),
            kabum.z(100000),
            "boom",
        ]);
        boom.play("boom", {
            loop: false
        });
        kabum.setGravity(1000*SCALE);
        kabum.shake();

        kabum.wait(1, () => {
            kabum.destroy(boom);
        });
    }
    // lose if player collides with any game obj with tag "cactus"
    function onColide() {
        player.onCollide("cactus", () => {
            lives--;
            // Destruye el kabum.sprite de la vida

            addBoom(player.pos.x + 34 * SCALE, player.pos.y + 20 * SCALE);
          
                stopCacti();
                kabum.destroy(player);
                if (lives > 0) {
                kabum.wait(1, () => {
                    moving = true;
                    kabum.wait(SCALE, () => { 
                    spawn=true
                    livesSprites[lives - 1].destroy();
                    addPlayer();
                   
                    });
                });
            } else {
                kabum.wait(0.5, () => {
                    kabum.go("lose", score);

                });
            }
        });
    }


    // keep track of score

    const scoreLabel = kabum.add([
        kabum.text(score, { font: "pixelFont" }),
        kabum.pos(24, 24),kabum.z(1000),
        kabum.scale(SCALE/2)
    ]);
    const speedLabel = kabum.add([
        kabum.text('speed:' + SPEED, { font: "pixelFont" }),
        kabum.pos(kabum.width()-20, 60),
        kabum.anchor("topright"),kabum.z(1000),
        kabum.scale(SCALE/3)

    ]);
    const spawnLabel = kabum.add([
        kabum.text('Respawn: ' + respawnTime, { font: "pixelFont" }),
        kabum.pos(kabum.width()-20, 100),
        kabum.anchor("topright"),kabum.z(1000),
        kabum.scale(SCALE/3)

    ]);

    function velocityUp() {
        setCactiSpeed(SPEED + 1.01);
    }
    function respawnUp() {
        respawnTime.setRespawnFactor(respawnTime.getFactor() * 0.99);
    }

    // increment score every frame
    kabum.onUpdate(() => {
        updateCactiMovement();
        updateParallaxMovement();
        updateCloudMovement();
        if(moving){
            score++;
        }
        scoreLabel.text = '- '+score+' -';
        let speedtext = SPEED
        speedLabel.text =  'Speed: '+ Math.floor(SPEED -10)
        spawnLabel.text = 'Respawn: '+ Math.floor((1-respawnTime.getFactor())*1000);  

        //define Lebels
        if(score <5000){
            if (score % 500 === 0) {
                velocityUp();
            } 
        }else if(score===5000){
            SPEED = 10;
        }else if(score>5000){
            if (score % 500 === 0) {
                respawnUp();
            } if (score % 500 === 0 &&SPEED<20) {
                velocityUp();
            }
        }
        
    });
});


kabum.scene("start", gameStart);
kabum.scene("lose", gameLose);
kabum.go("start");
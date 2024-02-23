import kaboom from "kaboom"
import { gameStart } from "./start.js";
import { gameLose } from "./lose.js";
// kaboom()

kaboom({
    global: true,
    fullscreen: true,
    font: "sans-serif",
    // width: 320,
    // height: 240,
    scale: 1,
    debug: true,
    background: [255, 255, 255, 0],
    root: document.getElementById('jueguito'), // Especifica el contenedor del juego
    // width: 600, // Ancho del canvas, asegúrate de que coincida con el contenedor
    // height: 400, // Alto del canvas, asegúrate de que coincida con el contenedor
    // Puedes añadir aquí más configuraciones según necesites
})

// clearColor(0, 0, 0, 1)
// document.body.style.backgroundColor = "red";
// setGravity(2400)
// loadBean()
// const player = add([
//     sprite("bean"),  // renders as a sprite
//     pos(120, 80),    // position in world
//     area(),          // has a collider
//     body(),          // responds to physics and gravity
// ])

// onKeyPress("space", () => {
//     // .jump() is provided by the body() component
//     player.jump()
// })

// add([
// 	pos(120, 80),
// 	sprite("bean"),
// ])
const FLOOR_HEIGHT = 4;
const SCALE = 2.5;
const FLOOR_HIGHT = 100;
const FLOOR_COLLISION = 30;
const JUMP_FORCE = 1700;
const GRAVITY = 4000;
let SPEED = 10;
loadFont("pixelFont", "fonts/Minecraft.ttf");

loadSpriteAtlas("sprites/miquiDino.png", {
    "miquiDino": {
        x: 0,
        y: 0,
        width: 192,
        height: 64,
        sliceX: 3,
        anims: {
            idle: 0,
            run: { from: 1, to: 2, speed: 10, loop: true },
            jump: 2,
        },

    }
});

loadSpriteAtlas("sprites/boom.png", {
    "boom": {
        x: 0,
        y: 0,
        width: 1216,
        height: 93,
        sliceX: 19,
        anims: {
            boom: { from: 0, to: 18, speed: 19 },
        },

    }
});



loadSpriteAtlas("sprites/miquiCactus.png", {
    "cactus": {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        sliceX: 4,
    }
});
loadSpriteAtlas("sprites/miquiCactus.png", {
    "cactus2": {
        x: 100,
        y: 0,
        width: 50,
        height: 50
    }
});


loadSprite("face", "sprites/miquiFace.png")

scene("game", () => {
    let player;
    let lives = 4;
    let livesSprites = []; // Array para almacenar los sprites de las vidas
    let respawnTime = RespawnTime();
    function showLives() {

        for (let i = 0; i < lives - 1; i++) {
            const lifeSprite = add([
                sprite("miquiDino"),
                pos(80 + 60 * i, 40),
                scale(SCALE / 2),
                rotate(30),
                color(255, 255, 255),
            ]);

            livesSprites.push(lifeSprite); // Añade el sprite al array
        }
    }
    showLives();
    // define gravity
    setGravity(GRAVITY);

    // add a game object to screen
    // floor
    add([
        rect(width(), FLOOR_HEIGHT),
        // outline(4),
        pos(0, height() - FLOOR_HIGHT),
        anchor("botleft"),
        area({ offset: vec2(0, FLOOR_COLLISION) }),
        body({ isStatic: true }),
        color(127, 127, 127),
        "floor"
    ]);


    addPlayer();
    function addPlayer() {
        player = add([
            // list of components
            sprite("miquiDino"),
            pos(80, 40),
            scale(SCALE, SCALE),
            area({
                offset: vec2(12, 3),
                shape: new Polygon([vec2(0), vec2(32, 0), vec2(25, 52), vec2(5, 52)]),
            }),
            body(),
        ]);
        onColide();
        player.onCollide("floor", () => {
            console.log("floor");
            player.play("run");
        });
    }




    function jump() {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE);
            player.play("jump");
        }
    }

    // jump when user press space
    onKeyPress("space", jump);
    onClick(jump);
    let cacti = [];
    let moving = true;

    function addCactus() {
        let cactus;
        let frameIndex = randi(0, 5);
        if (frameIndex == 4) {
            cactus = add([
                sprite("cactus2"),
                scale(SCALE, SCALE),
                area({ shape: new Polygon([vec2(2), vec2(48, 0), vec2(46, -45), vec2(4, -45)]) }),
                pos(width(), height() - FLOOR_HEIGHT - FLOOR_HIGHT + FLOOR_COLLISION),
                anchor("botleft"),
                // move(LEFT, SPEED),
                "cactus",
                speed()
            ]);
        } else {
            cactus = add([
                sprite("cactus", { frame: frameIndex }),
                scale(SCALE, SCALE),
                area({ shape: new Polygon([vec2(2), vec2(23, 0), vec2(21, -45), vec2(4, -45)]) }),
                pos(width(), height() - FLOOR_HEIGHT - FLOOR_HIGHT + FLOOR_COLLISION),
                anchor("botleft"),
                // move(LEFT, SPEED),
                "cactus",
                speed()
            ]);
        }
        cacti.push(cactus); // Añadir el cactus al array de cacti
        cacti.length > 5 && destroy(cacti.shift());
    }

    function speed() {
        let speed = SPEED;
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
        if (moving) {
            addCactus();
        }

        wait(respawnTime.getRandom(), spawnCactus);
    }
    spawnCactus();

    function RespawnTime() {
        let factor = 1;
        return {
            setRespawnFactor(factor2) {
                factor = factor2;
            },
            getRandom() {
                let random = rand(factor, 3.5 * factor);
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

    function setCactiSpeed(speed) {
        SPEED = speed;
        cacti.forEach(cactus => {
            cactus.setSpeed(speed);
        });
    }

    function stopCacti() {
        moving = false; // Cambia el estado para detener el movimiento
    }
    function addBoom(x, y) {
        let boom = add([
            sprite("boom"),
            anchor("center"),
            pos(x, y),
            scale(SCALE),
            "boom",
        ]);
        boom.play("boom", {
            loop: false
        });

        wait(1, () => {
            destroy(boom);
        });
    }
    // lose if player collides with any game obj with tag "cactus"
    function onColide() {
        player.onCollide("cactus", () => {
            lives--;
            // Destruye el sprite de la vida

            addBoom(player.pos.x + 34 * SCALE, player.pos.y + 20 * SCALE);
            if (lives > 0) {
                stopCacti();
                destroy(player);
                wait(2, () => {

                    livesSprites[lives - 1].destroy();

                    addPlayer();
                    moving = true;
                });
            } else {
                go("lose", score);
            }
        });
    }


    // keep track of score
    let score = 0;

    const scoreLabel = add([
        text('- ' + score + ' -', { font: "pixelFont" }),
        pos(24, 24),
    ]);

    function velocityUp() {
        setCactiSpeed(SPEED * 1.05);
    }
    function respawnUp() {
        respawnTime.setRespawnFactor(respawnTime.getFactor() * 0.95);
    }

    // increment score every frame
    onUpdate(() => {
        updateCactiMovement();
        score++;
        scoreLabel.text = score;
        if (score % 500 === 0) {
            respawnUp();
        } else if (score % 2000 === 0) {
            velocityUp();
        }
    });
});


scene("start", gameStart);
scene("lose", gameLose);
go("lose",20000);
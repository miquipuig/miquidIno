import kaboom from "kaboom"
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

        for (let i = 0; i < lives-1; i++) {
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
                 
                        livesSprites[lives-1].destroy();
                    
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
        text(score, { font: "pixelFont" }),
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

scene("lose", (score) => {

    const face = add([
        sprite("face"),
        pos(width() / 2 + 10, height() / 2),
        scale(SCALE),
        anchor("bot"),
        rotate(5),

    ]);
    let isFlipped = false;

    let direction = 1; // Dirección de la rotación
    // display score
    add([
        text(score, { font: "pixelFont" }),
        pos(width() / 2, height() / 2 + 80),
        scale(2),
        anchor("center"),

    ]);
    const loseMessages = [
        "You're no pro at this, that's for sure.",
        "Oops! Did your cat walk on the keyboard?",
        "Maybe try again, this time with your eyes open?",
        "Are you playing with your feet? Just asking!",
        "Legend says you'll win... someday.",
        "Was that really your best effort?",
        "You're breaking records! ...for the most losses.",
        "Is it lag, or is it just your skills?",
        "Game Over! Or was it just a practice run?",
        "On the bright side, you're getting really good at losing.",
        "Press space to continue pretending you have a chance",
        "Your dedication to finding all possible ways to lose is commendable.",
        "Don't worry, we're all winners here. Just some are more winnery than others.",
        "Your gaming skill is like a fine wine; it needs years to develop.",
        "Keep calm and blame it on the game's physics.",
        "You're not losing; you're just giving everyone else a chance to feel good.",
        "Congratulations! You've just discovered yet another way to lose.",
        "Winning is overrated anyway. Let's focus on participation."
    ];

    const middleMessage = [
    "You're not terrible, the game is just extra hard. Yeah, let's go with that.",
    "Congratulations on making it halfway! The rest is just a minor detail, right?",
    "You're halfway to legend status. Now, just the other half to go!",
    "Impressive...ish. You've mastered the art of almost getting there.",
    "Not quite at the finish line, but at least you found the starting line!",
    "You're walking the tightrope between success and... almost success.",
    "You've got the appetizer down; now for the main course!",
    "You're the king of almost-there. All hail the nearly-there monarch!",
    "You've passed the tutorial with flying colors. Now, onto the real game..."

    ];
    
    // Función para obtener una frase aleatoria
// Función para obtener una frase aleatoria y ajustarla si es muy larga
function getRandomLoseMessageAdjusted() {
    const randomIndex = Math.floor(Math.random() * loseMessages.length);
    let message = loseMessages[randomIndex];
    const maxLineLength = 30; // Ajusta este valor a la longitud máxima deseada por línea
    
    // Función para dividir el mensaje en varias líneas si es necesario
    function splitMessageIntoLines(str, maxLength) {
        let result = [];
        let currentLine = '';

        str.split(' ').forEach(word => {
            if ((currentLine + word).length <= maxLength) {
                currentLine += `${word} `;
            } else {
                result.push(currentLine.trim());
                currentLine = `${word} `;
            }
        });

        // Añadir lo que queda si no está vacío
        if (currentLine.trim()) {
            result.push(currentLine.trim());
        }

        return result.join('\n');
    }

    // Ajustar el mensaje si es necesario
    if (message.length > maxLineLength) {
        message = splitMessageIntoLines(message, maxLineLength);
    }

    return message;
}

// Usar la función ajustada al añadir el texto
add([
    text(getRandomLoseMessageAdjusted(), { font: "pixelFont", size: 24 }),
    pos(width() / 2, height() / 2 + 130),
    scale(SCALE / 2),
    anchor("center"),
]);

    loop(0.7, () => {
        isFlipped = !isFlipped;
        face.scale.x = isFlipped ? -SCALE : SCALE;

        // Cambiar la dirección de la rotación cada vez
        direction *= -1;
        // Convertir grados a radianes para la rotación y aplicarla
        face.angle = -direction * 10;
        face.pos.x += direction * 20;
    });
    // go back to game with space is pressed
    onKeyPress("space", () => go("game"));
    onClick(() => go("game"));

});

scene("start", (score) => {
    const STARTGRAVITY = 0.07;
    const ROPELENGTH = height() / 2;
    let swinging = true;
    direction = 1; // Dirección de la rotación
    let swingingMax = 50; // Grados máximos de inclinación
    let velocidadBalanceo = 2; // Velocidad de balanceo
    //añade cuerda


    let positionRope = { x: width() / 2, y: height() / 3, angle: 0, vx: 0, vy: 0, va: 0 };
    let positionCharacter = { x: width() / 2, y: height() / 3, angle: 0, vx: 0, vy: 0, va: 0 };

    let rope = add([
        rect(2 * SCALE, ROPELENGTH),
        // outline(4),
        pos(positionRope.x, positionRope.y),
        anchor("bot"),
        // area({ offset: vec2(0, FLOOR_COLLISION) }),
        // body({ isStatic: true }),
        color(127, 127, 127),
        "rope"
    ]);

    let mainCharacter = add([sprite("miquiDino"), pos(positionRope.x - 4 * SCALE, positionRope.y - 7 * SCALE), scale(SCALE), anchor("center")]);
    let t = 0;
    // loop(0.7, () => {
    //     // mainCharacter.scale.x = isFlipped ? -SCALE : SCALE;

    //     // Cambiar la dirección de la rotación cada vez
    //     direction *= -1;
    //     // Convertir grados a radianes para la rotación y aplicarla
    //     mainCharacter.angle = -direction * 10;
    //     mainCharacter.pos.x += direction * 20;
    // });
    onUpdate(() => {
        const tiempo = time() * velocidadBalanceo;

        pendulumPositionAtAngle(tiempo);

        mainCharacter.pos.x = positionCharacter.x;
        mainCharacter.pos.y = positionCharacter.y;
        mainCharacter.angle = positionCharacter.angle;
        rope.pos.x = positionRope.x;
        rope.pos.y = positionRope.y;
        rope.angle = positionRope.angle;


    });
    function pendulumPositionAtAngle(tiempo) {


        let x, y, a;
        a = swingingMax * Math.sin(tiempo);
        x = ROPELENGTH * Math.sin(-positionRope.angle * (Math.PI / 180)) + width() / 2;
        y = ROPELENGTH * Math.cos(-positionRope.angle * (Math.PI / 180));
        positionRope.vx = x - positionRope.x;
        positionRope.vy = y - positionRope.y;
        positionRope.va = a - positionRope.angle;
        positionRope.x = x;
        positionRope.y = y;
        positionRope.angle = a;
        console.log(positionRope.vx, positionRope.vy);
        if (swinging) {
            positionCharacter.x = positionRope.x;
            positionCharacter.y = positionRope.y;
            positionCharacter.vx = positionRope.vx;
            positionCharacter.vy = positionRope.vy;
            positionCharacter.angle = positionRope.angle;
            positionCharacter.va = positionRope.va;
        } else {
            moveCharacter();
        }
    }
    //x y movement using vx and vy
    function moveCharacter() {
        positionCharacter.x += positionCharacter.vx;
        positionCharacter.y += positionCharacter.vy;
        positionCharacter.vy += STARTGRAVITY;
        positionCharacter.angle += positionCharacter.va;
    }
    add([
        text("PRESS SPACE TO START", { font: "pixelFont" }),
        pos(width() / 2, height() / 2 + 80),
        scale(1.5),
        anchor("center"),

    ]);


    // onKeyPress("space", () => go("game"));
    onKeyPress("space", () => {
        stopSwinging();
    });
    onClick(() => stopSwinging());

    function stopSwinging() {
        swinging = false;
        wait(2.5, () => {
            go("game");
        });
    }

});

go("start");
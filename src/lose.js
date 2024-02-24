const SCALE = 2.5;
export const gameLose = (score) => {
    let gooo = false;
    // display score
    add([
        text(score, { font: "pixelFont" }),
        pos(width() / 2, height() / 2 + 80),
        scale(SCALE*1.25),
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
        "You're the king of almost-there. All hail the monarch of perpetual misses!",
        "You've passed the tutorial with flying colors. Now, onto the real game..."

    ];

    const winMessages = [
        "You're a winner! Or at least, you're not a loser.",
        "Impressive! Your skills have finally caught up with your confidence.",
        "You did it! You're officially the best at this game.",
        "Congratulations! You've just won the game. Now what?",
        "Champion status achieved! Was it skill, or did the game just take pity on you?",
        "Look at you, winning and all! Did you finally read the instructions, or was it pure luck?",
        "You've surpassed all expectations! Mainly because they were so low to begin with.",
        "Masterful performance! It's almost like you knew what you were doing this time",
        "You conquered the challenge! Should we check if someone was playing for you?"
    ];


    // Función para obtener una frase aleatoria
    // Función para obtener una frase aleatoria y ajustarla si es muy larga
    function getRandomLoseMessageAdjusted() {
        let messages;
        if (score > 15000) {
            messages = winMessages;
            faceWin();

        } else if (score > 7000) {

            messages = middleMessage;
            faceAlmostWin();
        } else {
            messages = loseMessages
            faceLose();
        }

        const randomIndex = Math.floor(Math.random() * messages.length);
        let message = messages[randomIndex];
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
    function addMessageInLines(message) {
        let lines = message.split('\n');

        lines.forEach((line, index) => {
            add([
                text(line, { font: "pixelFont" }),
                scale(SCALE),
                pos(width() / 2, height() / 2 + 50 * SCALE + SCALE * 10 * index),
                scale(SCALE * 0.3),
                anchor("center"),
            ]);
        });

    }
    addMessageInLines(getRandomLoseMessageAdjusted());
    //funcion que dado un índice devuelve un numero menor cuando mayor es el indice pero que siempre da dos valores seguidos iguales. Cuando el indice es 0 el valor es el mayor posible 1 y luego va decreciendo dividiendo 1 por el emento siguiente
    function decreaseSize(index) {
        // Calcula el exponente basado en el índice.
        // Cada dos índices, el exponente disminuye en 1 (ej. 0→0, 1-2→-1, 3-4→-2, etc.)
        if (index === 0) {
            return 1; // Retorna 1 para el índice 0.
        } else {
            // Para índices 1 y 2, n = 3. Para índices 3 y 4, n = 4, y así sucesivamente.
            // Calculamos el valor de n sumando 3 al resultado de dividir el índice por 2 y redondear hacia abajo.
            const n = Math.floor(index / 2) + 3;
            return 2 / n; // Retorna 2 dividido por n.
        }
    }

    function alternateEvenOddIndex(index) {
        // Base case for index 0
        if (index === 0) return 0;

        // Calculate the base number and ensure it's even
        let baseNumber = Math.ceil(index / 2) * 2;

        // Alternate the sign based on whether the index is even or odd
        // Even indices get a positive sign, odd indices get negative
        let sign = index % 2 === 0 ? 1 : -1;

        return baseNumber * sign;
    }


    function faceAlmostWin() {
        let faces = [];
        let face

        for (let i = 9; i >= 0; i--) {
            face = add([
                sprite("face"),
                pos(width() / 2 + (alternateEvenOddIndex(i) * SCALE * 25) * decreaseSize(i + 1) + 2 * SCALE, height() / 2),
                scale(SCALE * decreaseSize(i + 1)),
                anchor("bot"),
                "face"
            ]);
            faces.push(face);
        }

        let vx = -1;
        let ay = -1
        let vy = -1
        onUpdate(() => {

            //cambiar pos x para todas las caras
            if (!gooo) {
                faces.forEach(face => {
                    face.pos.x += vx;
                });
            } else {
                faces.forEach(face => {
                    face.pos.y += vy;
                });
                vy = vy + ay;
            }




        });

        let count = 0
        loop(0.2, () => {

            //tiro una moneda al aire usando rand
            if (randi(0, 2) === 1) {

                let size = rand(0.5, 1)
                let dino = add([
                    sprite("miquiDino"),
                    pos(0, height() * 9 / 10 + size * SCALE * 30),
                    scale(SCALE * size),
                    anchor("bot"),
                    move(RIGHT, randi(400, 600)),
                    "dino"
                ]);
                dino.play("run");
            }
        });



        loop(0.6, () => {

            //Si count es impar
            if (count % 2 == 1) {

                vx *= -1;
                ///cambiar la escala de todas las caras
                faces.forEach(face => {
                    face.scale.x = -face.scale.x;
                });
            }
            count++;


        });
    }
    function faceWin() {
        let aa=0
        let va=0
        let faceList = [];
        let pingpong=false;
        const face = add([
            sprite("face"),
            pos(width() / 2 + 10, height() / 2+-SCALE*20),
            scale(SCALE),
            anchor("center"),
            rotate(5),
            "face"
        ]);
        loop(0.2, () => {

            //tiro una moneda al aire usando rand
            if (randi(0, 2) === 1) {

                let size = rand(0.5, 1)
                let dino = add([
                    sprite("miquiDino"),
                    pos(0, height() * 9 / 10 + size * SCALE * 30),
                    scale(SCALE * size),
                    anchor("bot"),
                    move(RIGHT, randi(400, 600)),
                    "dino"
                ]);
                dino.play("run");
            }
        });

        onUpdate(() => {
            if(pingpong){
                for (let i = 0; i < faceList.length; i++) {
                    faceList[i].pos.x += faceList[i].getSpeed().vx;
                    faceList[i].pos.y += faceList[i].getSpeed().vy;
                    faceList[i].angle += faceList[i].getSpeed().vangle;

                }
            }else{
                face.angle += va;
                va=va+aa;
            }

            
        })

        function speed() {

            //función que devuelve 1 o -1 de forma aleratoria
                
            let vel=rand(2,10);
            let angle=rand(0,360);

            let vx=Math.cos(angle)*vel*SCALE;
            let vy=Math.sin(angle)*vel*SCALE;


            let speed={vx,vy,vangle:rand(-1,1)};
            console.log(speed);
            return {
                getSpeed() {
                    return speed;
                },
                setSpeed(newSpeed) {
                    speed = newSpeed;
                },
            }
        }
        wait(1, () => {

            aa = 0.1;
            va = 1;

        wait(5, () => {
            let boom= add([
                sprite("boom"),
                pos(width() / 2 + 10, height() / 2+-SCALE*20),
                scale(SCALE*2),
                anchor("center"),
                "boom"
            ]);
            boom.play("boom", {
                loop: false
            });
            destroy(face);


            wait(0.2, () => {
               
                for (let i = 0; i < 250; i++) {
                    let face = add([

                        sprite("face"),
                        pos(width() / 2 , height() / 2),
                        scale(SCALE*rand(0.05,0.5)),
                        anchor("center"),
                        "face",
                        speed(),
                        rotate(rand(0,360))
                    ]);
                    faceList.push(face);
                }
                wait(0.8, () => {
                    destroy(boom);
                })
                
                pingpong=true;
            })
           
            
        });
    });
    }
    function faceLose() {
        let vx = 10 * SCALE;
        const face = add([
            sprite("face"),
            pos(width() / 2 + 10, height() / 2),
            scale(SCALE),
            anchor("bot"),
            rotate(5),
            "face"

        ]);
        let isFlipped = false;


        let dino = add([
            sprite("miquiDino"),
            pos(-width() / 2, height() * 4 / 5),
            scale(SCALE * 1),
            anchor("top"),
            "dino"
        ]);
        dino.play("run");
        let direction = 1; // Dirección de la rotación
        loop(0.7, () => {
            isFlipped = !isFlipped;
            face.scale.x = isFlipped ? -SCALE : SCALE;
            // Cambiar la dirección de la rotación cada vez
            direction *= -1;
            // Convertir grados a radianes para la rotación y aplicarla
            face.angle = -direction * 10;
            face.pos.x += direction * 20;




        });

        onUpdate(() => {
            if (gooo) {
                dino.pos.x += vx;
            }
        })



    }

    function goToGame() {
        gooo = true;
        wait(1.5, () => {
            destroyAll('dino');
            destroyAll('face');
            
            go("game");
        });
    }
    // go back to game with space is pressed
    onKeyPress("space", () => goToGame());
    onClick(() => goToGame());



};
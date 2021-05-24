const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 720;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const numbers = new Image();
numbers.src = './img/numbers.png';
const timeNumbers = new Image();
timeNumbers.src = './img/time_numbers.png';
const ships = new Image();
ships.src = './img/ships.png';
const boom = new Image();
boom.src = './img/boom.png';

let shooted = false;

let points = 0;

let time = 8;

let round = 1;
document.title = `Round ${round}/5`;

const chooseShip = [
    {x:15,y:5,width:28,height:5},
    {x:51,y:2,width:8,height:22},
    {x:65,y:5,width:16,height:16},
    {x:1,y:16,width:48,height:12},
]

let shipsVelocity = 1;

let booms = [];

//speech api
let speechRecognition = new webkitSpeechRecognition();
speechRecognition.continuous = true;
speechRecognition.interimResults = true;
speechRecognition.lang = 'en-US';

document.onload = speechRecognition.start();



class Boom {
    constructor(x,y) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x;
        this.y2 = y;
        this.x3 = x;
        this.y3 = y;
        this.counter = 0;
    }

    draw() {
        ctx.drawImage(boom, this.x1,this.y1);
        ctx.drawImage(boom, this.x2,this.y2);
        ctx.drawImage(boom, this.x3,this.y3);
        this.y1 += 5;

        this.x2 -= 5;
        this.y2 -= 5;

        this.x3 += 5;
        this.y3 -= 5;
        this.counter++;
    }
}

class Ship {
    constructor(num,x,y) {
        this.x = num === 3 && x > 600 ? -100 : x;
        this.y = y;
        this.num = num;
        this.width = chooseShip[num].width;
        this.height = chooseShip[num].height;
        this.animation = 0;
        this.baseSpeed = this.x > 600 ? -3 : 3;
        this.speed = shipsVelocity * this.baseSpeed;
    }

    move() {
        if(this.num === 5) return;
        this.speed = shipsVelocity * this.baseSpeed;

        if(this.num !== 3) {
            if(this.animation === 0 && this.x > 350 && this.x < 800) {
                this.animation = 1;
                this.num = 2;
                this.width = chooseShip[this.num].width;
                this.height = chooseShip[this.num].height;
                this.x += this.speed;
            }

            if(this.animation === 1) {
                this.x += this.speed;
                if(this.y < 330) {
                    this.y += 5;
                }
                if(this.y > 330) {
                    this.y -= 5;
                }
                if(this.x > 450 && this.x < 700) {
                    this.animation = 2;
                    this.num = 1;
                    this.width = chooseShip[this.num].width;
                    this.height = chooseShip[this.num].height;
                    this.x += this.speed;
                }
                return;
            }

            if(this.animation === 2) {
                this.x += this.speed;
                if(this.y < 330) {
                    this.y += 5;
                }
                if(this.y > 330) {
                    this.y -= 5;
                }
                if(this.y > 320 && this.y < 340) {
                    this.animation = 3;
                    this.num = 0;
                    this.width = chooseShip[this.num].width;
                    this.height = chooseShip[this.num].height;
                    this.x += this.speed;
                }
                return;
            }

            if(this.animation === 3) {
                this.x += this.speed;
            }
        }

        this.x += this.speed;
    }

    draw() {
        if(this.num === 5) return;
        drawShip(this.num, this.x, this.y);
    }
}


const getShip = () => {
    if(Math.random() * 5 < 1) {
        return new Ship(3, Math.random() * -400 - 100, 320);
    }
    const xS = Math.random() <= 0.5 ? Math.random() * -400 - 100 : Math.random() * 400 + 1400;
    const yS = Math.random() <= 0.5 ? Math.random() * 100 + 50 : Math.random() * 200 + 500;
    return new Ship(0, xS, yS);
}


let shipsArray = Array.from({length: Math.floor(Math.random() * 3) + 3}, getShip);

const game = () => {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if(round > 5) {
        document.querySelector('.crosshair').style.display = 'none';
        speechRecognition.stop();
        if(points >= 10) {
            drawNumber((points/10).toFixed(), 525, 315, numbers, 100);
            drawNumber(points-10, 615, 315, numbers, 100);
        } else {
            drawNumber(points, 595, 315, numbers, 100);
        }
        return;
    }

    shipsArray.forEach((s) => {
        s.move();
        s.draw();
    });

    booms.forEach((b) => {
        b.draw();
    });
    booms = booms.filter((b) => b.counter < 20);

    drawPointsTime();

    requestAnimationFrame(game);
    //main game loop
}

const timer = () => {
    setTimeout(() => {
        time--;
        if(time === 0) {
            setTimeout(() => {
                shipsArray = Array.from({length: Math.floor(Math.random() * 3) + 3}, getShip);
                round++;
                shipsVelocity += .15;
                if(round > 5) return;
                document.title = `Round ${round}/5`;
                shooted = false;
                time = 8;
            }, 300);
        }
        timer();
    }, 1000);
}

timer();

const drawPointsTime = () => {
    if(points >= 10) {
        drawNumber((points/10).toFixed(), 1130, 630, numbers);
        drawNumber(points-10, 1180, 630, numbers);
    } else {
        drawNumber(points, 1180, 630, numbers);
    }
    drawNumber(time, 50, 630, timeNumbers);
}

const drawNumber = (num, x, y, img, size=50) => {
    ctx.drawImage(img, num === 0 ? 126 : num * 14 - 14, 0, 14, 14, x, y, size, size);
}

const drawShip = (num, x, y) => {
    ctx.drawImage(ships, chooseShip[num].x, chooseShip[num].y, chooseShip[num].width, chooseShip[num].height, x, y, chooseShip[num].width*3, chooseShip[num].height*3);
    //drawing ship
}

const background = document.querySelector('.background');

const shot = () => {
    if(shooted) return;
    shooted = true;
    background.style.background = `url('./img/shot.png')`;
    setTimeout(() => {
        background.style.background = `url('./img/space_anim.gif')`;
    }, 200);
    //shoot animation

    shipsArray.forEach((s) => {
        //x575,y290,w95,h95
        if(515 < s.x + s.width &&
            670 > s.x &&
            290 < s.y + s.height &&
            385 > s.y) {
                //collision detected
                booms.push(new Boom(s.x + s.width/2, s.y+s.height/2));
                s.num = 5;
                points++;
            }
    })
}

const restart = () => {
    ball.x = 60;
    ball.y = 450;
    ball.vector = {
        x: 5 + Math.random() * 5,
        y: 5 + Math.random() * 5,
    }
    points = 0;
    requestAnimationFrame(game);
}

speechRecognition.onresult = shot;
document.addEventListener('keypress', (e) => e.key === ' ' ? shot() : null);
requestAnimationFrame(game);
import { Socket } from 'socket.io';
export { lPaddle, rPaddle, ball, game }

const CANVASWIDTH = 850;
const CANVASHEIGHT = 585;
const GRID = 15;
const PADDLEHEIGHT = GRID  * 5;
const BALLSPEED = 4;

class lPaddle {
    username: string;
    idClient: string;
    client: Socket;
    x: number;
    y: number;
    width: number;
    height: number;
    dy: number;
    move: number;
    points: number;
    deco: number;

    constructor() {
        this.username = "";
        this.idClient = "";
        this.client = null;
        this.x = GRID * 2;
        this.y = CANVASHEIGHT / 2 - PADDLEHEIGHT / 2;
        this.width = GRID;
        this.height = PADDLEHEIGHT;
        this.dy = 0;
        this.move = 0;
        this.points = 0;
        this.deco = 0;
    }
}

class rPaddle {
    username: string;
    idClient: string;
    client: Socket;
    x: number;
    y: number;
    width: number;
    height: number;
    dy: number;
    move: number;
    points: number;
    deco: number;

    constructor() {
        this.username = "";
        this.idClient = "";
        this.client = null;
        this.x = CANVASWIDTH - GRID * 3;
        this.y = CANVASHEIGHT / 2 - PADDLEHEIGHT / 2;
        this.width = GRID;
        this.height = PADDLEHEIGHT;
        this.dy = 0;
        this.move = 0;
        this.points = 0;
        this.deco = 0;
    }
}

class ball {
    x: number; 
    y: number;
    width: number;
    height: number;
    resetting: boolean;
    dx: number;
    dy: number;

    constructor() {
        this.x = CANVASWIDTH / 2;
        this.y = CANVASHEIGHT / 2;
        this.width = GRID;
        this.height = GRID;
        this.resetting = false;
        this.dx = BALLSPEED;
        this.dy = -BALLSPEED;
    }
}

class game {
    id: number;
    player1: lPaddle;
    player2: rPaddle;
    ball: ball;
    winner: string;
    loser: string;
    status: string;

    constructor() {
        this.id = null;
        this.player1 = new lPaddle();
        this.player2 = new rPaddle();
        this.ball = new ball();
        this.winner = "";
        this.loser = "";
        this.status = "";
    }
}
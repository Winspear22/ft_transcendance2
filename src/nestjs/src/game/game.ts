import { Socket, Server } from "socket.io";
import { lPaddle, rPaddle, ball, game } from "./objects";
export { gameI }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
          obj1.x + obj1.width > obj2.x &&
          obj1.y < obj2.y + obj2.height &&
          obj1.y + obj1.height > obj2.y;
  }

async function gameI(game: game, server: Server) { 
    let ball = game.ball;
    let p1 = game.player1;
    let p2 = game.player2;
    const CANVASWIDTH = 850;
    const CANVASHEIGHT = 585;
    const GRID = 15;
    const MAXPADDLEY = CANVASHEIGHT - GRID - (GRID * 5);
    const PADDLESPEED = 6;

    // for (let i = 5; i >= 0; i--) {
    //     await sleep(1000);
    //     server.to(p1.idClient).emit('countdown', i);
    //     server.to(p2.idClient).emit('countdown', i);
    //   }

    while(1) 
    // while (p1.points < 3 && p2.points < 3)
    {
        await sleep(10);

        if (game.status == "deco")
            break;

        // move paddles by their velocity
        if (game.player1.move == 1)
            p1.dy = -PADDLESPEED;
        else if (game.player1.move == -1)
            p1.dy = PADDLESPEED;
        else
            p1.dy = 0;
        if (game.player2.move == 1)
            p2.dy = -PADDLESPEED;
        else if (game.player2.move == -1)
            p2.dy = PADDLESPEED;
        else
            p2.dy = 0;

        p1.y += p1.dy;
        p2.y += p2.dy;
        
        // prevent paddles from going through walls
        if (p1.y < GRID) {
            p1.y = GRID;
        }
        else if (p1.y > MAXPADDLEY) {
            p1.y = MAXPADDLEY;
        }

        if (p2.y < GRID) {
            p2.y = GRID;
        }
        else if (p2.y > MAXPADDLEY) {
            p2.y = MAXPADDLEY;
        }

        // move ball by its velocity
        ball.x += ball.dx;
        ball.y += ball.dy; 
        
        // prevent ball from going through walls by changing its velocity
        if (ball.y < GRID) {
            ball.y = GRID;
            ball.dy *= -1;
        }
        else if (ball.y + GRID > CANVASHEIGHT - GRID) {
            ball.y = CANVASHEIGHT - GRID * 2;
            ball.dy *= -1;
        }
        // reset ball if it goes past paddle (but only if we haven't already done so)
        if ( (ball.x < 0 || ball.x > CANVASWIDTH) && !ball.resetting) {
            
            if (ball.x < 0)
                p2.points += 1;
            if (ball.x > CANVASWIDTH)
                p1.points += 1;
    
        ball.resetting = true;
    
        // give some time for the player to recover before launching the ball again
        setTimeout(() => { // utiliser sleep
            ball.resetting = false;
            ball.x = CANVASWIDTH / 2;
            ball.y = CANVASHEIGHT / 2;
            }, 1000);
        }
        // check to see if ball collides with paddle. if they do change x velocity
        if (collides(ball, p1)) {
            ball.dx *= -1;
    
            // move ball next to the paddle otherwise the collision will happen again
            // in the next frame
            ball.x = p1.x + p1.width;
        }
        else if (collides(ball, p2)) {
            ball.dx *= -1;
            
            // move ball next to the paddle otherwise the collision will happen again
            // in the next frame
            ball.x = p2.x - ball.width;
        }
        server.to(game.player1.idClient).emit('Sync', {ball: ball, p1: p1, p2: p2});
        server.to(game.player2.idClient).emit('Sync', {ball: ball, p1: p1, p2: p2});
    }
    
    if (game.status == "deco")
    {
        if (game.player1.deco == 1)
        {
            server.to(game.player2.idClient).emit('finish');
            game.winner = game.player2.username;
            game.loser = game.player1.username;
            game.player2.winner = true;
        }
        if (game.player2.deco == 1)
        {
            server.to(game.player1.idClient).emit('finish');
            game.winner = game.player1.username
            game.loser = game.player2.username;
            game.player1.winner = true;
        }
        game.status = "finish";
    }
    
    if (game.status == "playing")
    {
        server.to(game.player1.idClient).emit('finish');
        server.to(game.player2.idClient).emit('finish');
        game.status = "finish";
        if (game.player1.points > game.player2.points)
        {
            game.winner = game.player1.username;
            game.loser = game.player2.username;
            game.player1.winner = true;
        }
        else
        {
            game.winner = game.player2.username;
            game.loser = game.player1.username;
            game.player2.winner = true;
        }
    }
}
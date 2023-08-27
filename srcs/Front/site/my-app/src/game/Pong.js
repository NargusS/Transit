import React, { useEffect, useRef, useState } from 'react';
import './Pong.css';
import Modal from '../modal/Modal';
import Header from '../Header';
import { useSocket } from '../SocketContext';

const Pong = () => {
    const canvasRef = useRef(null);
    const [player1Score, setPlayer1Score] = useState(0);
    const [player2Score, setPlayer2Score] = useState(0);
    const Height = 600;
    const Width = 800;
    const [ballY, setBallY] = useState(Height / 2);
    const [ballX, setBallX] = useState(Width / 2);
    const fps = 60;
    const paddleWidth = 100;
    const [paddle1Y, setPaddle1Y] = useState(Height / 2 - (paddleWidth / 2));
    const [paddle2Y, setPaddle2Y] = useState(Height / 2 - (paddleWidth / 2));
    const [winner, setWinner] = useState("");
    const [gameOver, setGameOver] = useState(false);
    const ballRadius = 6;
    const [gameStarted, setGameStarted] = useState(false);
    const [buttonVisible, setButtonVisible] = useState(true);
    const [showModal, setshowModal] = useState(false);
    const [ballSpeedY, setBallSpeedY] = useState(0);
    const [ballSpeedX, setBallSpeedX] = useState(10);
    const [roomfull, setRoomfull] = useState(false);
    const paddleSpeed = 20;
    const [playerNumber, setPlayerNumber] = useState(0);
    const [roomName, setRoomName] = useState('');
    const [giveUp, setGiveUp] = useState(false);
    const [player1Name, setPlayer1Name] = useState("");
    const [player2Name, setPlayer2Name] = useState("");

    const socket = useSocket();
    const username = localStorage.getItem('userName');

    const keys = new KeyListener();

    const handleGameStart = () => {
        if (username) {
            socket.auth = { username };
            socket.connect();
        }
        socket.emit("waiting_player");
        setRoomfull(false);
        setshowModal(true);
        setGiveUp(false);
    };

    useEffect(() => {
        socket.on("Opponent_found", (message) => {
            if (message.player1 === username) {
                setPlayerNumber(1);
            } else {
                setPlayerNumber(2);
            }
            setRoomName(message.room_name);
            const array = message.room_name.split("_");
            setPlayer1Name(array[0]);
            setPlayer2Name(array[1]);
            setRoomfull(true);
        });
        return () => {
            socket.off('Opponent_found');
        };
    }, [socket, playerNumber, roomfull, username]);


    useEffect(() => {
        if (roomfull) {
            setshowModal(false);
            setGameStarted(true);
            setButtonVisible(false);
            const newBallY = Height / 2;
            const newBallX = Width / 2;
            setPlayer1Score(0);
            setPlayer2Score(0);
            setBallY(newBallY);
            setBallX(newBallX);
            setGameOver(false);
            setWinner("");
            socket.emit("ballMovement", ({
                rooms_name: roomName, content: {
                    ballX: Width / 2,
                    ballY: Height / 2,
                    player1Score: 0,
                    player2Score: 0,
                    ballSpeedY: ballSpeedY,
                    ballSpeedX: ballSpeedX,
                }
            }));
            socket.emit("paddleMovement", ({
                rooms_name: roomName, content: {
                    paddle1Y: Height / 2 - (paddleWidth / 2),
                    paddle2Y: Height / 2 - (paddleWidth / 2),
                }
            }));
            setRoomfull(false);
        }
    }, [roomfull, Height, Width, ballSpeedX, ballSpeedY, roomName, socket])

    function KeyListener() {
        this.pressedKeys = [];
        this.keydown = function (e) { this.pressedKeys[e.keyCode] = true };
        this.keyup = function (e) { this.pressedKeys[e.keyCode] = false };
        document.addEventListener("keydown", this.keydown.bind(this));
        document.addEventListener("keyup", this.keyup.bind(this));
    }
    KeyListener.prototype.isPressed = function (key) {
        return this.pressedKeys[key] ? true : false;
    };
    KeyListener.prototype.addKeyPressListener = function (keyCode, callback) {
        document.addEventListener("keypress", function (e) {
            if (e.keyCode === keyCode)
                callback(e);
        });
    };

    const [color, setColor] = useState("#000000")

    const handleColorChange = (event) => {
        setColor(event.target.value);
    };

    const drawAll = () => {
        const ctx = canvasRef.current.getContext('2d');

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, Width, Height);

        ctx.strokeStyle = "#fff";
        ctx.setLineDash([10]);
        ctx.beginPath();
        ctx.moveTo(Width / 2, 0);
        ctx.lineTo(Width / 2, Height);
        ctx.stroke();

        ctx.font = "30px Orbitron";
        ctx.fillStyle = "#888";
        ctx.fillText(player1Name, ((Width / 2) / 2), 30);
        ctx.fillText(player1Score, ((Width / 2) / 2), 100);
        ctx.fillText(player2Name, ((Width / 2) * 1.5), 30);
        ctx.fillText(player2Score, ((Width / 2) * 1.5), 100);

        ctx.fillStyle = "#fff";
        ctx.fillRect(0, paddle1Y, 10, paddleWidth);

        ctx.fillStyle = "#fff";
        ctx.fillRect(Width - 10, paddle2Y, 10, paddleWidth);

        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        if (player1Score === 11 || player2Score === 11) {
            setGameOver(true);
        }
    };

    const moveAll = () => {
        setBallX(ballX + ballSpeedX);
        setBallY(ballY + ballSpeedY);
        socket.emit("ballMovement", ({
            rooms_name: roomName, content: {
                ballX: ballX + ballSpeedX,
                ballY: ballY + ballSpeedY,
                ballSpeedY: ballSpeedY,
                ballSpeedX: ballSpeedX,
            }
        }));

        //collision horizontale paddle interception
        if (ballX > Width - ballRadius || ballX < ballRadius) {
            if (ballX > Width / 2 && (ballY >= paddle2Y && ballY <= paddle2Y + paddleWidth)) {
                setBallSpeedX(-ballSpeedX);
                let deltaY = ballY - (paddle2Y + paddleWidth / 2);
                setBallSpeedY(deltaY * 0.35);
                setBallX(Width - ballRadius);
                socket.emit("ballMovement", ({
                    rooms_name: roomName, content: {
                        ballSpeedY: deltaY * 0.35,
                        ballSpeedX: -ballSpeedX,
                        ballX: Width - ballRadius,
                        ballY: ballY,
                    }
                }));
            } else if (ballX < Width / 2 && (ballY >= paddle1Y && ballY <= paddle1Y + paddleWidth)) {
                setBallSpeedX(-ballSpeedX);
                let deltaY = ballY - (paddle1Y + paddleWidth / 2);
                setBallSpeedY(deltaY * 0.35);
                setBallX(ballRadius);
                socket.emit("ballMovement", ({
                    rooms_name: roomName, content: {
                        ballSpeedX: -ballSpeedX,
                        ballSpeedY: deltaY * 0.35,
                        ballX: ballRadius,
                        ballY: ballY,
                    }
                }));
            } else { //collision horizontale mais pas de paddle
                if (ballX < Width / 2) {
                    setPlayer2Score(player2Score + 1);
                    setBallY(Height / 2);
                    setBallX(Width / 2);
                    setBallSpeedX(-ballSpeedX);
                    setBallSpeedY(0);
                    if (player2Score === 11) {
                        setWinner("PLAYER2");
                        setGameOver(true);
                    }
                    socket.emit("ballMovement", ({
                        rooms_name: roomName, content: {
                            ballSpeedY: 0,
                            ballSpeedX: -ballSpeedX,
                            ballX: Width / 2,
                            ballY: Height / 2,
                        }
                    }));
                    socket.emit('Score', ({
                        rooms_name: roomName, content: {
                            player2Score: player2Score + 1,
                            player1Score: player1Score,
                        }
                    }));
                } else {
                    setPlayer1Score(player1Score + 1);
                    setBallY(Height / 2);
                    setBallX(Width / 2);
                    setBallSpeedX(-ballSpeedX);
                    setBallSpeedY(0);
                    if (player1Score === 11) {
                        setWinner("PLAYER1");
                        setGameOver(true);
                    }
                    socket.emit("ballMovement", ({
                        rooms_name: roomName, content: {
                            ballSpeedY: 0,
                            ballSpeedX: -ballSpeedX,
                            ballX: Width / 2,
                            ballY: Height / 2,
                        }
                    }));
                    socket.emit('Score', ({
                        rooms_name: roomName, content: {
                            player2Score: player2Score,
                            player1Score: player1Score + 1,
                        }
                    }));
                }
            }
        }

        //collision vertical
        if (ballY > Height - ballRadius || ballY < ballRadius) {
            setBallSpeedY(-ballSpeedY);
            if (ballY > Height - ballRadius) {
                setBallY(Height - ballRadius);
                socket.emit("ballMovement", ({
                    rooms_name: roomName, content: {
                        ballY: Height - ballRadius,
                        ballSpeedX: ballSpeedX,
                        ballX: ballX,
                        ballSpeedY: -ballSpeedY,
                        player2Score: player2Score,
                        player1Score: player1Score,
                    }
                }));
            } else if (ballY < ballRadius) {
                setBallY(ballRadius);
                socket.emit("ballMovement", ({
                    rooms_name: roomName, content: {
                        ballY: ballRadius,
                        ballSpeedY: -ballSpeedY,
                        ballSpeedX: ballSpeedX,
                        ballX: ballX,
                        player2Score: player2Score,
                        player1Score: player1Score,
                    }
                }));
            }
        }

        //paddle
        if (playerNumber === 2) {
            if ((keys.isPressed(40) || keys.isPressed(83)) && (paddle2Y + paddleWidth) < Height) { // DOWN
                setPaddle2Y(paddle2Y + paddleSpeed);
                socket.emit("paddleMovement", ({
                    rooms_name: roomName, content: {
                        paddle2Y: paddle2Y + paddleSpeed,
                        paddle1Y: paddle1Y,
                    }
                }));
            } else if ((keys.isPressed(38) || keys.isPressed(90) || keys.isPressed(87)) && paddle2Y > 0) { // UP
                setPaddle2Y(paddle2Y - paddleSpeed);
                socket.emit("paddleMovement", ({
                    rooms_name: roomName, content: {
                        paddle2Y: paddle2Y - paddleSpeed,
                        paddle1Y: paddle1Y,
                    }
                }));
            }
        }
        else if (playerNumber === 1) {
            if ((keys.isPressed(40) || keys.isPressed(83)) && (paddle1Y + paddleWidth) < Height) {
                setPaddle1Y(paddle1Y + paddleSpeed);
                socket.emit("paddleMovement", ({
                    rooms_name: roomName, content: {
                        paddle1Y: paddle1Y + paddleSpeed,
                        paddle2Y: paddle2Y,

                    }
                }));
            } else if ((keys.isPressed(38) || keys.isPressed(90) || keys.isPressed(87)) && paddle1Y > 0) {
                setPaddle1Y(paddle1Y - paddleSpeed);
                socket.emit("paddleMovement", ({
                    rooms_name: roomName, content: {
                        paddle1Y: paddle1Y - paddleSpeed,
                        paddle2Y: paddle2Y,
                    }
                }));
            }
        }
    };

    const GameOver = () => {
        socket.emit("game_over", {
            rooms_name: roomName, content: {
                winner: winner,
                player1Score: player1Score,
                player2Score: player2Score,
            }
        });
        setPlayer1Score(0);
        setPlayer2Score(0);
        setRoomfull(false);
        const ctx = canvasRef.current.getContext('2d');
        ctx.textAlign = "center";
        ctx.fillStyle = "#888";
        ctx.font = "36px Orbitron";
        if ((playerNumber === 1 && player1Score > player2Score) || (playerNumber === 2 && player1Score < player2Score)) {
            ctx.fillText("YOU WON!", Width / 2, 150);
        } else {
            ctx.fillText("YOU LOST...", Width / 2, 150);
        }
        setGameStarted(false);
        setBallY(Height / 2);
        setBallX(Width / 2);
        setPaddle1Y(Height / 2 - (paddleWidth / 2));
        setPaddle2Y(Height / 2 - (paddleWidth / 2));
        setBallSpeedY(0);
        setBallSpeedX(10);
        setRoomName('');
        setPlayerNumber(0);
        setWinner("");
    };

    const Finish = () => {
        window.location.reload();
    }

    useEffect(() => {
        socket.on('KILL', () => {
            setGameOver(true);
            setGiveUp(true);
        })
        return () => {
            socket.off('KILL');
        };
    })

    useEffect(() => {
        socket.on("messagePaddle", (message) => {
            setPaddle2Y(message.paddle2Y);
            setPaddle1Y(message.paddle1Y);
        });
        return () => {
            socket.off("messagePaddle");
        };
    }, [socket])

    useEffect(() => {
        socket.on("messageBall", (message) => {
            setBallSpeedX(message.ballSpeedX);
            setBallSpeedY(message.ballSpeedY);
            setBallX(message.ballX);
            setBallY(message.ballY);
        });
        return () => {
            socket.off("messageBall");
        };
    }, [socket])

    useEffect(() => {
        socket.on("ScoreResponse", (message) => {
            setPlayer2Score(message.player2Score);
            setPlayer1Score(message.player1Score);
        });
        return () => {
            socket.off("ScoreResponse");
        };
    }, [socket])

    const GameLoop = () => {
        useEffect(() => {
            const gameLoop = setInterval(() => {
                if (gameOver === false) {
                    moveAll();
                    drawAll();
                } else {
                    GameOver();
                }
            }, 1000 / fps);
            return () => {
                clearInterval(gameLoop);
            };
        }, []);
        return null;
    };

    const NoWaitingAnymore = () => {
        setshowModal(false);
        if (!gameStarted)
            socket.emit("stop_waiting");
    }

    return (
        <div>
            <Header />
            {buttonVisible && (<button className="big-button" onClick={() => handleGameStart()}><span>PLAY</span></button>)}
            {!gameStarted && <Modal onClose={() => NoWaitingAnymore()} show={showModal}><p>Waiting for another player</p></Modal>}
            <canvas ref={canvasRef} width={Width} height={Height} id="gameCanvas" />
            {gameStarted && <GameLoop />}
            {gameOver && (<button className="big-button" onClick={() => Finish()}><span>DONE</span></button>)}
            {giveUp && (
                <footer>Opponent has given up the party...</footer>
            )}
            <div style={{position: "fixed", bottom: 0, width: "100%", textAlign: "center"}}>
                <span style={{color:"white"}} htmlFor="colorPicker">Select a color:</span>
                <select style={{color:"white"}} id="colorPicker" value={color} onChange={handleColorChange}>
                    <option value="black">Black</option>
                    <option value="darkgreen">Dark Green</option>
                    <option value="pink">Dark Blue</option>
                </select>
            </div>
        </div>
    );
};

export default Pong;

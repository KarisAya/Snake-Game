import "./style/index.less"

let food = {
    element:document.getElementById("food")!,
    get state():[number, number]{return [this.element.offsetLeft,this.element.offsetTop];},
    init(snake?:Snake){
        let state = this.randomState()
        if(snake){
            for (let i = snake.bodies.length-1;i>=0;i--){
                let X = (snake.bodies[i] as HTMLElement).offsetLeft;
                let Y = (snake.bodies[i] as HTMLElement).offsetTop;
                if(X===state[0] && Y===state[1]){this.init(snake)}
            }
        }
        this.element.style.left = state[0] + "px";
        this.element.style.top = state[1]+ "px";
    },
    randomState():[number, number]{
        return [Math.round(Math.random()*29)*10,Math.round(Math.random()*29)*10]
    }
}

food.init()

let speed = {
    elementValue:document.getElementById("speed")!,
    elementPlus:document.getElementById("speed-plus")!,
    elementMinus:document.getElementById("speed-minus")!,
    speed:1,
    increment(){this.elementValue.innerHTML = (this.speed < 5 ? ++this.speed : 5).toString();},
    decrement(){this.elementValue.innerHTML = (this.speed > 1 ? --this.speed : 1).toString();},
}

speed.elementPlus.addEventListener("click", function() {speed.increment()});
speed.elementMinus.addEventListener("click", function() {speed.decrement()});

class Score{
    static element = document.getElementById("score")!;
    score:number;
    constructor(){this.score = 0,Score.element.innerHTML = "0"}
    increment(){Score.element.innerHTML = (++this.score).toString()}
}

enum face{up,down,left,right,stop}
class Snake{
    static element = document.getElementById("snake")!;

    head:HTMLElement;
    face:face;
    stopfase:face;
    state:[number, number];
    bodies:HTMLCollection;
    tail:[number, number];
    speed:number;
    constructor(){
        while (Snake.element.firstChild) {Snake.element.removeChild(Snake.element.firstChild)}
        Snake.element.insertAdjacentHTML("beforeend","<div></div>")
        this.head = document.querySelector("#snake > div") as HTMLElement;
        this.head.style.top = "0px";
        this.head.style.left = "0px";
        this.bodies = Snake.element.getElementsByTagName("div");
        this.face = face.right;
        this.stopfase = face.stop;
        this.state = [0,0];
        this.tail = [0,0];
        this.speed = speed.speed;
    };
    eat() {
        Snake.element.insertAdjacentHTML("beforeend","<div></div>");
        let tail = this.bodies[this.bodies.length-1] as HTMLElement;
        tail.style.left = this.tail[0] + "px",tail.style.top = this.tail[1] + "px";
    };
    isInStage(tuple:[number, number],){
        let X = tuple[0];
        let Y = tuple[1];
        return X >= 0 && X<=290 && Y >= 0 && Y <= 290 
    };
    move() {
        switch (this.face) {
            case face.up:this.state[1] -= 10;break;
            case face.down:this.state[1] += 10;break;
            case face.left:this.state[0] -= 10;break;
            case face.right:this.state[0] += 10;break;
            case face.stop:return true;
        }
        if (this.isInStage(this.state)){
            let tail = this.bodies[this.bodies.length-1] as HTMLElement;
            this.tail = [tail.offsetLeft,tail.offsetTop];
            for (let i = this.bodies.length-1;i>0;i--){
                let X = (this.bodies[i-1] as HTMLElement).offsetLeft;
                let Y = (this.bodies[i-1] as HTMLElement).offsetTop;
                if(X===this.state[0] && Y===this.state[1]){return false}
                (this.bodies[i] as HTMLElement).style.left = X + "px";
                (this.bodies[i] as HTMLElement).style.top = Y + "px";
            }
            this.head.style.left = this.state[0] + "px"            
            this.head.style.top = this.state[1] + "px"
            return true
        }
        else{return false}
    };
}

class Game{
    static overlay = document.getElementById("overlay")!;
    static tips = document.getElementById("tips")!;

    timerInterval:NodeJS.Timeout;
    snake:Snake;
    food:typeof food;
    speed:typeof speed;
    score:Score;
    end:boolean;
    constructor(){
        this.snake = new Snake();
        this.food = food;
        this.speed = speed;
        this.score = new Score();
        this.timerInterval = setInterval(() => {this.run()}, 1000/2**speed.speed);
        this.end = false;
    };
    run(){
        if (this.snake.speed != speed.speed){
            clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {this.run()}, 1000/2**speed.speed);
            this.snake.speed = speed.speed
        }
        if (!this.snake.move()){this.over()}
        if (this.snake.state[0] === this.food.state[0] && this.snake.state[1] === this.food.state[1]){
            this.snake.eat();
            this.food.init(this.snake);
            this.score.increment();
        }
    };
    over(){
        Game.tips.innerHTML = "游戏结束";
        Game.overlay.style.display = "flex";
        clearInterval(this.timerInterval);
        this.end = true;   
    };
}

document.getElementById("overlay")!.addEventListener("click", function() {Game.overlay.style.display = "none"});

let game:Game|undefined = undefined
document.getElementById("main")!.addEventListener("click", function() {
    if (game === undefined || game.end === true){game = new Game()}
});
document.addEventListener("keydown", function(event) {
    Game.overlay.style.display = "none";
    if (game === undefined || game.end === true){game = new Game()}
    else{
        switch(event.key){
            case "ArrowUp":
                game.snake.face = game.snake.face===face.down?face.down:face.up;
                break;
            case "ArrowDown":
                game.snake.face = game.snake.face===face.up?face.up:face.down;
                break;
            case "ArrowLeft":
                game.snake.face = game.snake.face===face.right?face.right:face.left;
                break;
            case "ArrowRight":
                game.snake.face = game.snake.face===face.left?face.left:face.right;
                break;
            case " ":
                if(game.snake.face === face.stop){
                    game.snake.face = game.snake.stopfase;
                    game.snake.stopfase = face.stop;
                }
                else{
                    game.snake.stopfase = game.snake.face;
                    game.snake.face = face.stop;
                }
        }
    };
});
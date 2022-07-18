const cvs= document.getElementById("tetris");
const soc=document.getElementById("score");
const pause=document.getElementById("pause");
const resume=document.getElementById("resume");
const line1=document.getElementById("line");
const level=document.getElementById("level");
const ele=document.getElementById("game-over");
var ispause=false,line=0;
pause.addEventListener("click",()=>ispause=true);
resume.addEventListener("click",()=>{
    ispause=false;
    //dropStart=Date.now();
    drop();
});
const ctx=cvs.getContext("2d");
const ROW=20,SQ=30,COL=13,VACANT="WHITE";
let score=0;
// for drawing suqare on canvas
function drawSquare(x,y,color){
    ctx.fillStyle=color;
    ctx.fillRect(SQ*x,SQ*y,SQ,SQ);
    ctx.strokeStyle="BLACK";
    ctx.strokeRect(SQ*x,SQ*y,SQ,SQ);
}
// creating the board
let board=[];
for(r=0;r<ROW;r++){
    board[r]=[];
    for(c=0;c<COL;c++){
        board[r][c]=VACANT;
    }
}
//drawing board
function drawboard(){
    for(r=0;r<ROW;r++){
        for(c=0;c<COL;c++){
            drawSquare(c,r,board[r][c]);
        }
    }
}
drawboard();
// piece style and color
const PIECE=[
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"Navy"],
    [L,"orange"],
    [I,"cyan"],
    [J,"Purple"],
];
// genrate a random piece of random color
function randomPiece(){
    let r=Math.floor(Math.random()*PIECE.length);// return number between 0-6
    let k=Math.floor(Math.random()*PIECE.length);
    return new Piece(PIECE[r][0],PIECE[k][1]);
}
// initate a piece
let p= randomPiece();
//object piece
function Piece(tetromino,color){
    this.tetromino=tetromino;
    this.color=color;
    this.tetrominoN=0; // always start with first pattern
    this.activeTetromino=this.tetromino[this.tetrominoN];
    // cordinate of tetris pieces
    this.x=3;
    this.y=-3;
}
Piece.prototype.fill= function(color){
    for(r=0;r<this.activeTetromino.length;r++){
        for(c=0;c<this.activeTetromino.length;c++){
            // we draw where it is 1
            if(this.activeTetromino[r][c]){
                drawSquare(this.x+c,this.y+r,color);                
            }
        }
    }
}
// draw a piece on board
Piece.prototype.draw= function(){
    this.fill(this.color);
}//p.draw();
//undraw function
Piece.prototype.unDraw= function(){
    this.fill(VACANT);
}

Piece.prototype.moveDown=function(){
    if (!this.collision(0,1,this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        // we lock the piece and genrate a new one
        //console.log(this.tetromino[this.tetrominoN][1].filter(x=> x==1).length);
        for(i=0;i<this.tetromino[this.tetrominoN].length;i++){
            // adding no of piece to score
            score+=this.tetromino[this.tetrominoN][i].filter(x=> x==1).length;
        }
        this.lock();
        p=randomPiece();
        soc.innerHTML=score;
    }
}
// moving pieces right
Piece.prototype.moveRight=function(){
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}
//moving left
Piece.prototype.moveLeft=function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}
// rotating pieces
Piece.prototype.rotate=function(){
    let nextpattern=this.tetromino[(this.tetrominoN+1)%this.tetromino.length];
    let kick=0;
    if(this.collision(0,0,nextpattern)){
        if(this.c>COL/2){
            //its right wall
            kick=-1;
        }else{
            //its left wall
            kick=1;
        }
    }
    if(!this.collision(kick,0,nextpattern)){
        this.unDraw();
        this.x+=kick;
        this.tetrominoN=(this.tetrominoN+1)%this.tetromino.length;
        this.activeTetromino=this.tetromino[this.tetrominoN];
        this.draw();
    }
}
Piece.prototype.lock=function(){
    for(r=0;r<this.activeTetromino.length;r++){
        for(c=0;c<this.activeTetromino.length;c++){
            // we skip vaccant suare
            if(!this.activeTetromino[r][c]){
                continue;           
            }
            if(this.y-r<0){
                console.log("Game Over");
                ele.classList.add("mystyle")
                // stoping request animation frame
                gameOver=true;
                break;
            }
            // we lock piece
            board[this.y+r][this.x+c]=this.color;
        }
    }
    for(r=0;r<ROW;r++){
        let isRowfull=true;
        for(c=0;c<COL;c++){
            isRowfull &&= (board[r][c]!=VACANT);
        }
        if(isRowfull){
            //we move all the row down
            for(y=r;y>1;y--){
                for(c=0;c<COL;c++){
                    board[y][c]=board[y-1][c];
                }
            }
            // creating row above 0 row
            for(c=0;c<COL;c++){
                board[0][c]=VACANT;
            }
            score+=10;
            line+=1;
            soc.innerHTML=score;
            line1.innerHTML=line;
        }
    }
    // after removing board we update board
    drawboard();
}
// detecting collision
Piece.prototype.collision=function(x,y,piece){
    for(r=0;r<piece.length;r++){
        for(c=0;c<piece.length;c++){
            if(!piece[r][c]){
                continue;
            }
            let newx=this.x+c+x;
            let newy=this.y+r+y;
            if(newx<0 || newx>= COL || newy>=ROW){
                return true;
            }
            if(newy<0){
                continue;
            }
            // chcking if there is locked piece at new postition
            if(board[newy][newx]!=VACANT){
                return true;
            }
        }
    }
    return false;
}
// for controling the piece 
function CONTROL(e){
    if(e.keyCode==37){
        p.moveLeft();
        dropStart=Date.now();
    }else if(e.keyCode==38){
        p.rotate();
        dropStart=Date.now();
    }else if(e.keyCode==39){
        p.moveRight();
        dropStart=Date.now();
    }else if(e.keyCode==40){
        p.moveDown();
    }
}
document.addEventListener("keydown",CONTROL);
// for dropping the piece after 1 sec
let dropStart=Date.now();
let gameOver=false;
function drop(){
    let now=Date.now();
    level.innerHTML=parseInt(score/40);// for increasing the speed of piece
    if(now-dropStart>((1000-(score/40)*100)+50)){
        p.moveDown();
        dropStart=Date.now();
    }if(!gameOver && !ispause){
        requestAnimationFrame(drop);
    }
}
drop();
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
let starsCollectedText;
let starsCollected = 0;
let colorIterator = 0;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', '/assets/pink sky.png');
    this.load.image('ground', '/assets/pink ground.png');
    this.load.spritesheet('star', '/assets/Pixel purple gem.png', { frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('bomb', '/assets/bombs/48x48 - Explosive Assets, Red-Sheet.png', { frameWidth: 48, frameHeight: 48});
    this.load.spritesheet('player', '/assets/hooded guy.png', { frameWidth: 32, frameHeight: 32});
}

function create ()
{
    this.add.image(400, 230, 'sky').setScale(1.5);

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2.5).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'player').setScale(1.5);

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player',
            { 
                start: 24,
                end: 28
            }
        ),
        frameRate: 10,
        repeat: -1,
        flipX: true
    });

    this.anims.create({
        key: 'turn',
        frames: [
            {
                key: 'player',
                frame: 0
            }
        ],
        frameRate: 20
    })

    this.anims.create({
        key: 'shine',
        frames: this.anims.generateFrameNumbers('star',
            {
                start: 0,
                end: 6
            }
        ),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'lightBeep',
        frames: this.anims.generateFrameNumbers('bomb',
            {
                start: 10,
                end: 13
            }
        ),
        frameRate: 2,
        repeat: -1
    })

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    starsCollectedText = this.add.text(425,16, "Stars Collected: 0", {fontSize: '32px', fill: '#000'})

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    stars.children.iterate(function (child) {
        child.anims.play('shine', true);
    })
    bombs.children.iterate(function (child) {
        child.anims.play('lightBeep', true);
    })

    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
        player.flipX = true;
        player.anims.play('walk', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
        player.flipX = false;
        player.anims.play('walk', true);
    }
    else
    {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    starsCollected += 1;
    starsCollectedText.setText('Stars Collected: '+starsCollected);

    if (starsCollected%5 === 0) {
        scalePlayerUp(player);

        var bomb = bombs.create(x, 16, 'bomb').setScale(1.2);
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
    
    if (colorIterator > 6) {
        colorIterator = 0;
    } else {
        colorIterator++;
    }
    changePlayerTint(player, colorIterator);

    stars.create(Phaser.Math.Between(0,800),16,'star');
}

function hitBomb (player)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    player.disableBody(true, true);
    alert("Game Over!");

    gameOver = true;
}

function changePlayerTint(player, iterator) {
    let red = 0xb30000;
    let orange = 0xff9933;
    let yellow = 0xffff00;
    let green = 0x66ff99;
    let blue = 0x0099ff;
    let indigo = 0x6666ff;
    let violet = 0x9900cc;
    let colors = [red, orange, yellow, green, blue, indigo, violet];
    player.setTint(colors[iterator]);
}

function scalePlayerUp(player) {
    let originalScale = player.scale;
    player.setScale(originalScale*1.2).refreshBody();
}
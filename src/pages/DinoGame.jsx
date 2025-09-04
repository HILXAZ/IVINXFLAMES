import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, RotateCw, Trophy, Play, Pause, Zap, Shield, Star, Users } from 'lucide-react';

// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const DINO_WIDTH = 40;
const DINO_HEIGHT = 40;
const DINO_X = 50;
const GROUND_Y = GAME_HEIGHT - 20;
const JUMP_FORCE = 12;
const GRAVITY = 0.6;
const GAME_SPEED = 6;

// Obstacle types
const OBSTACLE_TYPES = [
  { type: 'cactus', width: 20, height: 30, color: '#16A34A', canJumpOver: true },
  { type: 'tallCactus', width: 25, height: 45, color: '#15803D', canJumpOver: true },
  { type: 'rock', width: 30, height: 20, color: '#78716C', canJumpOver: true },
  { type: 'bird', width: 25, height: 15, color: '#DC2626', canJumpOver: false, fliesHigh: true }
];

// Power-up types
const POWERUP_TYPES = [
  { type: 'speed', color: '#F59E0B', icon: '⚡', duration: 5000, effect: 'Speed Boost' },
  { type: 'shield', color: '#3B82F6', icon: '🛡️', duration: 8000, effect: 'Invincibility' },
  { type: 'multiplier', color: '#10B981', icon: '✨', duration: 10000, effect: '2x Score' }
];

const DinoGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('dino_high_score')) || 0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activePowerups, setActivePowerups] = useState([]);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  
  // Game objects
  const gameRef = useRef({
    dino: {
      x: DINO_X,
      y: GROUND_Y - DINO_HEIGHT,
      velocityY: 0,
      isJumping: false,
      isInvincible: false,
      invincibilityTimer: 0
    },
    obstacles: [],
    powerups: [],
    particles: [],
    speed: GAME_SPEED,
    frameCount: 0,
    difficultyLevel: 1
  });

  // Save high score to backend
  const saveHighScore = useCallback(async (newScore) => {
    try {
      await fetch('http://localhost:5050/api/v1/dino/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: newScore, timestamp: new Date().toISOString() })
      });
    } catch (error) {
      console.log('Backend not available, saving locally only');
    }
  }, []);

  // Load high scores from backend
  const loadHighScores = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5050/api/v1/dino/leaderboard');
      const data = await response.json();
      if (data.highScore && data.highScore > highScore) {
        setHighScore(data.highScore);
        localStorage.setItem('dino_high_score', data.highScore);
      }
    } catch (error) {
      console.log('Backend not available, using local high score');
    }
  }, [highScore]);

  useEffect(() => {
    loadHighScores();
    loadLeaderboard();
  }, [loadHighScores]);

  // Load leaderboard from backend
  const loadLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/v1/dino/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const saveScore = async (finalScore) => {
    try {
      const response = await fetch('http://localhost:5050/api/v1/dino/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: finalScore,
          player_name: 'Player' + Date.now().toString().slice(-4)
        }),
      });
      
      if (response.ok) {
        loadLeaderboard(); // Refresh leaderboard
      }
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'KeyP') {
        togglePause();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const handleJump = () => {
    if (gameState === 'playing' && !gameRef.current.dino.isJumping) {
      gameRef.current.dino.velocityY = -JUMP_FORCE;
      gameRef.current.dino.isJumping = true;
    } else if (gameState === 'ready' || gameState === 'gameOver') {
      startGame();
    }
  };

  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  const startGame = () => {
    // Reset game state
    gameRef.current = {
      dino: {
        x: DINO_X,
        y: GROUND_Y - DINO_HEIGHT,
        velocityY: 0,
        isJumping: false,
        isInvincible: false,
        invincibilityTimer: 0
      },
      obstacles: [],
      powerups: [],
      particles: [],
      speed: GAME_SPEED,
      frameCount: 0,
      difficultyLevel: 1
    };
    setScore(0);
    setScoreMultiplier(1);
    setActivePowerups([]);
    setGameState('playing');
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const game = gameRef.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      // Update game state
      updateGame(game);
      
      // Draw everything
      drawGame(ctx, game);
      
      // Check collision
      if (checkCollision(game)) {
        endGame();
        return;
      }
      
      // Continue loop
      if (gameState === 'playing') {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState]);

  const updateGame = (game) => {
    game.frameCount++;
    
    // Update dino
    game.dino.velocityY += GRAVITY;
    game.dino.y += game.dino.velocityY;
    
    // Handle invincibility timer
    if (game.dino.invincibilityTimer > 0) {
      game.dino.invincibilityTimer -= 16; // Assuming 60fps
      if (game.dino.invincibilityTimer <= 0) {
        game.dino.isInvincible = false;
      }
    }
    
    // Ground collision
    if (game.dino.y >= GROUND_Y - DINO_HEIGHT) {
      game.dino.y = GROUND_Y - DINO_HEIGHT;
      game.dino.velocityY = 0;
      game.dino.isJumping = false;
    }
    
    // Progressive difficulty
    game.difficultyLevel = Math.floor(game.frameCount / 1200) + 1;
    const spawnRate = Math.max(40, 90 - game.difficultyLevel * 8);
    const powerupSpawnRate = 300 + Math.random() * 200;
    
    // Spawn obstacles with variety
    if (game.frameCount % spawnRate === 0) {
      const obstacleType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
      game.obstacles.push({
        x: GAME_WIDTH,
        y: obstacleType.type === 'bird' && obstacleType.fliesHigh 
          ? GROUND_Y - 80 
          : GROUND_Y - obstacleType.height,
        width: obstacleType.width,
        height: obstacleType.height,
        color: obstacleType.color,
        type: obstacleType.type,
        canJumpOver: obstacleType.canJumpOver,
        animOffset: Math.random() * Math.PI * 2
      });
    }
    
    // Spawn power-ups occasionally
    if (game.frameCount % powerupSpawnRate === 0 && Math.random() < 0.3) {
      const powerupType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
      game.powerups.push({
        x: GAME_WIDTH,
        y: GROUND_Y - 60,
        width: 20,
        height: 20,
        type: powerupType.type,
        color: powerupType.color,
        icon: powerupType.icon,
        duration: powerupType.duration,
        effect: powerupType.effect,
        animOffset: Math.random() * Math.PI * 2
      });
    }
    
    // Update obstacles
    game.obstacles.forEach(obstacle => {
      obstacle.x -= game.speed;
      // Animate birds
      if (obstacle.type === 'bird') {
        obstacle.y += Math.sin((game.frameCount + obstacle.animOffset) * 0.1) * 0.5;
      }
    });
    
    // Update power-ups
    game.powerups.forEach(powerup => {
      powerup.x -= game.speed;
      powerup.y += Math.sin((game.frameCount + powerup.animOffset) * 0.2) * 0.8;
    });
    
    // Check power-up collisions
    game.powerups.forEach((powerup, index) => {
      if (checkPowerupCollision(game.dino, powerup)) {
        applyPowerup(powerup);
        game.powerups.splice(index, 1);
      }
    });
    
    // Remove off-screen obstacles and power-ups, update score
    const initialObstacleLength = game.obstacles.length;
    game.obstacles = game.obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    game.powerups = game.powerups.filter(powerup => powerup.x + powerup.width > 0);
    
    if (game.obstacles.length < initialObstacleLength) {
      setScore(prev => prev + (10 * scoreMultiplier));
    }
    
    // Increase speed over time (more aggressive)
    if (game.frameCount % 400 === 0) {
      game.speed += 0.8;
    }
  };

  // Enhanced collision detection
  const checkCollision = (game) => {
    if (game.dino.isInvincible) return false;
    
    const dino = {
      x: game.dino.x + 5,
      y: game.dino.y + 5,
      width: DINO_WIDTH - 10,
      height: DINO_HEIGHT - 10
    };
    
    return game.obstacles.some(obstacle => {
      return dino.x < obstacle.x + obstacle.width &&
             dino.x + dino.width > obstacle.x &&
             dino.y < obstacle.y + obstacle.height &&
             dino.y + dino.height > obstacle.y;
    });
  };

  // Power-up collision detection
  const checkPowerupCollision = (dino, powerup) => {
    const distance = Math.sqrt(
      Math.pow(dino.x + DINO_WIDTH/2 - (powerup.x + powerup.width/2), 2) +
      Math.pow(dino.y + DINO_HEIGHT/2 - (powerup.y + powerup.height/2), 2)
    );
    return distance < 25;
  };

  // Apply power-up effects
  const applyPowerup = (powerup) => {
    const game = gameRef.current;
    
    switch (powerup.type) {
      case 'speed':
        game.speed *= 1.5;
        break;
      case 'shield':
        game.dino.isInvincible = true;
        game.dino.invincibilityTimer = powerup.duration;
        break;
      case 'multiplier':
        setScoreMultiplier(2);
        break;
    }

    setActivePowerups(prev => [...prev, {
      ...powerup,
      startTime: Date.now()
    }]);

    // Remove power-up after duration
    setTimeout(() => {
      switch (powerup.type) {
        case 'speed':
          game.speed = Math.max(GAME_SPEED, game.speed / 1.5);
          break;
        case 'shield':
          game.dino.isInvincible = false;
          break;
        case 'multiplier':
          setScoreMultiplier(1);
          break;
      }
      
      setActivePowerups(prev => prev.filter(p => p.startTime !== powerup.startTime));
    }, powerup.duration);
  };

  const drawGame = (ctx, game) => {
    // Draw ground
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, 20);
    
    // Draw dino with invincibility effect
    if (game.dino.isInvincible) {
      ctx.fillStyle = game.frameCount % 10 < 5 ? '#FFD700' : '#22C55E';
    } else {
      ctx.fillStyle = '#22C55E';
    }
    ctx.fillRect(game.dino.x, game.dino.y, DINO_WIDTH, DINO_HEIGHT);
    
    // Add simple dino details
    ctx.fillStyle = game.dino.isInvincible ? '#FFA500' : '#16A34A';
    ctx.fillRect(game.dino.x + 5, game.dino.y + 5, 10, 10); // head
    ctx.fillRect(game.dino.x + 20, game.dino.y + 25, 8, 15); // tail
    
    // Draw obstacles with variety
    game.obstacles.forEach(obstacle => {
      ctx.fillStyle = obstacle.color;
      
      if (obstacle.type === 'bird') {
        // Draw bird with flapping animation
        const flapOffset = Math.sin(game.frameCount * 0.3) * 3;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(obstacle.x + 5, obstacle.y + flapOffset, 15, 5); // wing
        ctx.fillRect(obstacle.x + 5, obstacle.y - flapOffset, 15, 5); // wing
      } else if (obstacle.type === 'rock') {
        // Draw rock
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = '#57534E';
        ctx.fillRect(obstacle.x + 5, obstacle.y + 5, 20, 10);
      } else {
        // Draw cactus varieties
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = obstacle.type === 'tallCactus' ? '#15803D' : '#166534';
        ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
        
        // Add spikes for cacti
        if (obstacle.type === 'cactus' || obstacle.type === 'tallCactus') {
          ctx.fillStyle = '#14532D';
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(obstacle.x + 2 + i * 6, obstacle.y + 2, 2, 4);
          }
        }
      }
    });
    
    // Draw power-ups
    game.powerups.forEach(powerup => {
      const pulse = Math.sin(game.frameCount * 0.2) * 0.2 + 1;
      const size = powerup.width * pulse;
      
      ctx.fillStyle = powerup.color;
      ctx.fillRect(
        powerup.x + (powerup.width - size) / 2,
        powerup.y + (powerup.height - size) / 2,
        size,
        size
      );
      
      // Add glow effect
      ctx.shadowColor = powerup.color;
      ctx.shadowBlur = 10 * pulse;
      ctx.fillRect(
        powerup.x + (powerup.width - size) / 2,
        powerup.y + (powerup.height - size) / 2,
        size,
        size
      );
      ctx.shadowBlur = 0;
      
      // Draw power-up icon (simplified)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(powerup.icon, powerup.x + powerup.width/2, powerup.y + powerup.height/2 + 4);
    });
    
    // Draw clouds for background
    ctx.fillStyle = '#E5E7EB';
    const cloudOffset = (game.frameCount * 0.5) % (GAME_WIDTH + 100);
    for (let i = 0; i < 3; i++) {
      const x = (i * 300 - cloudOffset) % (GAME_WIDTH + 100);
      drawCloud(ctx, x, 30 + i * 20);
    }
  };

  const drawCloud = (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.arc(x + 15, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 30, y, 15, 0, Math.PI * 2);
    ctx.fill();
  };

  const endGame = async () => {
    setGameState('gameOver');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('dino_high_score', score);
      await saveHighScore(score);
    }
    await saveScore(score);
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-300 mb-4 flex items-center justify-center gap-3">
            <Gamepad2 className="w-10 h-10" />
            🦕 Dinosaur Dash
          </h1>
          <p className="text-gray-700 text-lg">
            Jump over cacti and survive as long as possible! Press Space or click to jump.
          </p>
        </div>

        <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6 mb-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              className="w-full bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg border-2 border-blue-300/30 cursor-pointer"
              onClick={handleJump}
            />
            
            {/* Game overlay */}
            {gameState !== 'playing' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg backdrop-blur-sm">
                <div className="text-center text-white">
                  {gameState === 'ready' && (
                    <>
                      <h2 className="text-3xl font-bold mb-4">🦕 Ready to Run?</h2>
                      <p className="mb-6">Press Space or click to start jumping!</p>
                    </>
                  )}
                  {gameState === 'paused' && (
                    <>
                      <Pause className="w-16 h-16 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold mb-4">Game Paused</h2>
                      <p className="mb-6">Press P to resume</p>
                    </>
                  )}
                  {gameState === 'gameOver' && (
                    <>
                      <h2 className="text-3xl font-bold mb-4 text-red-400">💥 Game Over!</h2>
                      <p className="mb-4 text-xl">Score: {score}</p>
                      {score === highScore && score > 0 && (
                        <p className="mb-6 text-yellow-400 text-lg">🎉 New High Score!</p>
                      )}
                    </>
                  )}
                  
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                  >
                    <Play className="w-6 h-6" />
                    {gameState === 'gameOver' ? '🔄 Play Again' : '🚀 Start Game'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-300 mb-1">{score}</div>
            <div className="text-gray-700">Current Score</div>
            {scoreMultiplier > 1 && (
              <div className="text-green-400 text-sm">x{scoreMultiplier} Multiplier!</div>
            )}
          </div>
          <div className="bg-yellow-500/10 backdrop-blur-xl border border-yellow-400/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-300 mb-1 flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6" />
              {highScore}
            </div>
            <div className="text-gray-700">High Score</div>
          </div>
          <div className="bg-green-500/10 backdrop-blur-xl border border-green-400/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-300 mb-1">{Math.floor(gameRef.current.speed * 10)}</div>
            <div className="text-gray-700">Speed Level</div>
          </div>
          <div className="bg-purple-500/10 backdrop-blur-xl border border-purple-400/20 rounded-xl p-4 text-center">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="text-2xl font-bold text-purple-300 mb-1 flex items-center justify-center gap-2 hover:text-purple-200 transition-colors"
            >
              <Users className="w-6 h-6" />
              Board
            </button>
            <div className="text-gray-700">Leaderboard</div>
          </div>
        </div>

        {/* Active Power-ups */}
        {activePowerups.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-400/20 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Active Power-ups:
            </h3>
            <div className="grid md:grid-cols-3 gap-2">
              {activePowerups.map((powerup, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-2xl mb-1">{powerup.icon}</div>
                  <div className="text-gray-700 text-sm">{powerup.effect}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-400/20 rounded-xl p-6 mb-6"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                🏆 Leaderboard
              </h3>
              
              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        index === 0 ? 'bg-yellow-500/20 border border-yellow-400/30' :
                        index === 1 ? 'bg-gray-400/20 border border-gray-400/30' :
                        index === 2 ? 'bg-orange-500/20 border border-orange-400/30' :
                        'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-800 w-8">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <span className="text-gray-700">{entry.player_name || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600">{entry.score}</span>
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600 py-8">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No scores yet. Be the first to play!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            🎮 How to Play:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Controls:</h4>
              <div>• <strong>Space/Click:</strong> Jump over obstacles</div>
              <div>• <strong>P Key:</strong> Pause/Resume game</div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Power-ups:</h4>
              <div>• <strong>⚡ Speed:</strong> Temporary speed boost</div>
              <div>• <strong>🛡️ Shield:</strong> Invincibility for a few seconds</div>
              <div>• <strong>✨ Multiplier:</strong> Double score for a while</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-500/20 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> Avoid cacti, rocks, and birds! Collect power-ups to boost your performance. 
              The game gets faster and more challenging as your score increases!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DinoGame;

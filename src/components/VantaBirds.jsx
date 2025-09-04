import React, { useState, useEffect, useRef } from 'react';

// Realistic Bird Animation without Vanta
const VantaBirds = ({ children }) => {
  const containerRef = useRef(null);
  const birdsRef = useRef([]);
  const animationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Bird class for realistic movement
  class Bird {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = (Math.random() - 0.5) * 4;
      this.size = Math.random() * 4 + 3;
      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = 0.5 + Math.random() * 0.4;
      this.width = width;
      this.height = height;
      this.hue = Math.random() * 80 + 160; // Blue to purple range
      this.opacity = 0.6 + Math.random() * 0.4;
      
      // Enhanced animation properties
      this.bodyPhase = Math.random() * Math.PI * 2;
      this.bodySpeed = 0.02 + Math.random() * 0.03;
      this.tailPhase = Math.random() * Math.PI * 2;
      this.glideTime = 0;
      this.diving = false;
      this.circling = Math.random() > 0.8;
      this.circleRadius = 50 + Math.random() * 100;
      this.circleCenter = { x: x, y: y };
      this.circleAngle = Math.random() * Math.PI * 2;
      this.energy = 0.5 + Math.random() * 0.5;
      
      // Trail effect
      this.trail = [];
      this.maxTrailLength = 8;
    }

    update(birds) {
      // Update trail
      this.trail.push({ x: this.x, y: this.y, age: 0 });
      if (this.trail.length > this.maxTrailLength) {
        this.trail.shift();
      }
      this.trail.forEach(point => point.age++);

      // Special behaviors
      if (this.circling) {
        this.performCircling();
      } else if (Math.random() < 0.001) {
        this.startDiving();
      } else if (Math.random() < 0.0005) {
        this.startCircling();
      }

      // Enhanced flocking behavior
      let sep = this.separate(birds);
      let align = this.align(birds);
      let coh = this.cohesion(birds);

      // Add turbulence and natural variation
      let turbulence = {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1
      };

      // Apply forces with dynamic weights
      let sepWeight = this.diving ? 0.005 : 0.03;
      let alignWeight = this.circling ? 0.005 : 0.015;
      let cohWeight = this.circling ? 0.002 : 0.01;

      this.vx += sep.x * sepWeight + align.x * alignWeight + coh.x * cohWeight + turbulence.x;
      this.vy += sep.y * sepWeight + align.y * alignWeight + coh.y * cohWeight + turbulence.y;

      // Dynamic speed limits based on behavior
      let maxSpeed = this.diving ? 6 : this.circling ? 1.5 : 3;
      let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > maxSpeed) {
        this.vx = (this.vx / speed) * maxSpeed;
        this.vy = (this.vy / speed) * maxSpeed;
      }

      // Update position
      this.x += this.vx;
      this.y += this.vy;

      // Enhanced edge behavior - create swooping turns
      let margin = 100;
      if (this.x < margin) {
        this.vx += (margin - this.x) * 0.001;
        this.vy += Math.sin(Date.now() * 0.01) * 0.02;
      }
      if (this.x > this.width - margin) {
        this.vx -= (this.x - (this.width - margin)) * 0.001;
        this.vy += Math.sin(Date.now() * 0.01) * 0.02;
      }
      if (this.y < margin) {
        this.vy += (margin - this.y) * 0.001;
        this.vx += Math.sin(Date.now() * 0.01) * 0.02;
      }
      if (this.y > this.height - margin) {
        this.vy -= (this.y - (this.height - margin)) * 0.001;
        this.vx += Math.sin(Date.now() * 0.01) * 0.02;
      }

      // Update animation phases
      this.wingPhase += this.wingSpeed * (speed * 0.5 + 0.5);
      this.bodyPhase += this.bodySpeed;
      this.tailPhase += 0.1;
      this.glideTime += 0.1;

      // Reset special behaviors
      if (this.diving && Math.random() < 0.02) {
        this.diving = false;
      }
      if (this.circling && Math.random() < 0.005) {
        this.circling = false;
      }
    }

    startDiving() {
      this.diving = true;
      this.vy += 2;
      this.wingSpeed *= 2;
    }

    startCircling() {
      this.circling = true;
      this.circleCenter = { x: this.x, y: this.y };
      this.circleAngle = 0;
    }

    performCircling() {
      this.circleAngle += 0.05;
      let targetX = this.circleCenter.x + Math.cos(this.circleAngle) * this.circleRadius;
      let targetY = this.circleCenter.y + Math.sin(this.circleAngle) * this.circleRadius;
      
      this.vx += (targetX - this.x) * 0.01;
      this.vy += (targetY - this.y) * 0.01;
    }

    separate(birds) {
      let desiredSeparation = 25;
      let steer = { x: 0, y: 0 };
      let count = 0;

      for (let bird of birds) {
        let distance = Math.sqrt((this.x - bird.x) ** 2 + (this.y - bird.y) ** 2);
        if (distance > 0 && distance < desiredSeparation) {
          let diff = { x: this.x - bird.x, y: this.y - bird.y };
          diff.x /= distance;
          diff.y /= distance;
          steer.x += diff.x;
          steer.y += diff.y;
          count++;
        }
      }

      if (count > 0) {
        steer.x /= count;
        steer.y /= count;
      }

      return steer;
    }

    align(birds) {
      let neighborDist = 50;
      let sum = { x: 0, y: 0 };
      let count = 0;

      for (let bird of birds) {
        let distance = Math.sqrt((this.x - bird.x) ** 2 + (this.y - bird.y) ** 2);
        if (distance > 0 && distance < neighborDist) {
          sum.x += bird.vx;
          sum.y += bird.vy;
          count++;
        }
      }

      if (count > 0) {
        sum.x /= count;
        sum.y /= count;
        return sum;
      }

      return { x: 0, y: 0 };
    }

    cohesion(birds) {
      let neighborDist = 50;
      let sum = { x: 0, y: 0 };
      let count = 0;

      for (let bird of birds) {
        let distance = Math.sqrt((this.x - bird.x) ** 2 + (this.y - bird.y) ** 2);
        if (distance > 0 && distance < neighborDist) {
          sum.x += bird.x;
          sum.y += bird.y;
          count++;
        }
      }

      if (count > 0) {
        sum.x /= count;
        sum.y /= count;
        return { x: (sum.x - this.x) * 0.01, y: (sum.y - this.y) * 0.01 };
      }

      return { x: 0, y: 0 };
    }
  }

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    // Initialize birds
    birdsRef.current = [];
    for (let i = 0; i < 35; i++) {
      birdsRef.current.push(new Bird(
        Math.random() * dimensions.width,
        Math.random() * dimensions.height,
        dimensions.width,
        dimensions.height
      ));
    }

    // Initialize atmospheric particles
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Animation loop
    const animate = () => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      
      // Create atmospheric gradient background
      const gradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
      gradient.addColorStop(0, '#0f0f23');
      gradient.addColorStop(0.3, '#1a1a2e');
      gradient.addColorStop(0.7, '#16213e');
      gradient.addColorStop(1, '#0e1b2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw animated particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.phase += 0.02;
        
        // Wrap particles
        if (particle.x < 0) particle.x = dimensions.width;
        if (particle.x > dimensions.width) particle.x = 0;
        if (particle.y < 0) particle.y = dimensions.height;
        if (particle.y > dimensions.height) particle.y = 0;
        
        const alpha = particle.opacity * (0.5 + Math.sin(particle.phase) * 0.5);
        ctx.fillStyle = `rgba(100, 150, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw birds
      birdsRef.current.forEach(bird => {
        bird.update(birdsRef.current);

        // Draw bird trail
        bird.trail.forEach((point, index) => {
          const alpha = (1 - point.age / bird.maxTrailLength) * bird.opacity * 0.3;
          const size = bird.size * (1 - point.age / bird.maxTrailLength) * 0.5;
          
          ctx.fillStyle = `hsla(${bird.hue}, 60%, 70%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw realistic bird shape with enhanced animation
        ctx.save();
        ctx.translate(bird.x, bird.y);
        
        // Calculate rotation based on velocity with smoothing
        const angle = Math.atan2(bird.vy, bird.vx);
        ctx.rotate(angle);

        // Dynamic body movement
        const bodyBob = Math.sin(bird.bodyPhase) * 0.3;
        const wingFlap = Math.sin(bird.wingPhase) * 0.8;
        const speed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy);
        const speedFactor = Math.min(speed / 3, 1);

        // Draw shadow/depth effect
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(2, 2, bird.size * 2.2, bird.size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Draw bird body with dynamic shape
        const bodyStretch = 1 + speedFactor * 0.3;
        ctx.fillStyle = `hsla(${bird.hue}, 70%, 60%, ${bird.opacity})`;
        ctx.beginPath();
        ctx.ellipse(0, bodyBob, bird.size * 2 * bodyStretch, bird.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw animated wings with realistic motion
        const wingSpread = 0.5 + speedFactor * 0.5;
        const wingBeat = Math.abs(wingFlap) * wingSpread;
        
        ctx.fillStyle = `hsla(${bird.hue}, 50%, 40%, ${bird.opacity * 0.9})`;
        
        // Dynamic wing positioning
        const wingOffset = bird.size * 0.3;
        const wingLength = bird.size * (1.8 + wingBeat * 0.5);
        const wingWidth = bird.size * (0.4 + wingBeat * 0.2);
        
        // Left wing with feather details
        ctx.save();
        ctx.rotate(wingFlap * 0.3);
        ctx.beginPath();
        ctx.ellipse(-wingOffset, -bird.size * (0.7 + wingBeat * 0.3), wingLength, wingWidth, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wing feather lines
        ctx.strokeStyle = `hsla(${bird.hue}, 30%, 30%, ${bird.opacity * 0.6})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const featherX = -wingOffset - wingLength * 0.3 + i * wingLength * 0.2;
          ctx.moveTo(featherX, -bird.size * 0.9);
          ctx.lineTo(featherX + wingLength * 0.1, -bird.size * 0.5);
        }
        ctx.stroke();
        ctx.restore();

        // Right wing with feather details
        ctx.save();
        ctx.rotate(-wingFlap * 0.3);
        ctx.beginPath();
        ctx.ellipse(-wingOffset, bird.size * (0.7 + wingBeat * 0.3), wingLength, wingWidth, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wing feather lines
        ctx.strokeStyle = `hsla(${bird.hue}, 30%, 30%, ${bird.opacity * 0.6})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const featherX = -wingOffset - wingLength * 0.3 + i * wingLength * 0.2;
          ctx.moveTo(featherX, bird.size * 0.9);
          ctx.lineTo(featherX + wingLength * 0.1, bird.size * 0.5);
        }
        ctx.stroke();
        ctx.restore();

        // Draw animated tail
        const tailSway = Math.sin(bird.tailPhase) * 0.2;
        ctx.fillStyle = `hsla(${bird.hue}, 60%, 50%, ${bird.opacity * 0.8})`;
        ctx.save();
        ctx.rotate(tailSway);
        ctx.beginPath();
        ctx.ellipse(-bird.size * 2, 0, bird.size * 0.8, bird.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw head with beak and eye
        ctx.fillStyle = `hsla(${bird.hue}, 80%, 70%, ${bird.opacity})`;
        const headBob = Math.sin(bird.bodyPhase * 2) * 0.1;
        ctx.beginPath();
        ctx.ellipse(bird.size * 1.2, headBob, bird.size * 0.7, bird.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw beak
        ctx.fillStyle = `hsla(30, 70%, 50%, ${bird.opacity})`;
        ctx.beginPath();
        ctx.ellipse(bird.size * 1.8, headBob, bird.size * 0.3, bird.size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw eye with blink animation
        const blinkPhase = Math.sin(bird.bodyPhase * 0.1) > 0.95 ? 0.1 : 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${bird.opacity * blinkPhase})`;
        ctx.beginPath();
        ctx.ellipse(bird.size * 1.4, headBob - bird.size * 0.1, bird.size * 0.15, bird.size * 0.15 * blinkPhase, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye pupil
        ctx.fillStyle = `rgba(0, 0, 0, ${bird.opacity * blinkPhase})`;
        ctx.beginPath();
        ctx.ellipse(bird.size * 1.4, headBob - bird.size * 0.1, bird.size * 0.08, bird.size * 0.08 * blinkPhase, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        minHeight: '100vh', 
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}
    >
      <canvas
        width={dimensions.width}
        height={dimensions.height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default VantaBirds;

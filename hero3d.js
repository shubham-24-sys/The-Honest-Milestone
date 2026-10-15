/**
 * hero3d.js - Interactive 3D/Isometric Canvas Visualization for MILESTONE
 * Features:
 * - Isometric translucent glass steps rising upward
 * - Stylized explorer figure stepping forward
 * - Abstract milestone beacons (₹10K, ₹1L, ₹5L, ₹10L Goal)
 * - Visualized dip-and-recovery path (demonstrating market resilience)
 * - Mouse parallax tilt & ambient floating particles
 * - Accessibility controls (prefers-reduced-motion check & pause toggle)
 */

(function () {
  const canvas = document.getElementById('hero3d');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let isPaused = false;
  let mouseX = 0;
  let mouseY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // Reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) {
    isPaused = true;
  }

  // Setup resolution & resize handling
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize);
  resize();

  // Mouse tilt tracking
  const container = canvas.parentElement;
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    targetTiltX = x * 24;
    targetTiltY = y * 16;
  });

  container.addEventListener('mouseleave', () => {
    targetTiltX = 0;
    targetTiltY = 0;
  });

  // Steps definition: rising with a gentle dip and recovery
  const steps = [
    { x: -220, y: 130, z: -80, width: 90, depth: 65, height: 14, label: 'Start: ₹1,000/mo', sub: 'Chai & Budget' },
    { x: -130, y: 70, z: -40, width: 85, depth: 65, height: 14, label: '₹25,000', sub: 'First Cushion' },
    { x: -40, y: 15, z: 0, width: 90, depth: 65, height: 14, label: '₹1,00,000', sub: 'Habit Locked' },
    // Dip & Rebound section
    { x: 40, y: 45, z: 35, width: 85, depth: 65, height: 14, label: 'Market Dip (-18%)', sub: 'Steady Accumulation', isDip: true },
    { x: 125, y: -25, z: 70, width: 90, depth: 65, height: 14, label: '₹5,00,000', sub: 'Compounding Lift' },
    { x: 215, y: -105, z: 110, width: 105, depth: 75, height: 18, label: '₹10,00,000 Goal', sub: 'Student Millionaire', isGoal: true }
  ];

  // Ambient particles
  const particles = [];
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 400,
      size: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.6 + 0.2,
      speedY: -(Math.random() * 0.4 + 0.15),
      pulse: Math.random() * Math.PI * 2
    });
  }

  let time = 0;

  // 3D Isometric projection helper
  function project(x, y, z, centerX, centerY) {
    const radY = ((currentTiltX + 32) * Math.PI) / 180;
    const radX = ((currentTiltY + 22) * Math.PI) / 180;

    // Rotate Y
    const x1 = x * Math.cos(radY) - z * Math.sin(radY);
    const z1 = x * Math.sin(radY) + z * Math.cos(radY);

    // Rotate X
    const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

    // Perspective factor
    const cameraDist = 800;
    const fov = cameraDist / (cameraDist + z2);

    return {
      x: centerX + x1 * fov,
      y: centerY + y2 * fov,
      depth: z2,
      scale: fov
    };
  }

  // Draw isometric cuboid step (translucent glassmorphism)
  function drawGlassStep(step, centerX, centerY, time) {
    const hw = step.width / 2;
    const hd = step.depth / 2;
    const h = step.height;

    // Top face vertices
    const p1 = project(step.x - hw, step.y, step.z - hd, centerX, centerY);
    const p2 = project(step.x + hw, step.y, step.z - hd, centerX, centerY);
    const p3 = project(step.x + hw, step.y, step.z + hd, centerX, centerY);
    const p4 = project(step.x - hw, step.y, step.z + hd, centerX, centerY);

    // Bottom face vertices
    const b1 = project(step.x - hw, step.y + h, step.z - hd, centerX, centerY);
    const b2 = project(step.x + hw, step.y + h, step.z - hd, centerX, centerY);
    const b3 = project(step.x + hw, step.y + h, step.z + hd, centerX, centerY);
    const b4 = project(step.x - hw, step.y + h, step.z + hd, centerX, centerY);

    // Left front side
    ctx.beginPath();
    ctx.moveTo(p4.x, p4.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(b3.x, b3.y);
    ctx.lineTo(b4.x, b4.y);
    ctx.closePath();
    ctx.fillStyle = step.isGoal
      ? 'rgba(217, 119, 6, 0.45)'
      : step.isDip
      ? 'rgba(224, 122, 40, 0.35)'
      : 'rgba(20, 184, 166, 0.25)';
    ctx.fill();

    // Right front side
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(b2.x, b2.y);
    ctx.lineTo(b3.x, b3.y);
    ctx.closePath();
    ctx.fillStyle = step.isGoal
      ? 'rgba(245, 158, 11, 0.55)'
      : step.isDip
      ? 'rgba(180, 83, 9, 0.3)'
      : 'rgba(13, 148, 136, 0.32)';
    ctx.fill();

    // Top face
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    
    // Top face gradient
    const grad = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
    if (step.isGoal) {
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
      grad.addColorStop(1, 'rgba(217, 119, 6, 0.65)');
    } else if (step.isDip) {
      grad.addColorStop(0, 'rgba(254, 215, 170, 0.65)');
      grad.addColorStop(1, 'rgba(234, 88, 12, 0.45)');
    } else {
      grad.addColorStop(0, 'rgba(204, 251, 241, 0.55)');
      grad.addColorStop(1, 'rgba(45, 212, 191, 0.25)');
    }
    ctx.fillStyle = grad;
    ctx.fill();

    // Subtle edge highlight
    ctx.strokeStyle = step.isGoal ? 'rgba(254, 240, 138, 0.9)' : step.isDip ? 'rgba(253, 186, 116, 0.8)' : 'rgba(153, 246, 228, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Step milestone beacon / flag
    const centerTop = project(step.x, step.y - 12, step.z, centerX, centerY);
    
    if (step.isGoal) {
      // Radiant Glowing Beacon for Goal
      const pulse = 1 + Math.sin(time * 3) * 0.15;
      
      // Outer ambient glow ring
      const glowGrad = ctx.createRadialGradient(centerTop.x, centerTop.y - 20, 4, centerTop.x, centerTop.y - 20, 60 * pulse);
      glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
      glowGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.25)');
      glowGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerTop.x, centerTop.y - 20, 60 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Golden Trophy / Goal Beacon Diamond
      ctx.save();
      ctx.translate(centerTop.x, centerTop.y - 24 + Math.sin(time * 2) * 4);
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(13, 0);
      ctx.lineTo(0, 16);
      ctx.lineTo(-13, 0);
      ctx.closePath();
      ctx.fillStyle = '#FEF08A';
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Glowing Text Badge
      drawBadge(centerTop.x, centerTop.y - 56, step.label, step.sub, '#FEF3C7', '#78350F', '#F59E0B');
    } else if (step.isDip) {
      // Market Dip & Rebound Marker
      drawBadge(centerTop.x, centerTop.y - 28, 'Dip (-18%)', 'Resilience Zone', '#FFEDD5', '#9A3412', '#EA580C');
    } else {
      // Normal milestone indicator
      ctx.beginPath();
      ctx.arc(centerTop.x, centerTop.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#5EEAD4';
      ctx.fill();
      ctx.strokeStyle = '#0F766E';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      drawBadge(centerTop.x, centerTop.y - 26, step.label, step.sub, '#F0FDFA', '#134E4A', '#2DD4BF');
    }
  }

  // Draw elegant floating badge
  function drawBadge(x, y, text, subText, bg, textCol, borderCol) {
    ctx.save();
    ctx.font = '600 11px Inter, sans-serif';
    const textWidth = ctx.measureText(text).width;
    ctx.font = '400 9px Inter, sans-serif';
    const subWidth = ctx.measureText(subText).width;
    const w = Math.max(textWidth, subWidth) + 16;
    const h = 26;

    // Pill background
    ctx.fillStyle = bg;
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, 6);
    ctx.fill();
    ctx.stroke();

    // Main text
    ctx.fillStyle = textCol;
    ctx.font = '600 10.5px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y - 1);

    // Subtext
    ctx.fillStyle = textCol;
    ctx.globalAlpha = 0.8;
    ctx.font = '500 8.5px Inter, sans-serif';
    ctx.fillText(subText, x, y + 9);
    ctx.restore();
  }

  // Draw gentle dip-and-recovery guide curve
  function drawPathCurve(centerX, centerY) {
    ctx.save();
    ctx.beginPath();
    const startP = project(steps[0].x, steps[0].y - 4, steps[0].z, centerX, centerY);
    ctx.moveTo(startP.x, startP.y);

    for (let i = 1; i < steps.length; i++) {
      const p = project(steps[i].x, steps[i].y - 4, steps[i].z, centerX, centerY);
      const prevP = project(steps[i - 1].x, steps[i - 1].y - 4, steps[i - 1].z, centerX, centerY);
      const cpX = (prevP.x + p.x) / 2;
      const cpY = (prevP.y + p.y) / 2 + (steps[i].isDip ? 15 : -8);
      ctx.quadraticCurveTo(cpX, cpY, p.x, p.y);
    }

    ctx.strokeStyle = 'rgba(45, 212, 191, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.restore();
  }

  // Draw the miniature walking figure
  function drawWalker(centerX, centerY, time) {
    // Walker position moves back and forth along steps, currently between step 2 and 3
    const cycle = (Math.sin(time * 0.7) + 1) / 2; // 0 to 1
    // Interpolate between step 1, 2, 3, 4
    const stepIdx = Math.min(Math.floor(cycle * (steps.length - 1)), steps.length - 2);
    const localT = (cycle * (steps.length - 1)) % 1;

    const sA = steps[stepIdx];
    const sB = steps[stepIdx + 1];

    const curX = sA.x + (sB.x - sA.x) * localT;
    const curY = sA.y + (sB.y - sA.y) * localT - 8;
    const curZ = sA.z + (sB.z - sA.z) * localT;

    const walkerPos = project(curX, curY, curZ, centerX, centerY);
    const bob = Math.abs(Math.sin(time * 6)) * 4;

    ctx.save();
    ctx.translate(walkerPos.x, walkerPos.y - 12 - bob);

    // Shadow on current step
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 12 + bob, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (warm ivory coat)
    ctx.fillStyle = '#FAF8F5';
    ctx.beginPath();
    ctx.roundRect(-4.5, -14, 9, 15, 3);
    ctx.fill();

    // Backpack (Saffron student accent)
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.roundRect(-7.5, -12, 4, 9, 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#E5E7EB';
    ctx.beginPath();
    ctx.arc(0, -19, 5, 0, Math.PI * 2);
    ctx.fill();

    // Forward Cap/Visor
    ctx.fillStyle = '#064E3B';
    ctx.beginPath();
    ctx.arc(0, -21, 4.5, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1, -21);
    ctx.lineTo(6, -21);
    ctx.lineTo(4, -19);
    ctx.closePath();
    ctx.fill();

    // Legs walking animation
    const legAngle = Math.sin(time * 7) * 0.45;
    ctx.strokeStyle = '#064E3B';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // Left leg
    ctx.beginPath();
    ctx.moveTo(-2, 1);
    ctx.lineTo(-2 - Math.sin(legAngle) * 7, 10);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(2, 1);
    ctx.lineTo(2 + Math.sin(legAngle) * 7, 10);
    ctx.stroke();

    ctx.restore();
  }

  // Animation Loop
  function render() {
    if (!isPaused) {
      time += 0.02;
    }

    // Smooth tilt interpolation
    currentTiltX += (targetTiltX - currentTiltX) * 0.08;
    currentTiltY += (targetTiltY - currentTiltY) * 0.08;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2 + 30;

    ctx.clearRect(0, 0, width, height);

    // Deep forest atmospheric gradient
    const bgGrad = ctx.createRadialGradient(centerX, centerY - 40, 20, centerX, centerY, width * 0.7);
    bgGrad.addColorStop(0, 'rgba(13, 78, 61, 0.45)');
    bgGrad.addColorStop(0.6, 'rgba(7, 56, 43, 0.2)');
    bgGrad.addColorStop(1, 'rgba(4, 36, 28, 0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ambient floating particles
    for (let p of particles) {
      if (!isPaused) {
        p.y += p.speedY;
        p.pulse += 0.03;
        if (p.y < -200) p.y = 200;
      }
      const alpha = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
      ctx.fillStyle = `rgba(204, 251, 241, ${alpha})`;
      ctx.beginPath();
      ctx.arc(centerX + p.x, centerY + p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connect steps with curve
    drawPathCurve(centerX, centerY);

    // Sort steps by projected depth so back-to-front rendering is correct
    const stepRenderData = steps.map((step) => {
      const p = project(step.x, step.y, step.z, centerX, centerY);
      return { step, depth: p.depth };
    });
    stepRenderData.sort((a, b) => a.depth - b.depth);

    // Render steps
    for (let item of stepRenderData) {
      drawGlassStep(item.step, centerX, centerY, time);
    }

    // Render explorer walker
    drawWalker(centerX, centerY, time);

    animationFrameId = requestAnimationFrame(render);
  }

  render();

  // Expose toggle control for accessibility or demo
  window.toggleHero3DAnimation = function () {
    isPaused = !isPaused;
    const btn = document.getElementById('hero3d-pause-btn');
    if (btn) {
      btn.setAttribute('aria-pressed', isPaused ? 'true' : 'false');
      btn.innerHTML = isPaused
        ? '<svg class="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Resume 3D Motion'
        : '<svg class="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Pause 3D Motion';
    }
  };
})();

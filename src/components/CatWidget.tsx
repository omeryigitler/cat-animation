import { useState, useEffect, useRef } from 'react';

function drawCat(ctx: CanvasRenderingContext2D, x: number, y: number, walkCycle: number, pose: string, elapsed: number, direction: number, scale: number, isDarkMode: boolean, colorTheme: string, accessory: string, catType: string = 'default') {
  ctx.save();
  ctx.translate(x, y);
  // Kedi doğal olarak sola bakıyor, bu yüzden sağa giderken (direction === 1) x ekseninde çeviriyoruz.
  if (direction === 1) {
    ctx.scale(-1, 1);
  }
  
  ctx.scale(scale, scale);

  const bounce = pose === "WALK" ? Math.sin(walkCycle) * 5 : 0;
  ctx.translate(0, bounce - 5);

  const cx = 0;
  const cy = 0;

  let catColor = "#F48B29";
  let lightColor = "#FFE4A0";
  let darkColor = "#D16F19";
  
  if (colorTheme === 'black') {
    catColor = "#2A2A2A";
    lightColor = "#4A4A4A";
    darkColor = "#111111";
  } else if (colorTheme === 'white') {
    catColor = "#F0F0F0";
    lightColor = "#FFFFFF";
    darkColor = "#CCCCCC";
  } else if (colorTheme === 'gray') {
    catColor = "#8A94A0";
    lightColor = "#B0B7C0";
    darkColor = "#5E6670";
  } else if (colorTheme === 'calico') {
    // Basic calico approximation
    catColor = "#E69C30";
    lightColor = "#FFFFFF";
    darkColor = "#2E2A27";
  }
  
  const pink = "#FF8DA1";
  const black = "#1A1A1A";
  const white = "#FFFFFF";
  const stripeColor = colorTheme === 'black' ? "#111111" : colorTheme === 'white' ? "#E0E0E0" : "#3D2314";

  const ellipse = (ex: number, ey: number, rx: number, ry: number, rot: number, start: number, end: number, fill: string | null, stroke: string | null, lw: number) => {
    ctx.beginPath();
    ctx.ellipse(ex, ey, rx, ry, rot, start, end);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  };
  
  const circle = (cx: number, cy: number, r: number, fill: string, stroke: string | null = null, lw: number = 0) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  };
  
  const line = (x1: number, y1: number, x2: number, y2: number, color: string, lw: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const drawStripe = (sx: number, sy: number, len: number, rot: number, lw: number = 3) => {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len/2, -lw, len, 0);
    ctx.quadraticCurveTo(len/2, lw, 0, 0);
    ctx.fillStyle = stripeColor;
    ctx.fill();
    ctx.restore();
  };

  let head_x, head_y;
  
  const bW = catType === 'garfield' ? 1.3 : catType === 'cute' ? 0.8 : 1;
  const bH = catType === 'garfield' ? 1.2 : catType === 'cute' ? 0.9 : 1;

  if (pose === "SIT" || pose === "EAT" || pose === "SLEEP") {
    // Tail
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy + 25);
    const tail_wave = pose === "SLEEP" ? 0 : Math.sin(elapsed * 2) * 10;
    const px1 = cx + 40, py1 = cy + 30;
    const px2 = cx + 50, py2 = cy - 20 + tail_wave;
    ctx.quadraticCurveTo(px1, py1, px2, py2);
    ctx.strokeStyle = catColor;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();

    const getQBez = (p0: number, p1: number, p2: number, t: number) => {
      const mt = 1 - t;
      return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
    };
    const getQBezDeriv = (p0: number, p1: number, p2: number, t: number) => {
      return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);
    };

    const tx = cx + 15, ty = cy + 25;
    const drawTailStripeSIT = (t: number) => {
      const sx = getQBez(tx, px1, px2, t);
      const sy = getQBez(ty, py1, py2, t);
      const dx = getQBezDeriv(tx, px1, px2, t);
      const dy = getQBezDeriv(ty, py1, py2, t);
      const angle = Math.atan2(dy, dx) + Math.PI/2;
      
      const len = 14;
      const lw = 3;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-len/2, 0);
      ctx.quadraticCurveTo(0, -lw, len/2, 0);
      ctx.quadraticCurveTo(0, lw, -len/2, 0);
      ctx.fillStyle = stripeColor;
      ctx.fill();
      ctx.restore();
    };

    drawTailStripeSIT(0.65);
    drawTailStripeSIT(0.85);

    // Body
    ellipse(cx, cy + 12, 28 * bW, 22 * bH, 0, 0, 2 * Math.PI, catColor, null, 0);
    ellipse(cx, cy + 16, 16 * bW, 14 * bH, 0, 0, 2 * Math.PI, lightColor, null, 0);

    // Hind Leg
    ellipse(cx + 10, cy + 25, 20, 16, -Math.PI/6, 0, 2 * Math.PI, catColor, null, 0);
    ellipse(cx + 10, cy + 25, 12, 10, -Math.PI/6, 0, 2 * Math.PI, lightColor, null, 0);
    
    // Front Legs
    ellipse(cx - 12, cy + 38, 9, 5.5, 0, 0, 2 * Math.PI, catColor, darkColor, 1.5);
    ellipse(cx + 3, cy + 38, 9, 5.5, 0, 0, 2 * Math.PI, catColor, darkColor, 1.5);
    // Toes
    line(cx - 15, cy + 41, cx - 14.5, cy + 38, darkColor, 1.5);
    line(cx - 12, cy + 42, cx - 12, cy + 38, darkColor, 1.5);
    line(cx - 9, cy + 41, cx - 9.5, cy + 38, darkColor, 1.5);
    line(cx + 0, cy + 41, cx + 0.5, cy + 38, darkColor, 1.5);
    line(cx + 3, cy + 42, cx + 3, cy + 38, darkColor, 1.5);
    line(cx + 6, cy + 41, cx + 5.5, cy + 38, darkColor, 1.5);

    head_x = cx - 5;
    if (pose === "EAT") {
      head_y = cy + 15 + Math.sin(elapsed * 15) * 5; // Head lowered and bobbing
    } else if (pose === "SLEEP") {
      head_y = cy + 15 + Math.sin(elapsed * 2) * 2; // Breathing slowly
    } else {
      head_y = cy - 20;
    }
  } else if (pose === "SWAT") {
    // Tail
    ctx.beginPath();
    ctx.moveTo(cx + 15, cy + 25);
    const tail_swish = Math.sin(elapsed * 10) * 15;
    const px1 = cx + 40, py1 = cy + 30;
    const px2 = cx + 50, py2 = cy - 20 + tail_swish;
    ctx.quadraticCurveTo(px1, py1, px2, py2);
    ctx.strokeStyle = catColor;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();

    const getQBez = (p0: number, p1: number, p2: number, t: number) => {
      const mt = 1 - t;
      return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
    };
    const getQBezDeriv = (p0: number, p1: number, p2: number, t: number) => {
      return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);
    };

    const tx = cx + 15, ty = cy + 25;
    const drawTailStripeSWAT = (t: number) => {
      const sx = getQBez(tx, px1, px2, t);
      const sy = getQBez(ty, py1, py2, t);
      const dx = getQBezDeriv(tx, px1, px2, t);
      const dy = getQBezDeriv(ty, py1, py2, t);
      const angle = Math.atan2(dy, dx) + Math.PI/2;
      
      const len = 14;
      const lw = 3;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-len/2, 0);
      ctx.quadraticCurveTo(0, -lw, len/2, 0);
      ctx.quadraticCurveTo(0, lw, -len/2, 0);
      ctx.fillStyle = stripeColor;
      ctx.fill();
      ctx.restore();
    };

    drawTailStripeSWAT(0.65);
    drawTailStripeSWAT(0.85);

    // Body
    ellipse(cx, cy + 12, 28 * bW, 22 * bH, 0, 0, 2 * Math.PI, catColor, null, 0);
    ellipse(cx, cy + 16, 16 * bW, 14 * bH, 0, 0, 2 * Math.PI, lightColor, null, 0);

    // Hind Leg
    ellipse(cx + 10, cy + 25, 20, 16, -Math.PI/6, 0, 2 * Math.PI, catColor, null, 0);
    ellipse(cx + 10, cy + 25, 12, 10, -Math.PI/6, 0, 2 * Math.PI, lightColor, null, 0);
    
    // Front Legs
    ellipse(cx + 4, cy + 36, 12, 7, 0, 0, 2 * Math.PI, catColor, null, 0);

    // Swatting arm
    const swat_angle = Math.sin(elapsed * 20) * 0.5;
    ctx.save();
    ctx.translate(cx - 15, cy + 20);
    ctx.rotate(swat_angle - Math.PI/4);
    line(0, 0, -15, 0, catColor, 12);
    circle(-15, 0, 5, catColor, darkColor, 1.5); // paw
    line(-17, 2, -16.5, 4.5, darkColor, 1.5);
    line(-15, 2.5, -15, 5, darkColor, 1.5);
    line(-13, 2, -13.5, 4.5, darkColor, 1.5);
    ctx.restore();

    head_x = cx - 5;
    head_y = cy - 20;
  } else if (pose === "PLAY") {
    // Rolling on back playing
    head_x = cx + 15;
    head_y = cy + 5;
    
    // Tail
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy + 20);
    ctx.quadraticCurveTo(cx - 40, cy + 30, cx - 35, cy - 10 + Math.sin(elapsed * 10) * 10);
    ctx.strokeStyle = catColor;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();

    // Body (upside down)
    ellipse(cx, cy + 15, 35 * bW, 22 * bH, -Math.PI/6, 0, 2 * Math.PI, catColor, null, 0);
    ellipse(cx - 2, cy + 10, 20 * bW, 14 * bH, -Math.PI/6, 0, 2 * Math.PI, lightColor, null, 0);

    // Happy kicking legs
    const kick = Math.sin(elapsed * 15) * 5;
    line(cx - 10, cy + 5, cx - 15 + kick, cy - 15, catColor, 12);
    line(cx, cy + 10, cx + 5 - kick, cy - 10, darkColor, 12);
    circle(cx - 15 + kick, cy - 15, 5, catColor, darkColor, 1.5);
    circle(cx + 5 - kick, cy - 10, 5, darkColor, null, 0);

    // Front paws batting
    const bat = Math.cos(elapsed * 15) * 5;
    line(cx + 10, cy + 20, cx + 25 + bat, cy + 35, catColor, 12);
    circle(cx + 25 + bat, cy + 35, 5, catColor, darkColor, 1.5);
    line(cx + 23 + bat, cy + 36, cx + 24 + bat, cy + 39, darkColor, 1.5);
    line(cx + 25 + bat, cy + 37, cx + 25 + bat, cy + 40, darkColor, 1.5);
    line(cx + 27 + bat, cy + 36, cx + 26 + bat, cy + 39, darkColor, 1.5);
    
  } else {
    // WALK
    const tail_wave = Math.sin(elapsed * 5) * 5;
    const t_start_x = cx + 30, t_start_y = cy - 5;
    const t_ctrl_x = cx + 45, t_ctrl_y = cy - 10;
    const t_end_x = cx + 48, t_end_y = cy - 30 + tail_wave;
    
    ctx.beginPath();
    ctx.moveTo(t_start_x, t_start_y);
    ctx.quadraticCurveTo(t_ctrl_x, t_ctrl_y, t_end_x, t_end_y);
    ctx.strokeStyle = catColor;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();

    const getQBez = (p0: number, p1: number, p2: number, t: number) => {
      const mt = 1 - t;
      return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
    };
    
    const getQBezDeriv = (p0: number, p1: number, p2: number, t: number) => {
      return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);
    };

    const drawTailStripe = (t: number) => {
      const sx = getQBez(t_start_x, t_ctrl_x, t_end_x, t);
      const sy = getQBez(t_start_y, t_ctrl_y, t_end_y, t);
      const dx = getQBezDeriv(t_start_x, t_ctrl_x, t_end_x, t);
      const dy = getQBezDeriv(t_start_y, t_ctrl_y, t_end_y, t);
      const angle = Math.atan2(dy, dx) + Math.PI/2;
      
      const len = 16;
      const lw = 3.5;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-len/2, 0);
      ctx.quadraticCurveTo(0, -lw, len/2, 0);
      ctx.quadraticCurveTo(0, lw, -len/2, 0);
      ctx.fillStyle = stripeColor;
      ctx.fill();
      ctx.restore();
    };

    drawTailStripe(0.55);
    drawTailStripe(0.80);


    const leg1 = Math.sin(walkCycle) * 10;
    const leg2 = Math.sin(walkCycle + Math.PI) * 10;
    const frontLeg1 = Math.sin(walkCycle + Math.PI/2) * 10;
    const frontLeg2 = Math.sin(walkCycle + Math.PI*1.5) * 10;

    const drawWalkLeg = (baseX: number, baseY: number, offset: number, isDark: boolean, isHind: boolean) => {
      const color = isDark ? darkColor : catColor;
      const legOffset = isHind ? Math.max(0, offset) : offset;
      
      const footX = baseX + legOffset;
      const footY = baseY + 20;
      
      // Leg
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.quadraticCurveTo(baseX + (isDark ? 5 : 0), baseY + 10, footX, footY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.stroke();

      // Paw
      ellipse(footX - 3, footY + 4, 9, 5.5, 0, 0, 2 * Math.PI, color, null, 0);
      
      // Toes
      line(footX - 6, footY + 7, footX - 5.5, footY + 4, isDark ? "#000" : darkColor, 1.5);
      line(footX - 3, footY + 8, footX - 3, footY + 4, isDark ? "#000" : darkColor, 1.5);
      line(footX, footY + 7, footX - 0.5, footY + 4, isDark ? "#000" : darkColor, 1.5);
    };

    drawWalkLeg(cx + 18, cy + 15, leg2, true, true);
    drawWalkLeg(cx - 15, cy + 15, frontLeg2, true, false);

    drawWalkLeg(cx + 18, cy + 15, leg1, false, true);
    drawWalkLeg(cx - 15, cy + 15, frontLeg1, false, false);

    // Fat Body
    ellipse(cx, cy + 5, 38 * bW, 24 * bH, 0, 0, 2 * Math.PI, catColor, null, 0);
    
    drawStripe(cx + 10, cy - 18, 14, Math.PI/2, 3);
    drawStripe(cx + 0, cy - 18, 14, Math.PI/2, 3);
    drawStripe(cx - 10, cy - 16, 12, Math.PI/2, 3);

    ellipse(cx - 5, cy + 12, 24 * bW, 14 * bH, 0, 0, 2 * Math.PI, lightColor, null, 0);

    head_x = cx - 28;
    head_y = cy - 12;
  }

  // Ears
  ctx.save();
  if (catType === 'cute') {
    ctx.translate(head_x, head_y + 5);
    ctx.scale(1.3, 1.3);
    ctx.translate(-head_x, -(head_y + 5));
  } else if (catType === 'garfield') {
    ctx.translate(head_x, head_y);
    ctx.scale(0.9, 0.9); // garfield has relatively smaller head
    ctx.translate(-head_x, -head_y);
  }

  ctx.fillStyle = catColor;
  ctx.beginPath(); ctx.moveTo(head_x - 12, head_y - 8); ctx.lineTo(head_x - 22, head_y - 25); ctx.lineTo(head_x - 2, head_y - 18); ctx.fill();
  ctx.beginPath(); ctx.moveTo(head_x + 2, head_y - 18); ctx.lineTo(head_x + 22, head_y - 25); ctx.lineTo(head_x + 12, head_y - 8); ctx.fill();

  ctx.fillStyle = pink;
  ctx.beginPath(); ctx.moveTo(head_x - 12, head_y - 11); ctx.lineTo(head_x - 18, head_y - 20); ctx.lineTo(head_x - 6, head_y - 16); ctx.fill();
  ctx.beginPath(); ctx.moveTo(head_x + 6, head_y - 16); ctx.lineTo(head_x + 18, head_y - 20); ctx.lineTo(head_x + 12, head_y - 11); ctx.fill();

  // Head base
  ellipse(head_x, head_y, 26, 22, 0, 0, 2 * Math.PI, catColor, null, 0);
  
  // Big cheeks
  ellipse(head_x - 12, head_y + 8, 16, 12, 0, 0, 2 * Math.PI, lightColor, null, 0);
  ellipse(head_x + 12, head_y + 8, 16, 12, 0, 0, 2 * Math.PI, lightColor, null, 0);

  // Head stripes
  drawStripe(head_x, head_y - 20, 10, Math.PI/2, 2);
  drawStripe(head_x - 6, head_y - 18, 8, Math.PI/2 + 0.3, 2);
  drawStripe(head_x + 6, head_y - 18, 8, Math.PI/2 - 0.3, 2);

  const eye_x1 = head_x - 9;
  const eye_x2 = head_x + 9;
  const eye_y = head_y - 2;
  const is_blinking = pose === "SLEEP" ? true : (elapsed % 4.0) < 0.15;

  let eyeColor = white;
  let pupilColor = black;

  if (isDarkMode) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#4ADE80'; // Bright green glow
    eyeColor = '#DCFCE7';
  }

  // Draw eye whites
  if (catType === 'cute') {
    ellipse(eye_x1, eye_y, 9, 11, 0, 0, 2 * Math.PI, eyeColor, black, 1);
    ellipse(eye_x2, eye_y, 9, 11, 0, 0, 2 * Math.PI, eyeColor, black, 1);
  } else if (catType === 'garfield') {
    ellipse(eye_x1, eye_y, 8, 8, 0, 0, 2 * Math.PI, eyeColor, black, 1);
    ellipse(eye_x2, eye_y, 8, 8, 0, 0, 2 * Math.PI, eyeColor, black, 1);
  } else {
    ellipse(eye_x1, eye_y, 8, 10, 0, 0, 2 * Math.PI, eyeColor, black, 1);
    ellipse(eye_x2, eye_y, 8, 10, 0, 0, 2 * Math.PI, eyeColor, black, 1);
  }
  
  ctx.shadowBlur = 0;

  if (is_blinking) {
    line(eye_x1 - 6, eye_y + 2, eye_x1 + 6, eye_y + 2, black, 2);
    line(eye_x2 - 6, eye_y + 2, eye_x2 + 6, eye_y + 2, black, 2);
  } else {
    if (isDarkMode) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#4ADE80';
      pupilColor = '#14532D';
    }

    if (catType === 'cute') {
      // Big cute pupils
      circle(eye_x1, eye_y + 1, 6, pupilColor);
      circle(eye_x2, eye_y + 1, 6, pupilColor);
      // highlights
      circle(eye_x1 - 2, eye_y - 1, 2, white);
      circle(eye_x2 - 2, eye_y - 1, 2, white);
      circle(eye_x1 + 2, eye_y + 3, 1, white);
      circle(eye_x2 + 2, eye_y + 3, 1, white);
    } else if (catType === 'garfield') {
      // Lazy eyelid
      const lid_y = eye_y;
      ctx.fillStyle = catColor;
      ctx.beginPath();
      ctx.rect(head_x - 20, head_y - 16, 40, 16);
      ctx.fill();
      line(head_x - 16, lid_y, head_x + 16, lid_y, black, 2);
      
      // small pupils
      circle(eye_x1, eye_y + 3, 2, pupilColor);
      circle(eye_x2, eye_y + 3, 2, pupilColor);
    } else {
      // Default wide open eyes with vertical slit pupils
      ellipse(eye_x1, eye_y, 2, 6, 0, 0, 2 * Math.PI, pupilColor, null, 0);
      ellipse(eye_x2, eye_y, 2, 6, 0, 0, 2 * Math.PI, pupilColor, null, 0);
      
      // subtle highlight
      circle(eye_x1 + 1, eye_y - 2, 1.5, white);
      circle(eye_x2 + 1, eye_y - 2, 1.5, white);
    }
    
    ctx.shadowBlur = 0;
  }

  // Nose & mouth
  if (catType === 'garfield') {
    circle(head_x, head_y + 7, 5, pink);
    ellipse(head_x, head_y + 7, 5, 4, 0, 0, 2 * Math.PI, null, black, 1);
    
    // Garfield smile
    ellipse(head_x - 7, head_y + 13, 7, 6, 0, 0, Math.PI, null, black, 1);
    ellipse(head_x + 7, head_y + 13, 7, 6, 0, 0, Math.PI, null, black, 1);
  } else if (catType === 'cute') {
    circle(head_x, head_y + 6, 3, pink);
    ellipse(head_x, head_y + 6, 3, 2.5, 0, 0, 2 * Math.PI, null, black, 1);
    
    // Cute small mouth
    ellipse(head_x - 4, head_y + 10, 4, 3, 0, 0, Math.PI, null, black, 1);
    ellipse(head_x + 4, head_y + 10, 4, 3, 0, 0, Math.PI, null, black, 1);
  } else {
    circle(head_x, head_y + 6, 4, pink);
    ellipse(head_x, head_y + 6, 4, 3, 0, 0, 2 * Math.PI, null, black, 1);

    ellipse(head_x - 6, head_y + 12, 6, 5, 0, 0, Math.PI, null, black, 1);
    ellipse(head_x + 6, head_y + 12, 6, 5, 0, 0, Math.PI, null, black, 1);
  }

  line(head_x - 20, head_y + 6, head_x - 32, head_y + 4, black, 1);
  line(head_x - 20, head_y + 10, head_x - 32, head_y + 12, black, 1);
  line(head_x + 20, head_y + 6, head_x + 32, head_y + 4, black, 1);
  line(head_x + 20, head_y + 10, head_x + 32, head_y + 12, black, 1);

  ctx.restore(); // restore from head scale

  if (pose === "EAT") {
    // Draw bowl
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy + 42);
    ctx.lineTo(cx - 10, cy + 42);
    ctx.lineTo(cx - 5, cy + 30);
    ctx.lineTo(cx - 35, cy + 30);
    ctx.closePath();
    ctx.fillStyle = isDarkMode ? '#475569' : '#E2E8F0';
    ctx.fill();
    ctx.strokeStyle = isDarkMode ? '#1E293B' : '#94A3B8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fish inside
    circle(cx - 20, cy + 35, 4, '#F59E0B');
    circle(cx - 15, cy + 37, 3, '#D97706');
    circle(cx - 25, cy + 36, 3, '#D97706');
  }

  if (pose === "SLEEP") {
    // Zzz animations
    ctx.fillStyle = isDarkMode ? '#CBD5E1' : '#64748B';
    ctx.font = 'bold 12px sans-serif';
    const z1 = (elapsed * 2) % 3;
    const z2 = (elapsed * 2 + 1) % 3;
    const z3 = (elapsed * 2 + 2) % 3;
    
    if (z1 < 2) ctx.fillText('Z', head_x - 20 - z1 * 10, head_y - 30 - z1 * 15);
    if (z2 < 2) ctx.fillText('z', head_x - 30 - z2 * 10, head_y - 20 - z2 * 15);
    if (z3 < 2) ctx.fillText('z', head_x - 10 - z3 * 10, head_y - 40 - z3 * 15);
  }

  // Draw accessories
    if (accessory === 'hat') {
      ctx.fillStyle = "#E74C3C"; // red hat
      ctx.fillRect(-15, -45, 30, 10);
      ctx.fillRect(-10, -65, 20, 20);
    } else if (accessory === 'glasses') {
      ctx.strokeStyle = black;
      ctx.lineWidth = 2;
      circle(-10, -10, 8, "", black, 2);
      circle(12, -10, 8, "", black, 2);
      line(-2, -10, 4, -10, black, 2);
    } else if (accessory === 'bowtie') {
      ctx.fillStyle = "#E74C3C";
      ellipse(0, 15, 4, 4, 0, 0, Math.PI * 2, "#E74C3C", null, 0);
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.lineTo(-8, 10);
      ctx.lineTo(-8, 20);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.lineTo(8, 10);
      ctx.lineTo(8, 20);
      ctx.fill();
    }
  ctx.restore();
}

interface CatWidgetProps {
  isActive?: boolean;
  setIsActive?: (v: boolean) => void;
  scale?: number;
  speed?: number;
  phrases?: { text: string; timeMs: number }[];
  swattingEnabled?: boolean;
  roamingEnabled?: boolean;
  isDarkMode?: boolean;
  
  tamagotchiEnabled?: boolean;
  hunger?: number;
  energy?: number;
  happiness?: number;
  actionTrigger?: 'FEED' | 'SLEEP' | 'PLAY' | null;
  catType?: string;
  onInteract?: () => void;
  colorTheme?: string;
  accessory?: string;
  todoWarning?: string | null;
}

export default function CatWidget({ isActive = true, setIsActive, 
  scale = 1.3, 
  speed = 1000, 
  phrases = [{ text: "Miyav!", timeMs: 3000 }],
  swattingEnabled = true,
  roamingEnabled = true,
  isDarkMode = false,
  tamagotchiEnabled = false,
  hunger = 100,
  energy = 100,
  happiness = 100,
  actionTrigger = null,
  onInteract,
  colorTheme = 'orange',
  accessory = 'none',
  todoWarning = null,
  catType = 'default'
}: CatWidgetProps) {
  const [localIsActive, setLocalIsActive] = useState(true);
  const _isActive = setIsActive ? isActive : localIsActive;
  const _setIsActive = setIsActive || setLocalIsActive;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const bubbleTextRef = useRef<HTMLSpanElement>(null);

  const propsRef = useRef({ scale, speed, phrases, swattingEnabled, roamingEnabled, isDarkMode, tamagotchiEnabled, hunger, energy, happiness, actionTrigger, onInteract, colorTheme, accessory, todoWarning, catType });
  useEffect(() => {
    propsRef.current = { scale, speed, phrases, swattingEnabled, roamingEnabled, isDarkMode, tamagotchiEnabled, hunger, energy, happiness, actionTrigger, onInteract, colorTheme, accessory, todoWarning, catType };
  }, [scale, speed, phrases, swattingEnabled, roamingEnabled, isDarkMode, tamagotchiEnabled, hunger, energy, happiness, actionTrigger, onInteract, colorTheme, accessory, todoWarning, catType]);

  const catState = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    targetX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    targetY: typeof window !== 'undefined' ? window.innerHeight - 40 : 500,
    mouseTargetX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    mouseTargetY: typeof window !== 'undefined' ? window.innerHeight - 40 : 500,
    lastMouseTime: Date.now(),
    status: 'IDLE',
    direction: 1,
    lastTime: Date.now(),
    idleStartTime: Date.now(),
    bubbleVisible: false,
    currentPhrase: "",
    lastShift: 0,
  });

  useEffect(() => {
    const handleMouseClick = (e: MouseEvent) => {
      if (!propsRef.current.onInteract || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.bottom - rect.height / 2;
      
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (Math.sqrt(dx * dx + dy * dy) < 80 * propsRef.current.scale) {
        propsRef.current.onInteract();
      }
    };
    
    document.addEventListener('mousedown', handleMouseClick);
    return () => document.removeEventListener('mousedown', handleMouseClick);
  }, []);

  useEffect(() => {
    if (actionTrigger === 'FEED') {
      catState.current.status = 'EATING';
    } else if (actionTrigger === 'SLEEP') {
      catState.current.status = 'SLEEPING';
    } else if (actionTrigger === 'PLAY') {
      catState.current.status = 'PLAYING';
    }
    
    if (actionTrigger) {
      catState.current.idleStartTime = Date.now();
      setTimeout(() => {
        if (['EATING', 'SLEEPING', 'PLAYING'].includes(catState.current.status)) {
          catState.current.status = 'IDLE';
          catState.current.idleStartTime = Date.now();
        }
      }, 5000);
    }
  }, [actionTrigger]);

  useEffect(() => {
    if (!_isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      catState.current.mouseTargetX = e.clientX;
      catState.current.mouseTargetY = e.clientY;
      catState.current.lastMouseTime = Date.now();
    };
    document.addEventListener('mousemove', handleMouseMove);

    const startTime = Date.now();
    let animationFrameId: number;

    const render = () => {
      const now = Date.now();
      let dt = (now - catState.current.lastTime) / 1000;
      if (dt > 0.1) dt = 0.1;
      catState.current.lastTime = now;

      const s = catState.current;
      const timeSinceMouse = now - s.lastMouseTime;

      // Update target based on mouse or roaming
      if (timeSinceMouse < 5000) {
        s.targetX = s.mouseTargetX;
        s.targetY = s.mouseTargetY;
      } else if (propsRef.current.roamingEnabled) {
        if (s.status === 'IDLE' && now - s.idleStartTime > 5000) {
          if (Math.random() < 0.005) { // Roughly once every 3-4 seconds at 60fps
            s.targetX = 100 + Math.random() * (window.innerWidth - 200);
            s.status = 'CHASING';
            s.idleStartTime = now; // Prevent multiple triggers
          }
        }
      }

      const dx = s.targetX - s.x;
      const my = s.targetY;
      const ground_y = window.innerHeight;

      if (Math.abs(dx) > 5) {
        s.direction = dx > 0 ? 1 : -1;
      }

      if (['EATING', 'SLEEPING', 'PLAYING'].includes(s.status)) {
        // Doing an action, don't move or swat
      } else if (s.status === 'CHASING') {
        if (Math.abs(dx) <= 5) {
          s.status = 'IDLE';
          s.x = s.targetX;
          s.idleStartTime = now;
        } else {
          const targetSpeed = Math.min(propsRef.current.speed, 150 + Math.abs(dx) * 2.0);
          const moveStep = targetSpeed * dt;
          
          if (Math.abs(dx) <= moveStep) {
            s.x = s.targetX;
          } else {
            s.x += moveStep * s.direction;
          }
        }
      } else {
        if (Math.abs(dx) > 60) {
          s.status = 'CHASING';
        } else if (propsRef.current.swattingEnabled && timeSinceMouse < 2000 && Math.abs(dx) < 50 && my > ground_y - 150 && my < ground_y + 50) {
          if (s.status === 'IDLE') {
            s.status = 'SWATTING';
            s.idleStartTime = now;
          }
        } else {
          if (s.status === 'SWATTING') {
            s.status = 'IDLE';
            s.idleStartTime = now;
          }
        }
      }

      // Bubble logic
      if (s.status === 'IDLE') {
        const idleTime = now - s.idleStartTime;
        let bestPhrase: string | null = null;
        if (propsRef.current.todoWarning) {
          bestPhrase = propsRef.current.todoWarning;
        } else {
        
        if (propsRef.current.tamagotchiEnabled) {
          const { hunger, energy, happiness } = propsRef.current;
          if (hunger < 30 && hunger <= energy && hunger <= happiness) {
            bestPhrase = "Miyav! Acıktım 🐟";
          } else if (energy < 30 && energy <= happiness) {
            bestPhrase = "Mrrr... Uykum geldi 💤";
          } else if (happiness < 30) {
            bestPhrase = "Canım sıkıldı! 🧶";
          }
        }
        
        if (!bestPhrase) {
          let bestP = null;
          for (const p of propsRef.current.phrases) {
            if (idleTime >= p.timeMs) {
              if (!bestP || p.timeMs > bestP.timeMs) {
                bestP = p;
              }
            }
          }
          if (bestP) bestPhrase = bestP.text;
        }

        }
        if (bestPhrase) {
          if (!s.bubbleVisible || s.currentPhrase !== bestPhrase) {
            s.bubbleVisible = true;
            s.currentPhrase = bestPhrase;
            if (bubbleRef.current) {
              if (bubbleTextRef.current) bubbleTextRef.current.innerText = bestPhrase;
              bubbleRef.current.style.opacity = '1';
            }
          }
        }
      } else {
        if (s.bubbleVisible) {
          s.bubbleVisible = false;
          s.currentPhrase = "";
          s.idleStartTime = now;
          if (bubbleRef.current) {
            bubbleRef.current.style.opacity = '0';
          }
        }
      }

      const currentScale = propsRef.current.scale;
      const canvasSize = Math.max(120, Math.floor(180 * (currentScale / 1.3)));
      const halfSize = canvasSize / 2;

      if (containerRef.current) {
        const constrainedX = Math.max(halfSize, Math.min(window.innerWidth - halfSize, s.x));
        containerRef.current.style.left = `${constrainedX}px`;
        
        if (bubbleRef.current) {
          const bubbleBottom = Math.floor(140 * (currentScale / 1.3));
          bubbleRef.current.style.bottom = `${bubbleBottom}px`;
          
          if (s.bubbleVisible) {
            const bw = bubbleRef.current.offsetWidth;
            const leftEdge = constrainedX - bw / 2;
            const rightEdge = constrainedX + bw / 2;
            let shift = 0;
            if (leftEdge < 10) shift = 10 - leftEdge;
            else if (rightEdge > window.innerWidth - 10) shift = (window.innerWidth - 10) - rightEdge;
            
            s.lastShift = shift;
            
            bubbleRef.current.style.transform = `translate(calc(-50% + ${shift}px), 0) scale(1)`;
            
            // shift the tail in opposite direction so it stays pointed at the cat
            const tail1 = bubbleRef.current.children[1] as HTMLElement;
            const tail2 = bubbleRef.current.children[2] as HTMLElement;
            if (tail1 && tail2) {
              tail1.style.transform = `translateX(calc(-50% - ${shift}px))`;
              tail2.style.transform = `translateX(calc(-50% - ${shift}px))`;
            }
          } else {
            const shift = s.lastShift || 0;
            bubbleRef.current.style.transform = `translate(calc(-50% + ${shift}px), 10px) scale(0.95)`;
          }
        }
      }

      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        if (canvasRef.current.width !== canvasSize * dpr) {
          canvasRef.current.width = canvasSize * dpr;
          canvasRef.current.height = canvasSize * dpr;
          canvasRef.current.style.width = `${canvasSize}px`;
          canvasRef.current.style.height = `${canvasSize}px`;
        }

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasSize * dpr, canvasSize * dpr);
          ctx.save();
          ctx.scale(dpr, dpr);
          
          const elapsed = (now - startTime) / 1000;
          let walkCycle = 0;
          let pose = 'SIT';

          if (s.status === 'EATING') {
            pose = 'EAT';
          } else if (s.status === 'SLEEPING') {
            pose = 'SLEEP';
          } else if (s.status === 'PLAYING') {
            pose = 'PLAY';
          } else if (s.status === 'CHASING') {
            pose = 'WALK';
            walkCycle = elapsed * 15;
          } else if (s.status === 'SWATTING') {
            pose = 'SWAT';
          }

          drawCat(ctx, halfSize, halfSize, walkCycle, pose, elapsed, s.direction, currentScale, propsRef.current.isDarkMode, propsRef.current.colorTheme, propsRef.current.accessory, propsRef.current.catType);
          
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [_isActive]);

  return (
    <>
      

      {_isActive && (
        <div 
          ref={containerRef}
          className="fixed bottom-0 z-40 text-center pointer-events-none select-none will-change-transform"
          style={{ left: `${typeof window !== 'undefined' ? window.innerWidth / 2 : 500}px`, transform: 'translateX(-50%)' }}
        >
          <div 
            ref={bubbleRef}
            className={`absolute left-1/2 border-2 rounded-2xl px-4 py-2 text-sm font-bold shadow-lg transition-all duration-300 opacity-0 transform -translate-x-1/2 translate-y-[10px] scale-95 max-w-[250px] text-center whitespace-normal break-words ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
            style={{ bottom: '140px' }}
          >
            <span ref={bubbleTextRef}>Miyav!</span>
            <div className={`absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] ${isDarkMode ? 'border-t-slate-700' : 'border-t-slate-200'}`}></div>
            <div className={`absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] ${isDarkMode ? 'border-t-slate-800' : 'border-t-white'}`}></div>
          </div>

          <canvas 
            ref={canvasRef}
            className="w-[150px] h-[150px] block"
          />
        </div>
      )}
    </>
  );
}

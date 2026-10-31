import { useEffect, useRef, useCallback, useState } from 'react';

// ============ УТИЛИТЫ ============

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function drawGlowLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  color: string,
  width: number,
  glowSize: number = 10
) {
  for (let i = 3; i >= 0; i--) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width + glowSize * (i / 3);
    ctx.globalAlpha = 0.08 * (1 - i / 4);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = 1;
  ctx.stroke();
}

function drawGlowText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  color: string,
  fontSize: number,
  glowColor: string = color
) {
  ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3;
  ctx.fillText(text, x, y);
  ctx.fillText(text, x, y);
  
  ctx.shadowBlur = 8;
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  
  ctx.shadowBlur = 0;
}

function drawGradientBg(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  time: number
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  const shift = Math.sin(time * 0.3) * 0.02;
  gradient.addColorStop(0, `hsl(230, 60%, ${6 + shift * 100}%)`);
  gradient.addColorStop(0.5, `hsl(235, 50%, ${10 + shift * 50}%)`);
  gradient.addColorStop(1, `hsl(240, 45%, ${14 + shift * 30}%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// ============ СЦЕНЫ ============

const SCENES = [
  { name: 'Вступление', start: 0, end: 8 },
  { name: 'Компоненты', start: 8, end: 20 },
  { name: 'Магнитный поток', start: 20, end: 35 },
  { name: 'Преобразование', start: 35, end: 50 },
  { name: 'Применение', start: 50, end: 58 },
  { name: 'Финал', start: 58, end: 60 },
];

const TOTAL_DURATION = 60;

function getSceneProgress(time: number, idx: number) {
  const s = SCENES[idx];
  if (time < s.start) return 0;
  if (time > s.end) return 1;
  return (time - s.start) / (s.end - s.start);
}

// ============ РЕНДЕР СЦЕН ============

function renderScene1(ctx: CanvasRenderingContext2D, time: number, cx: number, cy: number, scale: number) {
  const p = getSceneProgress(time, 0);
  
  // Заголовок
  if (p < 0.6) {
    const titleAlpha = p < 0.1 ? easeOut(p / 0.1) : p > 0.45 ? 1 - easeInOut((p - 0.45) / 0.15) : 1;
    ctx.globalAlpha = titleAlpha;
    drawGlowText(ctx, 'Как работает', cx, cy - 60 * scale, '#ffffff', 48 * scale, '#00d4ff');
    drawGlowText(ctx, 'трансформатор', cx, cy + 10 * scale, '#00d4ff', 52 * scale, '#00d4ff');
    
    if (p > 0.15) {
      const subAlpha = Math.min(1, (p - 0.15) / 0.1) * titleAlpha;
      ctx.globalAlpha = subAlpha * 0.7;
      drawGlowText(ctx, 'От физики до практики', cx, cy + 70 * scale, '#8892b0', 22 * scale, '#8892b0');
    }
  }

  // Контур трансформатора
  if (p > 0.5) {
    const outlineAlpha = easeInOut((p - 0.5) / 0.5);
    ctx.globalAlpha = outlineAlpha * 0.6;
    
    const coreW = 200 * scale;
    const coreH = 300 * scale;
    const coreX = cx - coreW / 2;
    const coreY = cy - coreH / 2 + 100 * scale;
    
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.rect(coreX, coreY, coreW, coreH);
    ctx.stroke();
    
    const innerMargin = 40 * scale;
    ctx.beginPath();
    ctx.rect(coreX + innerMargin, coreY + innerMargin, coreW - innerMargin * 2, coreH - innerMargin * 2);
    ctx.stroke();
    
    // Контур обмоток
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 2 * scale;
    ctx.globalAlpha = outlineAlpha * 0.4;
    
    for (let i = 0; i < 6; i++) {
      const oy = coreY + 30 * scale + i * 40 * scale;
      ctx.beginPath();
      ctx.ellipse(coreX - 20 * scale, oy, 30 * scale, 15 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(coreX + coreW + 20 * scale, oy, 30 * scale, 15 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function renderScene2(ctx: CanvasRenderingContext2D, time: number, cx: number, cy: number, scale: number) {
  const p = getSceneProgress(time, 1);
  
  const coreW = 220 * scale;
  const coreH = 320 * scale;
  const coreX = cx - coreW / 2;
  const coreY = cy - coreH / 2;
  
  // Сердечник
  const coreAppear = Math.min(1, p / 0.2);
  ctx.globalAlpha = easeOut(coreAppear);
  
  const coreGrad = ctx.createLinearGradient(coreX, coreY, coreX + coreW, coreY);
  coreGrad.addColorStop(0, '#1a202c');
  coreGrad.addColorStop(0.5, '#2d3748');
  coreGrad.addColorStop(1, '#1a202c');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(coreX, coreY, coreW, coreH);
  
  const innerM = 50 * scale;
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(coreX + innerM, coreY + innerM, coreW - innerM * 2, coreH - innerM * 2);
  
  // Линии ламинации
  ctx.strokeStyle = '#4a5568';
  ctx.lineWidth = 0.5 * scale;
  ctx.globalAlpha = 0.3 * easeOut(coreAppear);
  for (let i = 0; i < 20; i++) {
    const ly = coreY + i * (coreH / 20);
    ctx.beginPath();
    ctx.moveTo(coreX, ly);
    ctx.lineTo(coreX + innerM, ly);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(coreX + coreW - innerM, ly);
    ctx.lineTo(coreX + coreW, ly);
    ctx.stroke();
  }
  
  // Подпись сердечника
  if (p > 0.1 && p < 0.35) {
    const la = p < 0.15 ? easeOut((p - 0.1) / 0.05) : p > 0.3 ? 1 - easeInOut((p - 0.3) / 0.05) : 1;
    ctx.globalAlpha = la;
    drawGlowText(ctx, 'Сердечник', cx, coreY + coreH + 40 * scale, '#8892b0', 22 * scale, '#4a5568');
    drawGlowText(ctx, '(ламинированная сталь)', cx, coreY + coreH + 68 * scale, '#64748b', 15 * scale, '#4a5568');
  }
  
  // Первичная обмотка
  if (p > 0.2) {
    const ca = Math.min(1, (p - 0.2) / 0.2);
    ctx.globalAlpha = easeOut(ca);
    const numTurns = Math.floor(8 * easeOut(ca));
    
    for (let i = 0; i < numTurns; i++) {
      const oy = coreY + 30 * scale + i * (coreH - 60 * scale) / 8;
      const phase = time * 2 + i * 0.5;
      
      ctx.globalAlpha = easeOut(ca);
      ctx.beginPath();
      ctx.ellipse(coreX - 15 * scale, oy, 35 * scale, 12 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 4 * scale;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.ellipse(coreX - 15 * scale, oy, 35 * scale, 12 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 10 * scale;
      ctx.globalAlpha = 0.12 * easeOut(ca);
      ctx.stroke();
      
      const pulseA = (Math.sin(phase) * 0.5 + 0.5) * 0.3;
      ctx.globalAlpha = pulseA * easeOut(ca);
      ctx.beginPath();
      ctx.ellipse(coreX - 15 * scale, oy, 35 * scale, 12 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 6 * scale;
      ctx.stroke();
    }
    
    if (p > 0.3 && p < 0.55) {
      const la = p < 0.35 ? easeOut((p - 0.3) / 0.05) : p > 0.5 ? 1 - easeInOut((p - 0.5) / 0.05) : 1;
      ctx.globalAlpha = la;
      drawGlowText(ctx, 'Первичная', coreX - 80 * scale, cy - 20 * scale, '#ff6b35', 18 * scale, '#ff6b35');
      drawGlowText(ctx, 'обмотка (N₁)', coreX - 80 * scale, cy + 10 * scale, '#ff6b35', 18 * scale, '#ff6b35');
    }
  }
  
  // Вторичная обмотка
  if (p > 0.45) {
    const ca = Math.min(1, (p - 0.45) / 0.2);
    ctx.globalAlpha = easeOut(ca);
    const numTurns = Math.floor(8 * easeOut(ca));
    
    for (let i = 0; i < numTurns; i++) {
      const oy = coreY + 30 * scale + i * (coreH - 60 * scale) / 8;
      const phase = time * 2 + i * 0.5 + Math.PI;
      
      ctx.globalAlpha = easeOut(ca);
      ctx.beginPath();
      ctx.ellipse(coreX + coreW + 15 * scale, oy, 35 * scale, 12 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#f7931e';
      ctx.lineWidth = 4 * scale;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.ellipse(coreX + coreW + 15 * scale, oy, 35 * scale, 12 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#f7931e';
      ctx.lineWidth = 10 * scale;
      ctx.globalAlpha = 0.12 * easeOut(ca);
      ctx.stroke();
      
      const pulseA = (Math.sin(phase) * 0.5 + 0.5) * 0.3;
      ctx.globalAlpha = pulseA * easeOut(ca);
      ctx.beginPath();
      ctx.ellipse(coreX + coreW + 15 * scale, oy, 35 * scale, 12 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 6 * scale;
      ctx.stroke();
    }
    
    if (p > 0.55 && p < 0.8) {
      const la = p < 0.6 ? easeOut((p - 0.55) / 0.05) : p > 0.75 ? 1 - easeInOut((p - 0.75) / 0.05) : 1;
      ctx.globalAlpha = la;
      drawGlowText(ctx, 'Вторичная', coreX + coreW + 80 * scale, cy - 20 * scale, '#f7931e', 18 * scale, '#f7931e');
      drawGlowText(ctx, 'обмотка (N₂)', coreX + coreW + 80 * scale, cy + 10 * scale, '#f7931e', 18 * scale, '#f7931e');
    }
  }
}

function renderScene3(ctx: CanvasRenderingContext2D, time: number, cx: number, cy: number, scale: number) {
  const p = getSceneProgress(time, 2);
  
  const coreW = 220 * scale;
  const coreH = 320 * scale;
  const coreX = cx - coreW / 2;
  const coreY = cy - coreH / 2;
  
  // Сердечник
  ctx.globalAlpha = 1;
  const coreGrad = ctx.createLinearGradient(coreX, coreY, coreX + coreW, coreY);
  coreGrad.addColorStop(0, '#1a202c');
  coreGrad.addColorStop(0.5, '#2d3748');
  coreGrad.addColorStop(1, '#1a202c');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(coreX, coreY, coreW, coreH);
  
  const innerM = 50 * scale;
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(coreX + innerM, coreY + innerM, coreW - innerM * 2, coreH - innerM * 2);
  
  // Первичная обмотка — пульсирует
  const primaryGlow = Math.sin(time * 3) * 0.3 + 0.7;
  for (let i = 0; i < 8; i++) {
    const oy = coreY + 30 * scale + i * (coreH - 60 * scale) / 8;
    const phase = time * 3 + i * 0.5;
    
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.ellipse(coreX - 15 * scale, oy, 35 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 4 * scale;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.ellipse(coreX - 15 * scale, oy, 35 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 14 * scale;
    ctx.globalAlpha = 0.18 * primaryGlow;
    ctx.stroke();
    
    const pulseA = (Math.sin(phase) * 0.5 + 0.5) * 0.5;
    ctx.globalAlpha = pulseA;
    ctx.beginPath();
    ctx.ellipse(coreX - 15 * scale, oy, 35 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 6 * scale;
    ctx.stroke();
  }
  
  // Вторичная обмотка
  for (let i = 0; i < 8; i++) {
    const oy = coreY + 30 * scale + i * (coreH - 60 * scale) / 8;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(coreX + coreW + 15 * scale, oy, 35 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#f7931e';
    ctx.lineWidth = 4 * scale;
    ctx.stroke();
  }
  
  // Магнитные линии
  if (p > 0.15) {
    const fluxAppear = Math.min(1, (p - 0.15) / 0.2);
    const fluxPulse = Math.sin(time * 2) * 0.3 + 0.7;
    
    for (let i = 0; i < 5; i++) {
      const lx = coreX + innerM + (i + 0.5) * (coreW - innerM * 2) / 5;
      ctx.globalAlpha = easeOut(fluxAppear) * fluxPulse * 0.8;
      drawGlowLine(ctx, lx, coreY + 10 * scale, lx, coreY + coreH - 10 * scale, '#00d4ff', 2 * scale, 15 * scale);
    }
    
    // Горизонтальные линии (верх/низ)
    for (let i = 0; i < 3; i++) {
      const ly = coreY + 15 * scale + i * 10 * scale;
      ctx.globalAlpha = easeOut(fluxAppear) * fluxPulse * 0.5;
      drawGlowLine(ctx, coreX + 5 * scale, ly, coreX + coreW - 5 * scale, ly, '#00d4ff', 1.5 * scale, 10 * scale);
    }
    for (let i = 0; i < 3; i++) {
      const ly = coreY + coreH - 15 * scale - i * 10 * scale;
      ctx.globalAlpha = easeOut(fluxAppear) * fluxPulse * 0.5;
      drawGlowLine(ctx, coreX + 5 * scale, ly, coreX + coreW - 5 * scale, ly, '#00d4ff', 1.5 * scale, 10 * scale);
    }
    
    // Петля потока
    if (p > 0.3) {
      const loopAppear = Math.min(1, (p - 0.3) / 0.2);
      ctx.globalAlpha = easeOut(loopAppear) * fluxPulse * 0.3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, coreW / 2 + 60 * scale, coreH / 2 + 40 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([10 * scale, 5 * scale]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Стрелки
      const arrowAngle = time * 1.5;
      for (let a = 0; a < 4; a++) {
        const angle = arrowAngle + a * Math.PI / 2;
        const ax = cx + Math.cos(angle) * (coreW / 2 + 60 * scale);
        const ay = cy + Math.sin(angle) * (coreH / 2 + 40 * scale);
        ctx.globalAlpha = easeOut(loopAppear) * 0.8;
        ctx.beginPath();
        ctx.arc(ax, ay, 4 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#00d4ff';
        ctx.fill();
      }
    }
  }
  
  // Частицы
  if (p > 0.4) {
    const pa = Math.min(1, (p - 0.4) / 0.15);
    for (let i = 0; i < 15; i++) {
      const px = coreX + innerM + ((time * 50 + i * 25) % (coreW - innerM * 2));
      const py = coreY + 20 * scale + (Math.sin(time * 3 + i * 1.7) * 0.5 + 0.5) * (coreH - 40 * scale);
      const pAlpha = easeOut(pa) * (Math.sin(time * 5 + i * 2) * 0.3 + 0.7);
      
      ctx.globalAlpha = pAlpha * 0.8;
      ctx.beginPath();
      ctx.arc(px, py, 3 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#00d4ff';
      ctx.fill();
      
      ctx.globalAlpha = pAlpha * 0.25;
      ctx.beginPath();
      ctx.arc(px, py, 9 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#00d4ff';
      ctx.fill();
    }
  }
  
  // Текст
  if (p > 0.6 && p < 0.95) {
    const ta = p < 0.65 ? easeOut((p - 0.6) / 0.05) : p > 0.9 ? 1 - easeInOut((p - 0.9) / 0.05) : 1;
    ctx.globalAlpha = ta;
    drawGlowText(ctx, 'Переменный ток создаёт', cx, coreY + coreH + 60 * scale, '#00d4ff', 20 * scale, '#00d4ff');
    drawGlowText(ctx, 'переменное магнитное поле', cx, coreY + coreH + 88 * scale, '#00d4ff', 20 * scale, '#00d4ff');
  }
}

function renderScene4(ctx: CanvasRenderingContext2D, time: number, cx: number, cy: number, scale: number) {
  const p = getSceneProgress(time, 3);
  
  const coreW = 200 * scale;
  const coreH = 280 * scale;
  const coreX = cx - coreW / 2;
  const coreY = cy - coreH / 2 - 20 * scale;
  
  // Сердечник
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#2d3748';
  ctx.fillRect(coreX, coreY, coreW, coreH);
  const innerM = 45 * scale;
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(coreX + innerM, coreY + innerM, coreW - innerM * 2, coreH - innerM * 2);
  
  const isStepDown = p < 0.5;
  const primaryTurns = isStepDown ? 8 : 4;
  const secondaryTurns = isStepDown ? 4 : 8;
  
  // Первичная обмотка
  for (let i = 0; i < primaryTurns; i++) {
    const oy = coreY + 30 * scale + i * (coreH - 60 * scale) / primaryTurns;
    const brightness = isStepDown ? 1 : 0.6;
    
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.ellipse(coreX - 15 * scale, oy, 30 * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 4 * scale;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.ellipse(coreX - 15 * scale, oy, 30 * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 10 * scale;
    ctx.globalAlpha = 0.12 * brightness * (Math.sin(time * 4 + i) * 0.3 + 0.7);
    ctx.stroke();
  }
  
  // Вторичная обмотка
  for (let i = 0; i < secondaryTurns; i++) {
    const oy = coreY + 30 * scale + i * (coreH - 60 * scale) / secondaryTurns;
    const brightness = isStepDown ? 0.5 : 1;
    
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.ellipse(coreX + coreW + 15 * scale, oy, 30 * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#f7931e';
    ctx.lineWidth = 4 * scale;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.ellipse(coreX + coreW + 15 * scale, oy, 30 * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 10 * scale;
    ctx.globalAlpha = 0.12 * brightness * (Math.sin(time * 4 + i + Math.PI) * 0.3 + 0.7);
    ctx.stroke();
  }
  
  // Поток
  const fluxPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  for (let i = 0; i < 3; i++) {
    const lx = coreX + innerM + (i + 0.5) * (coreW - innerM * 2) / 3;
    ctx.globalAlpha = fluxPulse * 0.5;
    drawGlowLine(ctx, lx, coreY + 10 * scale, lx, coreY + coreH - 10 * scale, '#00d4ff', 1.5 * scale, 8 * scale);
  }
  
  // Частицы во вторичной
  for (let i = 0; i < 6; i++) {
    const oy = coreY + 30 * scale + i * (coreH - 60 * scale) / secondaryTurns;
    const pp = time * 3 + i * 1.5;
    const px = coreX + coreW + 15 * scale + Math.cos(pp) * 30 * scale;
    const py = oy + Math.sin(pp) * 10 * scale;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(px, py, 3 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(px, py, 7 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
  }
  
  // Формула
  if (p > 0.05 && p < 0.9) {
    const fa = p < 0.1 ? easeOut((p - 0.05) / 0.05) : p > 0.85 ? 1 - easeInOut((p - 0.85) / 0.05) : 1;
    ctx.globalAlpha = fa;
    drawGlowText(ctx, 'U₁ / U₂ = N₁ / N₂', cx, coreY - 50 * scale, '#ffffff', 26 * scale, '#00d4ff');
  }
  
  // Переход — вспышка
  if (p > 0.45 && p < 0.55) {
    const flash = Math.sin((p - 0.45) / 0.1 * Math.PI);
    ctx.globalAlpha = flash * 0.15;
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  
  // Понижающий
  if (p > 0.1 && p < 0.45) {
    const la = p < 0.15 ? easeOut((p - 0.1) / 0.05) : p > 0.4 ? 1 - easeInOut((p - 0.4) / 0.05) : 1;
    ctx.globalAlpha = la;
    drawGlowText(ctx, 'Понижающий трансформатор', cx, coreY + coreH + 50 * scale, '#ff6b35', 20 * scale, '#ff6b35');
    drawGlowText(ctx, 'N₁ > N₂ → U₁ > U₂', cx, coreY + coreH + 78 * scale, '#8892b0', 16 * scale);
    
    ctx.globalAlpha = la * 0.9;
    drawGlowText(ctx, '220В ⚡', coreX - 70 * scale, coreY - 10 * scale, '#ffd700', 16 * scale, '#ffd700');
    drawGlowText(ctx, '12В', coreX + coreW + 70 * scale, coreY - 10 * scale, '#ff6b35', 16 * scale, '#ff6b35');
  }
  
  // Повышающий
  if (p > 0.55 && p < 0.85) {
    const la = p < 0.6 ? easeOut((p - 0.55) / 0.05) : p > 0.8 ? 1 - easeInOut((p - 0.8) / 0.05) : 1;
    ctx.globalAlpha = la;
    drawGlowText(ctx, 'Повышающий трансформатор', cx, coreY + coreH + 50 * scale, '#f7931e', 20 * scale, '#f7931e');
    drawGlowText(ctx, 'N₁ < N₂ → U₁ < U₂', cx, coreY + coreH + 78 * scale, '#8892b0', 16 * scale);
    
    ctx.globalAlpha = la * 0.9;
    drawGlowText(ctx, '12В', coreX - 70 * scale, coreY - 10 * scale, '#ff6b35', 16 * scale, '#ff6b35');
    drawGlowText(ctx, '⚡ 220В', coreX + coreW + 70 * scale, coreY - 10 * scale, '#ffd700', 16 * scale, '#ffd700');
  }
}

function renderScene5(ctx: CanvasRenderingContext2D, time: number, cx: number, cy: number, scale: number) {
  const p = getSceneProgress(time, 4);
  
  const schemeY = cy - 50 * scale;
  const stationX = cx - 320 * scale;
  const transX = cx;
  const cityX = cx + 320 * scale;
  
  // Электростанция
  if (p > 0.05) {
    const a = Math.min(1, (p - 0.05) / 0.15);
    ctx.globalAlpha = easeOut(a);
    
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(stationX - 40 * scale, schemeY - 50 * scale, 80 * scale, 100 * scale);
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(stationX + 15 * scale, schemeY - 80 * scale, 15 * scale, 30 * scale);
    
    ctx.fillStyle = '#ffd700';
    ctx.globalAlpha = easeOut(a) * (Math.sin(time * 3) * 0.2 + 0.8);
    ctx.fillRect(stationX - 25 * scale, schemeY - 30 * scale, 15 * scale, 15 * scale);
    ctx.fillRect(stationX + 10 * scale, schemeY - 30 * scale, 15 * scale, 15 * scale);
    
    ctx.globalAlpha = easeOut(a);
    drawGlowText(ctx, '⚡', stationX, schemeY - 95 * scale, '#ffd700', 28 * scale, '#ffd700');
    ctx.globalAlpha = easeOut(a) * 0.8;
    drawGlowText(ctx, 'Электростанция', stationX, schemeY + 70 * scale, '#8892b0', 13 * scale);
  }
  
  // ЛЭП
  if (p > 0.15) {
    const la = Math.min(1, (p - 0.15) / 0.15);
    ctx.globalAlpha = easeOut(la);
    
    for (let i = 0; i < 3; i++) {
      const px = stationX + 60 * scale + i * 55 * scale;
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(px, schemeY);
      ctx.lineTo(px, schemeY - 40 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px - 12 * scale, schemeY - 35 * scale);
      ctx.lineTo(px + 12 * scale, schemeY - 35 * scale);
      ctx.stroke();
    }
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(stationX + 40 * scale, schemeY - 35 * scale);
    ctx.lineTo(transX - 40 * scale, schemeY - 35 * scale);
    ctx.stroke();
    
    // Энергия
    const ep = (time * 80) % 200;
    for (let i = 0; i < 4; i++) {
      const ex = stationX + 40 * scale + ((ep + i * 55) % (transX - stationX - 80 * scale));
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(ex, schemeY - 35 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(ex, schemeY - 35 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
    }
    
    ctx.globalAlpha = easeOut(la) * 0.6;
    drawGlowText(ctx, 'ЛЭП (высокое напряжение)', cx - 120 * scale, schemeY - 60 * scale, '#64748b', 11 * scale);
  }
  
  // Трансформатор
  if (p > 0.25) {
    const ta = Math.min(1, (p - 0.25) / 0.15);
    ctx.globalAlpha = easeOut(ta);
    
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(transX - 15 * scale, schemeY, 20 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(transX + 15 * scale, schemeY, 20 * scale, 0, Math.PI * 2);
    ctx.stroke();
    
    const gp = Math.sin(time * 3) * 0.3 + 0.7;
    ctx.globalAlpha = easeOut(ta) * 0.2 * gp;
    ctx.beginPath();
    ctx.arc(transX, schemeY, 35 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#00d4ff';
    ctx.fill();
    
    ctx.globalAlpha = easeOut(ta) * 0.9;
    drawGlowText(ctx, 'Трансформатор', transX, schemeY + 50 * scale, '#00d4ff', 13 * scale, '#00d4ff');
  }
  
  // Провода к городу
  if (p > 0.4) {
    const wa = Math.min(1, (p - 0.4) / 0.15);
    ctx.globalAlpha = easeOut(wa);
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(transX + 40 * scale, schemeY);
    ctx.lineTo(cityX - 40 * scale, schemeY);
    ctx.stroke();
    
    const ep2 = (time * 40) % 200;
    for (let i = 0; i < 3; i++) {
      const ex = transX + 40 * scale + ((ep2 + i * 65) % (cityX - transX - 80 * scale));
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(ex, schemeY, 3 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#f7931e';
      ctx.fill();
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      ctx.arc(ex, schemeY, 7 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#f7931e';
      ctx.fill();
    }
  }
  
  // Город
  if (p > 0.5) {
    const ca = Math.min(1, (p - 0.5) / 0.2);
    
    for (let i = 0; i < 5; i++) {
      const hx = cityX - 60 * scale + i * 30 * scale;
      const hh = (30 + Math.sin(i * 2) * 20) * scale;
      
      ctx.globalAlpha = easeOut(ca);
      ctx.fillStyle = '#1a202c';
      ctx.fillRect(hx - 12 * scale, schemeY - hh, 24 * scale, hh);
      
      ctx.beginPath();
      ctx.moveTo(hx - 15 * scale, schemeY - hh);
      ctx.lineTo(hx, schemeY - hh - 15 * scale);
      ctx.lineTo(hx + 15 * scale, schemeY - hh);
      ctx.fillStyle = '#2d3748';
      ctx.fill();
      
      const wg = Math.sin(time * 2 + i) * 0.2 + 0.8;
      ctx.fillStyle = '#ffd700';
      ctx.globalAlpha = easeOut(ca) * wg;
      ctx.fillRect(hx - 6 * scale, schemeY - hh + 10 * scale, 5 * scale, 5 * scale);
      ctx.fillRect(hx + 2 * scale, schemeY - hh + 10 * scale, 5 * scale, 5 * scale);
      if (hh > 35 * scale) {
        ctx.fillRect(hx - 6 * scale, schemeY - hh + 25 * scale, 5 * scale, 5 * scale);
        ctx.fillRect(hx + 2 * scale, schemeY - hh + 25 * scale, 5 * scale, 5 * scale);
      }
    }
    
    ctx.globalAlpha = easeOut(ca) * 0.8;
    drawGlowText(ctx, 'Город', cityX, schemeY + 50 * scale, '#8892b0', 13 * scale);
  }
  
  // Текст
  if (p > 0.75) {
    const ta = easeOut((p - 0.75) / 0.1);
    ctx.globalAlpha = Math.min(1, ta);
    drawGlowText(ctx, 'Трансформаторы — основа энергосистемы', cx, schemeY + 120 * scale, '#00d4ff', 18 * scale, '#00d4ff');
  }
}

function renderScene6(ctx: CanvasRenderingContext2D, time: number, cx: number, cy: number, scale: number) {
  const p = getSceneProgress(time, 5);
  const pulse = Math.sin(time * 4) * 0.08 + 1;
  const alpha = easeOut(Math.min(1, p / 0.3));
  
  ctx.globalAlpha = alpha;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulse, pulse);
  drawGlowText(ctx, 'Подписывайся!', 0, -20 * scale, '#ffffff', 44 * scale, '#00d4ff');
  drawGlowText(ctx, '🔔', 0, 50 * scale, '#ffd700', 36 * scale, '#ffd700');
  ctx.restore();
  
  for (let i = 0; i < 20; i++) {
    const angle = time * 0.5 + i * Math.PI * 2 / 20;
    const radius = 200 * scale + Math.sin(time * 2 + i) * 30 * scale;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    ctx.globalAlpha = alpha * 0.5;
    ctx.beginPath();
    ctx.arc(px, py, 3 * scale, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#00d4ff' : '#ff6b35';
    ctx.fill();
  }
}

// ============ ГЛАВНЫЙ КОМПОНЕНТ ============

export default function TransformerAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const totalPausedRef = useRef<number>(0);
  const isPlayingRef = useRef(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentScene, setCurrentScene] = useState(0);
  const [progress, setProgress] = useState(0);

  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isPlayingRef.current) {
      animRef.current = requestAnimationFrame(render);
      return;
    }

    if (startTimeRef.current === 0) startTimeRef.current = timestamp;
    const elapsed = (timestamp - startTimeRef.current - totalPausedRef.current) / 1000;
    const time = elapsed % TOTAL_DURATION;

    const sceneIdx = SCENES.findIndex(s => time >= s.start && time < s.end);
    const validIdx = sceneIdx >= 0 ? sceneIdx : 5;
    
    // Обновляем UI раз в ~10 кадров
    if (Math.floor(elapsed * 6) % 1 === 0) {
      setCurrentScene(validIdx);
      setProgress(time / TOTAL_DURATION);
    }

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const scale = Math.min(W / 1080, H / 1920);

    // Фон
    ctx.globalAlpha = 1;
    drawGradientBg(ctx, W, H, time);

    // Рендер сцен
    if (time < 8) {
      renderScene1(ctx, time, cx, cy, scale);
    } else if (time < 20) {
      renderScene2(ctx, time, cx, cy, scale);
    } else if (time < 35) {
      renderScene3(ctx, time, cx, cy, scale);
    } else if (time < 50) {
      renderScene4(ctx, time, cx, cy, scale);
    } else if (time < 58) {
      renderScene5(ctx, time, cx, cy, scale);
    } else {
      renderScene6(ctx, time, cx, cy, scale);
    }

    // Полоса прогресса
    ctx.globalAlpha = 0.6;
    const barY = H - 40 * scale;
    const barW = W - 80 * scale;
    const barX = 40 * scale;
    
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(barX, barY, barW, 4 * scale);
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(barX, barY, barW * (time / TOTAL_DURATION), 4 * scale);
    
    for (let i = 0; i < SCENES.length; i++) {
      const mx = barX + barW * (SCENES[i].start / TOTAL_DURATION);
      ctx.fillStyle = i === validIdx ? '#00d4ff' : '#4a5568';
      ctx.beginPath();
      ctx.arc(mx, barY + 2 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 0.7;
    ctx.font = `${12 * scale}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = '#8892b0';
    ctx.textAlign = 'left';
    ctx.fillText(SCENES[validIdx]?.name || '', barX, barY - 10 * scale);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.floor(time)}с / ${TOTAL_DURATION}с`, barX + barW, barY - 10 * scale);
    ctx.globalAlpha = 1;

    animRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const cW = container.clientWidth;
      const cH = container.clientHeight;
      const aspect = 9 / 16;
      let w: number, h: number;
      if (cW / cH < aspect) {
        w = cW;
        h = cW / aspect;
      } else {
        h = cH;
        w = cH * aspect;
      }
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [render]);

  const togglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    isPlayingRef.current = next;
    if (!next) {
      // Пауза — запоминаем время
      pausedAtRef.current = performance.now();
    } else {
      // Возобновление — добавляем длительность паузы
      if (pausedAtRef.current > 0) {
        totalPausedRef.current += performance.now() - pausedAtRef.current;
        pausedAtRef.current = 0;
      }
    }
  };

  const restart = () => {
    startTimeRef.current = 0;
    totalPausedRef.current = 0;
    pausedAtRef.current = 0;
    isPlayingRef.current = true;
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0e27] p-4 select-none">
      <div className="text-center mb-3">
        <h1 className="text-xl md:text-3xl font-bold text-white mb-1 tracking-tight">
          ⚡ Как работает трансформатор
        </h1>
        <p className="text-xs md:text-sm text-gray-400">Интерактивная анимация • 60 секунд</p>
      </div>

      <div className="relative w-full max-w-[380px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/10 border border-gray-700/40">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={togglePlay}
          className="px-5 py-2 bg-cyan-600/20 border border-cyan-500/40 rounded-lg text-cyan-300 hover:bg-cyan-600/30 transition-all text-sm font-medium cursor-pointer"
        >
          {isPlaying ? '⏸ Пауза' : '▶ Играть'}
        </button>
        <button
          onClick={restart}
          className="px-5 py-2 bg-orange-600/20 border border-orange-500/40 rounded-lg text-orange-300 hover:bg-orange-600/30 transition-all text-sm font-medium cursor-pointer"
        >
          🔄 Заново
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-1.5 max-w-xl">
        {SCENES.map((scene, i) => (
          <div
            key={i}
            className={`text-[10px] md:text-xs px-2 py-1 rounded text-center transition-all duration-300 ${
              i === currentScene
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 scale-105'
                : i < currentScene
                ? 'bg-gray-700/30 text-gray-500 border border-gray-700/20'
                : 'bg-gray-800/30 text-gray-600 border border-gray-800/20'
            }`}
          >
            {scene.name}
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-[10px] text-gray-600 max-w-md">
        <p>Визуализация в стиле 3Blue1Brown • Canvas 2D • 60 FPS</p>
      </div>
    </div>
  );
}

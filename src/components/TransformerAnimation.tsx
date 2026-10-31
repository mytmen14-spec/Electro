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

// ТИТРЫ СВЕРХУ — описание каждой сцены
const SCENE_CAPTIONS = [
  { title: '🔥 ЭТО УПРАВЛЯЕТ ВСЕМ', subtitle: 'Без этого устройства не было бы электричества' },
  { title: '📐 ИЗ ЧЕГО СОСТОИТ?', subtitle: 'Сердечник из стали + медные обмотки' },
  { title: '🧲 КАК РАБОТАЕТ?', subtitle: 'Ток → магнитное поле → индуцирует напряжение' },
  { title: '⚡ ФОРМУЛА ТРАНСФОРМАЦИИ', subtitle: 'Больше витков = выше напряжение' },
  { title: '🏙️ ЗАЧЕМ НУЖЕН?', subtitle: 'Понижает 110 000В до безопасных 220В' },
  { title: '🔔 ПОДПИСЫВАЙСЯ!', subtitle: 'Физика проще, чем кажется!' },
];

function drawCaption(
  ctx: CanvasRenderingContext2D,
  sceneIdx: number,
  sceneProgress: number,
  W: number,
  scale: number
) {
  const caption = SCENE_CAPTIONS[sceneIdx];
  if (!caption) return;
  
  // Для первой сцены: титр появляется только после хука
  if (sceneIdx === 0 && sceneProgress < 0.3) return;
  
  // Появление и исчезновение титра
  let alpha = 1;
  if (sceneProgress < 0.12) {
    alpha = easeOut(sceneProgress / 0.12);
  } else if (sceneProgress > 0.88) {
    alpha = 1 - easeInOut((sceneProgress - 0.88) / 0.12);
  }
  
  const captionY = 80 * scale;
  const barW = W - 50 * scale;
  const barH = 90 * scale;
  const barX = 25 * scale;
  
  // Фон титра
  ctx.globalAlpha = alpha * 0.85;
  const grad = ctx.createLinearGradient(barX, captionY - barH / 2, barX, captionY + barH / 2);
  grad.addColorStop(0, 'rgba(10, 14, 39, 0.95)');
  grad.addColorStop(0.5, 'rgba(15, 20, 50, 0.9)');
  grad.addColorStop(1, 'rgba(10, 14, 39, 0.85)');
  ctx.fillStyle = grad;
  
  // Скруглённый прямоугольник
  const radius = 14 * scale;
  ctx.beginPath();
  ctx.moveTo(barX + radius, captionY - barH / 2);
  ctx.lineTo(barX + barW - radius, captionY - barH / 2);
  ctx.quadraticCurveTo(barX + barW, captionY - barH / 2, barX + barW, captionY - barH / 2 + radius);
  ctx.lineTo(barX + barW, captionY + barH / 2 - radius);
  ctx.quadraticCurveTo(barX + barW, captionY + barH / 2, barX + barW - radius, captionY + barH / 2);
  ctx.lineTo(barX + radius, captionY + barH / 2);
  ctx.quadraticCurveTo(barX, captionY + barH / 2, barX, captionY + barH / 2 - radius);
  ctx.lineTo(barX, captionY - barH / 2 + radius);
  ctx.quadraticCurveTo(barX, captionY - barH / 2, barX + radius, captionY - barH / 2);
  ctx.closePath();
  ctx.fill();
  
  // Рамка
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();
  
  // Акцентная линия сверху (градиентная)
  ctx.globalAlpha = alpha;
  const lineGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  lineGrad.addColorStop(0, 'rgba(0, 212, 255, 0)');
  lineGrad.addColorStop(0.3, '#00d4ff');
  lineGrad.addColorStop(0.7, '#00d4ff');
  lineGrad.addColorStop(1, 'rgba(0, 212, 255, 0)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2.5 * scale;
  ctx.beginPath();
  ctx.moveTo(barX + radius, captionY - barH / 2);
  ctx.lineTo(barX + barW - radius, captionY - barH / 2);
  ctx.stroke();
  
  // Заголовок титра
  ctx.globalAlpha = alpha;
  ctx.font = `bold ${22 * scale}px 'Segoe UI', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(caption.title, W / 2, captionY - 14 * scale);
  
  // Подзаголовок
  ctx.shadowBlur = 6;
  ctx.font = `bold ${15 * scale}px 'Segoe UI', Arial, sans-serif`;
  ctx.fillStyle = '#00d4ff';
  ctx.fillText(caption.subtitle, W / 2, captionY + 18 * scale);
  
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
  
  // ХУК: Первые 2 секунды - мощное вступление
  if (p < 0.25) {
    const hookProgress = p / 0.25;
    
    // Вспышка в начале
    if (hookProgress < 0.15) {
      const flash = 1 - hookProgress / 0.15;
      ctx.globalAlpha = flash * 0.9;
      ctx.fillStyle = '#00d4ff';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    
    // Электрические разряды
    if (hookProgress > 0.05) {
      const sparkAlpha = Math.min(1, (hookProgress - 0.05) / 0.1);
      for (let i = 0; i < 8; i++) {
        const angle = (time * 8 + i * Math.PI / 4);
        const len = (150 + Math.sin(time * 15 + i * 3) * 80) * scale;
        const sx = cx + Math.cos(angle) * 30 * scale;
        const sy = cy + Math.sin(angle) * 30 * scale;
        const ex = cx + Math.cos(angle) * len;
        const ey = cy + Math.sin(angle) * len;
        
        ctx.globalAlpha = sparkAlpha * 0.6 * (Math.sin(time * 20 + i * 5) * 0.5 + 0.5);
        drawGlowLine(ctx, sx, sy, ex, ey, '#00d4ff', 2 * scale, 12 * scale);
      }
    }
    
    // Большой цепляющий текст
    const textAlpha = hookProgress < 0.1 ? easeOut(hookProgress / 0.1) : hookProgress > 0.75 ? 1 - easeInOut((hookProgress - 0.75) / 0.25) : 1;
    ctx.globalAlpha = textAlpha;
    
    // Масштабирование текста
    const textScale = 1 + (1 - hookProgress) * 0.4;
    const shake = hookProgress < 0.2 ? Math.sin(time * 30) * 3 * scale * (1 - hookProgress / 0.2) : 0;
    ctx.save();
    ctx.translate(cx + shake, cy);
    ctx.scale(textScale, textScale);
    
    drawGlowText(ctx, '⚡ ЭТО УПРАВЛЯЕТ', 0, -90 * scale, '#ffd700', 44 * scale, '#ffd700');
    drawGlowText(ctx, 'ВСЕЙ ЭНЕРГИЕЙ', 0, -25 * scale, '#ffffff', 52 * scale, '#ffd700');
    drawGlowText(ctx, 'ПЛАНЕТЫ', 0, 55 * scale, '#ff6b35', 62 * scale, '#ff6b35');
    
    ctx.restore();
    
    // Пульсирующие кольца
    if (hookProgress > 0.1) {
      for (let r = 0; r < 3; r++) {
        const ringProgress = ((hookProgress - 0.1) * 2 + r * 0.3) % 1;
        const ringRadius = ringProgress * 300 * scale;
        const ringAlpha = (1 - ringProgress) * 0.4;
        ctx.globalAlpha = ringAlpha;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
      }
    }
  }
  
  // Основной заголовок
  if (p >= 0.25 && p < 0.6) {
    const titleProgress = (p - 0.25) / 0.35;
    const titleAlpha = titleProgress < 0.15 ? easeOut(titleProgress / 0.15) : titleProgress > 0.85 ? 1 - easeInOut((titleProgress - 0.85) / 0.15) : 1;
    ctx.globalAlpha = titleAlpha;
    drawGlowText(ctx, 'Как работает', cx, cy - 80 * scale, '#ffffff', 56 * scale, '#00d4ff');
    drawGlowText(ctx, 'ТРАНСФОРМАТОР', cx, cy + 10 * scale, '#00d4ff', 64 * scale, '#00d4ff');
    
    if (titleProgress > 0.2) {
      const subAlpha = Math.min(1, (titleProgress - 0.2) / 0.15) * titleAlpha;
      ctx.globalAlpha = subAlpha * 0.8;
      drawGlowText(ctx, 'Сердце энергосистемы', cx, cy + 90 * scale, '#8892b0', 28 * scale, '#8892b0');
    }
  }

  // Контур трансформатора (крупнее)
  if (p > 0.5) {
    const outlineAlpha = easeInOut((p - 0.5) / 0.5);
    ctx.globalAlpha = outlineAlpha * 0.6;
    
    const coreW = 280 * scale;
    const coreH = 400 * scale;
    const coreX = cx - coreW / 2;
    const coreY = cy - coreH / 2 + 120 * scale;
    
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.rect(coreX, coreY, coreW, coreH);
    ctx.stroke();
    
    const innerMargin = 55 * scale;
    ctx.beginPath();
    ctx.rect(coreX + innerMargin, coreY + innerMargin, coreW - innerMargin * 2, coreH - innerMargin * 2);
    ctx.stroke();
    
    // Контур обмоток (крупнее)
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 3 * scale;
    ctx.globalAlpha = outlineAlpha * 0.4;
    
    for (let i = 0; i < 7; i++) {
      const oy = coreY + 40 * scale + i * 50 * scale;
      ctx.beginPath();
      ctx.ellipse(coreX - 30 * scale, oy, 40 * scale, 20 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(coreX + coreW + 30 * scale, oy, 40 * scale, 20 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function renderScene2(ctx: CanvasRenderingContext2D, time: number, cx: number, cy: number, scale: number) {
  const p = getSceneProgress(time, 1);
  
  const coreW = 300 * scale;
  const coreH = 420 * scale;
  const coreX = cx - coreW / 2;
  const coreY = cy - coreH / 2 + 30 * scale;
  
  // Сердечник
  const coreAppear = Math.min(1, p / 0.2);
  ctx.globalAlpha = easeOut(coreAppear);
  
  const coreGrad = ctx.createLinearGradient(coreX, coreY, coreX + coreW, coreY);
  coreGrad.addColorStop(0, '#1a202c');
  coreGrad.addColorStop(0.5, '#2d3748');
  coreGrad.addColorStop(1, '#1a202c');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(coreX, coreY, coreW, coreH);
  
  const innerM = 65 * scale;
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(coreX + innerM, coreY + innerM, coreW - innerM * 2, coreH - innerM * 2);
  
  // Линии ламинации
  ctx.strokeStyle = '#4a5568';
  ctx.lineWidth = 0.7 * scale;
  ctx.globalAlpha = 0.3 * easeOut(coreAppear);
  for (let i = 0; i < 25; i++) {
    const ly = coreY + i * (coreH / 25);
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
    drawGlowText(ctx, 'Сердечник', cx, coreY + coreH + 50 * scale, '#8892b0', 26 * scale, '#4a5568');
    drawGlowText(ctx, '(ламинированная сталь)', cx, coreY + coreH + 82 * scale, '#64748b', 18 * scale, '#4a5568');
  }
  
  // Первичная обмотка
  if (p > 0.2) {
    const ca = Math.min(1, (p - 0.2) / 0.2);
    ctx.globalAlpha = easeOut(ca);
    const numTurns = Math.floor(8 * easeOut(ca));
    
    for (let i = 0; i < numTurns; i++) {
      const oy = coreY + 40 * scale + i * (coreH - 80 * scale) / 8;
      const phase = time * 2 + i * 0.5;
      
      ctx.globalAlpha = easeOut(ca);
      ctx.beginPath();
      ctx.ellipse(coreX - 20 * scale, oy, 45 * scale, 16 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 5 * scale;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.ellipse(coreX - 20 * scale, oy, 45 * scale, 16 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 14 * scale;
      ctx.globalAlpha = 0.15 * easeOut(ca);
      ctx.stroke();
      
      const pulseA = (Math.sin(phase) * 0.5 + 0.5) * 0.4;
      ctx.globalAlpha = pulseA * easeOut(ca);
      ctx.beginPath();
      ctx.ellipse(coreX - 20 * scale, oy, 45 * scale, 16 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 8 * scale;
      ctx.stroke();
    }
    
    if (p > 0.3 && p < 0.55) {
      const la = p < 0.35 ? easeOut((p - 0.3) / 0.05) : p > 0.5 ? 1 - easeInOut((p - 0.5) / 0.05) : 1;
      ctx.globalAlpha = la;
      drawGlowText(ctx, 'Первичная', coreX - 140 * scale, cy - 20 * scale, '#ff6b35', 20 * scale, '#ff6b35');
      drawGlowText(ctx, 'обмотка (N₁)', coreX - 140 * scale, cy + 12 * scale, '#ff6b35', 20 * scale, '#ff6b35');
      
      // Стрелка-указатель к обмотке
      ctx.globalAlpha = la * 0.6;
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([4 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.moveTo(coreX - 100 * scale, cy);
      ctx.lineTo(coreX - 68 * scale, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Наконечник стрелки
      ctx.beginPath();
      ctx.moveTo(coreX - 68 * scale, cy);
      ctx.lineTo(coreX - 76 * scale, cy - 5 * scale);
      ctx.lineTo(coreX - 76 * scale, cy + 5 * scale);
      ctx.closePath();
      ctx.fillStyle = '#ff6b35';
      ctx.fill();
    }
  }
  
  // Вторичная обмотка
  if (p > 0.45) {
    const ca = Math.min(1, (p - 0.45) / 0.2);
    ctx.globalAlpha = easeOut(ca);
    const numTurns = Math.floor(8 * easeOut(ca));
    
    for (let i = 0; i < numTurns; i++) {
      const oy = coreY + 40 * scale + i * (coreH - 80 * scale) / 8;
      const phase = time * 2 + i * 0.5 + Math.PI;
      
      ctx.globalAlpha = easeOut(ca);
      ctx.beginPath();
      ctx.ellipse(coreX + coreW + 20 * scale, oy, 45 * scale, 16 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#f7931e';
      ctx.lineWidth = 5 * scale;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.ellipse(coreX + coreW + 20 * scale, oy, 45 * scale, 16 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#f7931e';
      ctx.lineWidth = 14 * scale;
      ctx.globalAlpha = 0.15 * easeOut(ca);
      ctx.stroke();
      
      const pulseA = (Math.sin(phase) * 0.5 + 0.5) * 0.4;
      ctx.globalAlpha = pulseA * easeOut(ca);
      ctx.beginPath();
      ctx.ellipse(coreX + coreW + 20 * scale, oy, 45 * scale, 16 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 8 * scale;
      ctx.stroke();
    }
    
    if (p > 0.55 && p < 0.8) {
      const la = p < 0.6 ? easeOut((p - 0.55) / 0.05) : p > 0.75 ? 1 - easeInOut((p - 0.75) / 0.05) : 1;
      ctx.globalAlpha = la;
      drawGlowText(ctx, 'Вторичная', coreX + coreW + 140 * scale, cy - 20 * scale, '#f7931e', 20 * scale, '#f7931e');
      drawGlowText(ctx, 'обмотка (N₂)', coreX + coreW + 140 * scale, cy + 12 * scale, '#f7931e', 20 * scale, '#f7931e');
      
      // Стрелка-указатель к обмотке
      ctx.globalAlpha = la * 0.6;
      ctx.strokeStyle = '#f7931e';
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([4 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.moveTo(coreX + coreW + 100 * scale, cy);
      ctx.lineTo(coreX + coreW + 68 * scale, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Наконечник стрелки
      ctx.beginPath();
      ctx.moveTo(coreX + coreW + 68 * scale, cy);
      ctx.lineTo(coreX + coreW + 76 * scale, cy - 5 * scale);
      ctx.lineTo(coreX + coreW + 76 * scale, cy + 5 * scale);
      ctx.closePath();
      ctx.fillStyle = '#f7931e';
      ctx.fill();
    }
  }
}

function renderScene3(ctx: CanvasRenderingContext2D, time: number, cx: number, cy: number, scale: number) {
  const p = getSceneProgress(time, 2);
  
  const coreW = 300 * scale;
  const coreH = 420 * scale;
  const coreX = cx - coreW / 2;
  const coreY = cy - coreH / 2 + 30 * scale;
  
  // Сердечник
  ctx.globalAlpha = 1;
  const coreGrad = ctx.createLinearGradient(coreX, coreY, coreX + coreW, coreY);
  coreGrad.addColorStop(0, '#1a202c');
  coreGrad.addColorStop(0.5, '#2d3748');
  coreGrad.addColorStop(1, '#1a202c');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(coreX, coreY, coreW, coreH);
  
  const innerM = 65 * scale;
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(coreX + innerM, coreY + innerM, coreW - innerM * 2, coreH - innerM * 2);
  
  // Первичная обмотка — пульсирует
  const primaryGlow = Math.sin(time * 3) * 0.3 + 0.7;
  for (let i = 0; i < 8; i++) {
    const oy = coreY + 40 * scale + i * (coreH - 80 * scale) / 8;
    const phase = time * 3 + i * 0.5;
    
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.ellipse(coreX - 20 * scale, oy, 45 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 5 * scale;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.ellipse(coreX - 20 * scale, oy, 45 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 18 * scale;
    ctx.globalAlpha = 0.2 * primaryGlow;
    ctx.stroke();
    
    const pulseA = (Math.sin(phase) * 0.5 + 0.5) * 0.6;
    ctx.globalAlpha = pulseA;
    ctx.beginPath();
    ctx.ellipse(coreX - 20 * scale, oy, 45 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 8 * scale;
    ctx.stroke();
  }
  
  // Вторичная обмотка
  for (let i = 0; i < 8; i++) {
    const oy = coreY + 40 * scale + i * (coreH - 80 * scale) / 8;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(coreX + coreW + 20 * scale, oy, 45 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#f7931e';
    ctx.lineWidth = 5 * scale;
    ctx.stroke();
  }
  
  // Магнитные линии
  if (p > 0.15) {
    const fluxAppear = Math.min(1, (p - 0.15) / 0.2);
    const fluxPulse = Math.sin(time * 2) * 0.3 + 0.7;
    
    for (let i = 0; i < 5; i++) {
      const lx = coreX + innerM + (i + 0.5) * (coreW - innerM * 2) / 5;
      ctx.globalAlpha = easeOut(fluxAppear) * fluxPulse * 0.8;
      drawGlowLine(ctx, lx, coreY + 15 * scale, lx, coreY + coreH - 15 * scale, '#00d4ff', 3 * scale, 20 * scale);
    }
    
    // Горизонтальные линии (верх/низ)
    for (let i = 0; i < 3; i++) {
      const ly = coreY + 20 * scale + i * 12 * scale;
      ctx.globalAlpha = easeOut(fluxAppear) * fluxPulse * 0.5;
      drawGlowLine(ctx, coreX + 8 * scale, ly, coreX + coreW - 8 * scale, ly, '#00d4ff', 2 * scale, 12 * scale);
    }
    for (let i = 0; i < 3; i++) {
      const ly = coreY + coreH - 20 * scale - i * 12 * scale;
      ctx.globalAlpha = easeOut(fluxAppear) * fluxPulse * 0.5;
      drawGlowLine(ctx, coreX + 8 * scale, ly, coreX + coreW - 8 * scale, ly, '#00d4ff', 2 * scale, 12 * scale);
    }
    
    // Петля потока
    if (p > 0.3) {
      const loopAppear = Math.min(1, (p - 0.3) / 0.2);
      ctx.globalAlpha = easeOut(loopAppear) * fluxPulse * 0.35;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 30 * scale, coreW / 2 + 80 * scale, coreH / 2 + 50 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([12 * scale, 6 * scale]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Стрелки
      const arrowAngle = time * 1.5;
      for (let a = 0; a < 4; a++) {
        const angle = arrowAngle + a * Math.PI / 2;
        const ax = cx + Math.cos(angle) * (coreW / 2 + 80 * scale);
        const ay = cy + 30 * scale + Math.sin(angle) * (coreH / 2 + 50 * scale);
        ctx.globalAlpha = easeOut(loopAppear) * 0.9;
        ctx.beginPath();
        ctx.arc(ax, ay, 5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#00d4ff';
        ctx.fill();
      }
    }
  }
  
  // Частицы
  if (p > 0.4) {
    const pa = Math.min(1, (p - 0.4) / 0.15);
    for (let i = 0; i < 20; i++) {
      const px = coreX + innerM + ((time * 60 + i * 30) % (coreW - innerM * 2));
      const py = coreY + 30 * scale + (Math.sin(time * 3 + i * 1.7) * 0.5 + 0.5) * (coreH - 60 * scale);
      const pAlpha = easeOut(pa) * (Math.sin(time * 5 + i * 2) * 0.3 + 0.7);
      
      ctx.globalAlpha = pAlpha * 0.9;
      ctx.beginPath();
      ctx.arc(px, py, 4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#00d4ff';
      ctx.fill();
      
      ctx.globalAlpha = pAlpha * 0.3;
      ctx.beginPath();
      ctx.arc(px, py, 12 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#00d4ff';
      ctx.fill();
    }
  }
  
  // Текст
  if (p > 0.6 && p < 0.95) {
    const ta = p < 0.65 ? easeOut((p - 0.6) / 0.05) : p > 0.9 ? 1 - easeInOut((p - 0.9) / 0.05) : 1;
    ctx.globalAlpha = ta;
    drawGlowText(ctx, 'Переменный ток создаёт', cx, coreY + coreH + 70 * scale, '#00d4ff', 24 * scale, '#00d4ff');
    drawGlowText(ctx, 'переменное магнитное поле', cx, coreY + coreH + 102 * scale, '#00d4ff', 24 * scale, '#00d4ff');
  }
}

function renderScene4(ctx: CanvasRenderingContext2D, time: number, cx: number, cy: number, scale: number) {
  const p = getSceneProgress(time, 3);
  
  const coreW = 280 * scale;
  const coreH = 380 * scale;
  const coreX = cx - coreW / 2;
  const coreY = cy - coreH / 2;
  
  // Сердечник
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#2d3748';
  ctx.fillRect(coreX, coreY, coreW, coreH);
  const innerM = 60 * scale;
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(coreX + innerM, coreY + innerM, coreW - innerM * 2, coreH - innerM * 2);
  
  const isStepDown = p < 0.5;
  const primaryTurns = isStepDown ? 8 : 4;
  const secondaryTurns = isStepDown ? 4 : 8;
  
  // Первичная обмотка
  for (let i = 0; i < primaryTurns; i++) {
    const oy = coreY + 40 * scale + i * (coreH - 80 * scale) / primaryTurns;
    const brightness = isStepDown ? 1 : 0.6;
    
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.ellipse(coreX - 20 * scale, oy, 40 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 5 * scale;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.ellipse(coreX - 20 * scale, oy, 40 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 14 * scale;
    ctx.globalAlpha = 0.15 * brightness * (Math.sin(time * 4 + i) * 0.3 + 0.7);
    ctx.stroke();
  }
  
  // Вторичная обмотка
  for (let i = 0; i < secondaryTurns; i++) {
    const oy = coreY + 40 * scale + i * (coreH - 80 * scale) / secondaryTurns;
    const brightness = isStepDown ? 0.5 : 1;
    
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.ellipse(coreX + coreW + 20 * scale, oy, 40 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#f7931e';
    ctx.lineWidth = 5 * scale;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.ellipse(coreX + coreW + 20 * scale, oy, 40 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 14 * scale;
    ctx.globalAlpha = 0.15 * brightness * (Math.sin(time * 4 + i + Math.PI) * 0.3 + 0.7);
    ctx.stroke();
  }
  
  // Поток
  const fluxPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  for (let i = 0; i < 3; i++) {
    const lx = coreX + innerM + (i + 0.5) * (coreW - innerM * 2) / 3;
    ctx.globalAlpha = fluxPulse * 0.6;
    drawGlowLine(ctx, lx, coreY + 15 * scale, lx, coreY + coreH - 15 * scale, '#00d4ff', 2 * scale, 12 * scale);
  }
  
  // Частицы во вторичной
  for (let i = 0; i < 8; i++) {
    const oy = coreY + 40 * scale + i * (coreH - 80 * scale) / secondaryTurns;
    const pp = time * 3 + i * 1.5;
    const px = coreX + coreW + 20 * scale + Math.cos(pp) * 40 * scale;
    const py = oy + Math.sin(pp) * 14 * scale;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(px, py, 4 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(px, py, 10 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
  }
  
  // Формула
  if (p > 0.05 && p < 0.9) {
    const fa = p < 0.1 ? easeOut((p - 0.05) / 0.05) : p > 0.85 ? 1 - easeInOut((p - 0.85) / 0.05) : 1;
    ctx.globalAlpha = fa;
    drawGlowText(ctx, 'U₁ / U₂ = N₁ / N₂', cx, coreY - 60 * scale, '#ffffff', 32 * scale, '#00d4ff');
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
    drawGlowText(ctx, 'Понижающий', cx, coreY + coreH + 60 * scale, '#ff6b35', 26 * scale, '#ff6b35');
    drawGlowText(ctx, 'N₁ > N₂ → U₁ > U₂', cx, coreY + coreH + 95 * scale, '#8892b0', 20 * scale);
    
    ctx.globalAlpha = la * 0.9;
    drawGlowText(ctx, '220В ⚡', coreX - 90 * scale, coreY - 10 * scale, '#ffd700', 22 * scale, '#ffd700');
    drawGlowText(ctx, '12В', coreX + coreW + 90 * scale, coreY - 10 * scale, '#ff6b35', 22 * scale, '#ff6b35');
  }
  
  // Повышающий
  if (p > 0.55 && p < 0.85) {
    const la = p < 0.6 ? easeOut((p - 0.55) / 0.05) : p > 0.8 ? 1 - easeInOut((p - 0.8) / 0.05) : 1;
    ctx.globalAlpha = la;
    drawGlowText(ctx, 'Повышающий', cx, coreY + coreH + 60 * scale, '#f7931e', 26 * scale, '#f7931e');
    drawGlowText(ctx, 'N₁ < N₂ → U₁ < U₂', cx, coreY + coreH + 95 * scale, '#8892b0', 20 * scale);
    
    ctx.globalAlpha = la * 0.9;
    drawGlowText(ctx, '12В', coreX - 90 * scale, coreY - 10 * scale, '#ff6b35', 22 * scale, '#ff6b35');
    drawGlowText(ctx, '⚡ 220В', coreX + coreW + 90 * scale, coreY - 10 * scale, '#ffd700', 22 * scale, '#ffd700');
  }
}

function renderScene5(ctx: CanvasRenderingContext2D, time: number, cx: number, cy: number, scale: number) {
  const p = getSceneProgress(time, 4);
  
  const schemeY = cy + 20 * scale;
  const stationX = cx - 350 * scale;
  const transX = cx;
  const cityX = cx + 350 * scale;
  
  // Электростанция
  if (p > 0.05) {
    const a = Math.min(1, (p - 0.05) / 0.15);
    ctx.globalAlpha = easeOut(a);
    
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(stationX - 55 * scale, schemeY - 70 * scale, 110 * scale, 140 * scale);
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(stationX + 20 * scale, schemeY - 110 * scale, 20 * scale, 40 * scale);
    
    ctx.fillStyle = '#ffd700';
    ctx.globalAlpha = easeOut(a) * (Math.sin(time * 3) * 0.2 + 0.8);
    ctx.fillRect(stationX - 35 * scale, schemeY - 40 * scale, 20 * scale, 20 * scale);
    ctx.fillRect(stationX + 15 * scale, schemeY - 40 * scale, 20 * scale, 20 * scale);
    ctx.fillRect(stationX - 35 * scale, schemeY - 10 * scale, 20 * scale, 20 * scale);
    ctx.fillRect(stationX + 15 * scale, schemeY - 10 * scale, 20 * scale, 20 * scale);
    
    ctx.globalAlpha = easeOut(a);
    drawGlowText(ctx, '⚡', stationX, schemeY - 130 * scale, '#ffd700', 40 * scale, '#ffd700');
    ctx.globalAlpha = easeOut(a) * 0.9;
    drawGlowText(ctx, 'Электростанция', stationX, schemeY + 90 * scale, '#8892b0', 18 * scale);
  }
  
  // ЛЭП
  if (p > 0.15) {
    const la = Math.min(1, (p - 0.15) / 0.15);
    ctx.globalAlpha = easeOut(la);
    
    for (let i = 0; i < 4; i++) {
      const px = stationX + 80 * scale + i * 65 * scale;
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(px, schemeY);
      ctx.lineTo(px, schemeY - 55 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px - 16 * scale, schemeY - 48 * scale);
      ctx.lineTo(px + 16 * scale, schemeY - 48 * scale);
      ctx.stroke();
    }
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(stationX + 55 * scale, schemeY - 48 * scale);
    ctx.lineTo(transX - 55 * scale, schemeY - 48 * scale);
    ctx.stroke();
    
    // Энергия
    const ep = (time * 100) % 250;
    for (let i = 0; i < 5; i++) {
      const ex = stationX + 55 * scale + ((ep + i * 60) % (transX - stationX - 110 * scale));
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(ex, schemeY - 48 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(ex, schemeY - 48 * scale, 14 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
    }
    
    ctx.globalAlpha = easeOut(la) * 0.7;
    drawGlowText(ctx, 'ЛЭП (110 кВ)', cx - 140 * scale, schemeY - 80 * scale, '#64748b', 15 * scale);
  }
  
  // Трансформатор
  if (p > 0.25) {
    const ta = Math.min(1, (p - 0.25) / 0.15);
    ctx.globalAlpha = easeOut(ta);
    
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.arc(transX - 20 * scale, schemeY, 28 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(transX + 20 * scale, schemeY, 28 * scale, 0, Math.PI * 2);
    ctx.stroke();
    
    const gp = Math.sin(time * 3) * 0.3 + 0.7;
    ctx.globalAlpha = easeOut(ta) * 0.25 * gp;
    ctx.beginPath();
    ctx.arc(transX, schemeY, 45 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#00d4ff';
    ctx.fill();
    
    ctx.globalAlpha = easeOut(ta);
    drawGlowText(ctx, '⚡ ТРАНСФОРМАТОР', transX, schemeY + 65 * scale, '#00d4ff', 18 * scale, '#00d4ff');
  }
  
  // Провода к городу
  if (p > 0.4) {
    const wa = Math.min(1, (p - 0.4) / 0.15);
    ctx.globalAlpha = easeOut(wa);
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(transX + 55 * scale, schemeY);
    ctx.lineTo(cityX - 55 * scale, schemeY);
    ctx.stroke();
    
    const ep2 = (time * 50) % 250;
    for (let i = 0; i < 4; i++) {
      const ex = transX + 55 * scale + ((ep2 + i * 70) % (cityX - transX - 110 * scale));
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(ex, schemeY, 4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#f7931e';
      ctx.fill();
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.arc(ex, schemeY, 10 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#f7931e';
      ctx.fill();
    }
  }
  
  // Город
  if (p > 0.5) {
    const ca = Math.min(1, (p - 0.5) / 0.2);
    
    for (let i = 0; i < 6; i++) {
      const hx = cityX - 75 * scale + i * 30 * scale;
      const hh = (40 + Math.sin(i * 2) * 25) * scale;
      
      ctx.globalAlpha = easeOut(ca);
      ctx.fillStyle = '#1a202c';
      ctx.fillRect(hx - 14 * scale, schemeY - hh, 28 * scale, hh);
      
      ctx.beginPath();
      ctx.moveTo(hx - 18 * scale, schemeY - hh);
      ctx.lineTo(hx, schemeY - hh - 18 * scale);
      ctx.lineTo(hx + 18 * scale, schemeY - hh);
      ctx.fillStyle = '#2d3748';
      ctx.fill();
      
      const wg = Math.sin(time * 2 + i) * 0.2 + 0.8;
      ctx.fillStyle = '#ffd700';
      ctx.globalAlpha = easeOut(ca) * wg;
      ctx.fillRect(hx - 8 * scale, schemeY - hh + 12 * scale, 6 * scale, 6 * scale);
      ctx.fillRect(hx + 2 * scale, schemeY - hh + 12 * scale, 6 * scale, 6 * scale);
      if (hh > 45 * scale) {
        ctx.fillRect(hx - 8 * scale, schemeY - hh + 28 * scale, 6 * scale, 6 * scale);
        ctx.fillRect(hx + 2 * scale, schemeY - hh + 28 * scale, 6 * scale, 6 * scale);
      }
      if (hh > 60 * scale) {
        ctx.fillRect(hx - 8 * scale, schemeY - hh + 44 * scale, 6 * scale, 6 * scale);
        ctx.fillRect(hx + 2 * scale, schemeY - hh + 44 * scale, 6 * scale, 6 * scale);
      }
    }
    
    ctx.globalAlpha = easeOut(ca) * 0.9;
    drawGlowText(ctx, '🏙️ Город (220В)', cityX, schemeY + 65 * scale, '#8892b0', 18 * scale);
  }
  
  // Текст
  if (p > 0.75) {
    const ta = easeOut((p - 0.75) / 0.1);
    ctx.globalAlpha = Math.min(1, ta);
    drawGlowText(ctx, 'Трансформаторы — основа', cx, schemeY + 130 * scale, '#00d4ff', 24 * scale, '#00d4ff');
    drawGlowText(ctx, 'энергосистемы', cx, schemeY + 162 * scale, '#00d4ff', 24 * scale, '#00d4ff');
  }
}

function renderScene6(ctx: CanvasRenderingContext2D, time: number, cx: number, cy: number, scale: number) {
  const p = getSceneProgress(time, 5);
  const pulse = Math.sin(time * 4) * 0.1 + 1;
  const alpha = easeOut(Math.min(1, p / 0.3));
  
  ctx.globalAlpha = alpha;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulse, pulse);
  drawGlowText(ctx, 'ПОДПИСЫВАЙСЯ!', 0, -30 * scale, '#ffffff', 56 * scale, '#00d4ff');
  drawGlowText(ctx, '🔔', 0, 60 * scale, '#ffd700', 52 * scale, '#ffd700');
  ctx.restore();
  
  for (let i = 0; i < 25; i++) {
    const angle = time * 0.5 + i * Math.PI * 2 / 25;
    const radius = 250 * scale + Math.sin(time * 2 + i) * 40 * scale;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    ctx.globalAlpha = alpha * 0.6;
    ctx.beginPath();
    ctx.arc(px, py, 4 * scale, 0, Math.PI * 2);
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

    const currentSceneIdx = SCENES.findIndex(s => time >= s.start && time < s.end);
    const currentValidIdx = currentSceneIdx >= 0 ? currentSceneIdx : 5;
    
    // Обновляем UI раз в ~10 кадров
    if (Math.floor(elapsed * 6) % 1 === 0) {
      setCurrentScene(currentValidIdx);
      setProgress(time / TOTAL_DURATION);
    }

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const scale = Math.min(W / 1080, H / 1920) * 1.15; // Увеличенный масштаб

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
    
    // ТИТРЫ СВЕРХУ
    const captionSceneIdx = SCENES.findIndex(s => time >= s.start && time < s.end);
    const captionIdx = captionSceneIdx >= 0 ? captionSceneIdx : 5;
    const captionSceneP = getSceneProgress(time, captionIdx);
    drawCaption(ctx, captionIdx, captionSceneP, W, scale);

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
      ctx.fillStyle = i === captionIdx ? '#00d4ff' : '#4a5568';
      ctx.beginPath();
      ctx.arc(mx, barY + 2 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 0.7;
    ctx.font = `${12 * scale}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = '#8892b0';
    ctx.textAlign = 'left';
    ctx.fillText(SCENES[captionIdx]?.name || '', barX, barY - 10 * scale);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.floor(time)}с / ${TOTAL_DURATION}с`, barX + barW, barY - 10 * scale);
    ctx.globalAlpha = 1;

    // Индикатор записи (красная точка в углу)
    if (isRecordingRef.current) {
      const dotSize = 8 * scale;
      const dotX = 30 * scale;
      const dotY = 30 * scale;
      const pulse = Math.sin(time * 4) * 0.3 + 0.7;
      
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = 1;
      ctx.font = `bold ${14 * scale}px 'Segoe UI', sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText('REC', dotX + dotSize + 8 * scale, dotY + 5 * scale);
    }

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

  // Запись видео
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);

  const startRecording = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Предупреждение пользователя
    const confirmed = window.confirm(
      'Начнётся запись 60-секундной анимации в формате WebM.\n\n' +
      '⚠️ Не сворачивайте вкладку и не переключайтесь на другие окна!\n\n' +
      'После завершения файл скачается автоматически.\n\n' +
      'Продолжить?'
    );
    
    if (!confirmed) return;

    // Перезапускаем анимацию с начала
    restart();

    // Получаем поток с canvas
    const stream = canvas.captureStream(60); // 60 FPS
    
    // Определяем поддерживаемый формат
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    
    let selectedMime = '';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    if (!selectedMime) {
      alert('Ваш браузер не поддерживает запись видео');
      return;
    }

    // Создаем MediaRecorder
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 8000000 // 8 Mbps для высокого качества
    });

    chunksRef.current = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transformer-animation-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsRecording(false);
      isRecordingRef.current = false;
      setRecordingProgress(0);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000); // Собираем данные каждую секунду
    setIsRecording(true);
    isRecordingRef.current = true;

    // Обновляем прогресс
    const updateProgress = () => {
      if (!isPlayingRef.current) return;
      
      const elapsed = (performance.now() - startTimeRef.current - totalPausedRef.current) / 1000;
      const progress = Math.min(elapsed / TOTAL_DURATION, 1);
      setRecordingProgress(progress);

      if (progress >= 1) {
        stopRecording();
      } else {
        requestAnimationFrame(updateProgress);
      }
    };
    requestAnimationFrame(updateProgress);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      isRecordingRef.current = false;
    }
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
          disabled={isRecording}
          className="px-5 py-2 bg-cyan-600/20 border border-cyan-500/40 rounded-lg text-cyan-300 hover:bg-cyan-600/30 transition-all text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? '⏸ Пауза' : '▶ Играть'}
        </button>
        <button
          onClick={restart}
          disabled={isRecording}
          className="px-5 py-2 bg-orange-600/20 border border-orange-500/40 rounded-lg text-orange-300 hover:bg-orange-600/30 transition-all text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔄 Заново
        </button>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-5 py-2 rounded-lg transition-all text-sm font-medium cursor-pointer ${
            isRecording
              ? 'bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30'
              : 'bg-green-600/20 border border-green-500/40 text-green-300 hover:bg-green-600/30'
          }`}
        >
          {isRecording ? '⏹ Стоп' : '⏺ Записать видео'}
        </button>
      </div>

      {isRecording && (
        <div className="mt-3 w-full max-w-[380px]">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Идёт запись видео...
            </span>
            <span>{Math.round(recordingProgress * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
              style={{ width: `${recordingProgress * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Анимиция воспроизводится полностью. Файл WebM скачается автоматически.
          </p>
        </div>
      )}

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

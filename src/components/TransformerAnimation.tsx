import { useEffect, useRef, useCallback, useState } from 'react';
import { Muxer, ArrayBufferTarget } from 'webm-muxer';

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

// ТИТРЫ СВЕРХУ — вирусные заголовки
const SCENE_CAPTIONS = [
  { title: '🔥 99% ЛЮДЕЙ НЕ ЗНАЮТ', subtitle: 'Как работает ЭТО устройство в каждом доме' },
  { title: '📐 ПРОЩЕ ЧЕМ КАЖЕТСЯ', subtitle: 'Всего 3 детали = магия физики ✨' },
  { title: '🧲 ЭТО КАК ВОЛШЕБСТВО', subtitle: 'Но это чистая физика!' },
  { title: '⚡ ВАУ-ЭФФЕКТ', subtitle: '110 000В → 220В за секунду!' },
  { title: '🏙️ БЕЗ ЭТОГО НЕТ WI-FI', subtitle: 'Трансформаторы везде!' },
  { title: '🔔 ПОДПИШИСЬ!', subtitle: 'Ещё больше крутой физики!' },
];

// Поясняющие титры — вирусные факты и метафоры
const EXPLANATION_TITLES = [
  // Сцена 1: Вступление — ШОК-ФАКТЫ
  [
    { text: '💡 Без трансформаторов', x: 'center', y: 0.68, start: 0.3, end: 0.5, color: '#ffd700', size: 26 },
    { text: 'твой телефон НЕ РАБОТАЛ БЫ!', x: 'center', y: 0.73, start: 0.35, end: 0.55, color: '#ff6b35', size: 24 },
    { text: '📱 → 🔌 → ТРАНСФОРМАТОР', x: 'center', y: 0.8, start: 0.45, end: 0.65, color: '#00d4ff', size: 22 },
  ],
  // Сцена 2: Компоненты — ВИЗУАЛЬНЫЕ МЕТАФОРЫ
  [
    { text: '🏗️ Представь водопровод:', x: 'center', y: 0.82, start: 0.15, end: 0.35, color: '#ffffff', size: 22 },
    { text: 'Сердечник = труба', x: 'center', y: 0.87, start: 0.2, end: 0.4, color: '#8892b0', size: 20 },
    { text: 'Обмотки = насосы', x: 'center', y: 0.91, start: 0.25, end: 0.45, color: '#00d4ff', size: 20 },
    { text: '⚡ Факт: весит до 300 тонн!', x: 'center', y: 0.96, start: 0.6, end: 0.8, color: '#ffd700', size: 18 },
  ],
  // Сцена 3: Магнитный поток — ВАУ-ЭФФЕКТ
  [
    { text: '🧲 Магия? НЕТ — ФИЗИКА!', x: 'center', y: 0.82, start: 0.2, end: 0.4, color: '#ff6b35', size: 24 },
    { text: 'Ток создаёт магнитное поле', x: 'center', y: 0.87, start: 0.3, end: 0.5, color: '#00d4ff', size: 20 },
    { text: 'Магнитное поле создаёт ток', x: 'center', y: 0.91, start: 0.4, end: 0.6, color: '#00d4ff', size: 20 },
    { text: '⚡ Это работает 140 лет!', x: 'center', y: 0.96, start: 0.7, end: 0.9, color: '#ffd700', size: 18 },
  ],
  // Сцена 4: Преобразование — БОЛЬШИЕ ЦИФРЫ
  [
    { text: '🔢 МАТЕМАТИКА ПРОСТА:', x: 'center', y: 0.82, start: 0.15, end: 0.35, color: '#ffffff', size: 22 },
    { text: '1000 витков → 100 витков', x: 'center', y: 0.87, start: 0.2, end: 0.4, color: '#ff6b35', size: 20 },
    { text: '10 000В → 1 000В', x: 'center', y: 0.92, start: 0.3, end: 0.5, color: '#ffd700', size: 24 },
    { text: '💡 В 10 раз меньше!', x: 'center', y: 0.97, start: 0.6, end: 0.8, color: '#00d4ff', size: 22 },
  ],
  // Сцена 5: Применение — КОНТРАСТ МАСШТАБОВ
  [
    { text: '🏭 Электростанция:', x: 'center', y: 0.82, start: 0.15, end: 0.35, color: '#ffd700', size: 20 },
    { text: '110 000 ВОЛЬТ!', x: 'center', y: 0.87, start: 0.2, end: 0.4, color: '#ff6b35', size: 26 },
    { text: '🏠 Твоя розетка:', x: 'center', y: 0.92, start: 0.5, end: 0.7, color: '#00d4ff', size: 20 },
    { text: '220 ВОЛЬТ (в 500 раз меньше!)', x: 'center', y: 0.97, start: 0.55, end: 0.75, color: '#ffffff', size: 22 },
  ],
  // Сцена 6: Финал — ФИНАЛЬНЫЙ ВАУ-МОМЕНТ
  [
    { text: '🌍 В мире 50 МИЛЛИАРДОВ', x: 'center', y: 0.73, start: 0.1, end: 0.35, color: '#ffd700', size: 24 },
    { text: 'трансформаторов!', x: 'center', y: 0.78, start: 0.15, end: 0.4, color: '#ff6b35', size: 26 },
    { text: '⚡ КПД 99% — лучше не бывает!', x: 'center', y: 0.85, start: 0.3, end: 0.55, color: '#00d4ff', size: 22 },
    { text: '🔥 Теперь ты знаешь секрет!', x: 'center', y: 0.92, start: 0.5, end: 0.7, color: '#ffffff', size: 24 },
  ],
];

function drawExplanationTitles(
  ctx: CanvasRenderingContext2D,
  sceneIdx: number,
  sceneProgress: number,
  W: number,
  H: number,
  scale: number
) {
  const titles = EXPLANATION_TITLES[sceneIdx];
  if (!titles) return;

  for (const title of titles) {
    if (sceneProgress >= title.start && sceneProgress <= title.end) {
      const titleProgress = (sceneProgress - title.start) / (title.end - title.start);
      
      // Плавное появление и исчезновение
      let alpha = 1;
      if (titleProgress < 0.15) {
        alpha = easeOut(titleProgress / 0.15);
      } else if (titleProgress > 0.85) {
        alpha = 1 - easeInOut((titleProgress - 0.85) / 0.15);
      }

      const x = title.x === 'center' ? W / 2 : W * parseFloat(title.x as string);
      const y = H * title.y;

      ctx.globalAlpha = alpha;
      ctx.font = `bold ${title.size * scale}px 'Segoe UI', Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Усиленное свечение для вирусных моментов
      ctx.shadowColor = title.color;
      ctx.shadowBlur = 20;
      ctx.fillStyle = title.color;
      ctx.fillText(title.text, x, y);
      
      // Двойное свечение для акцентов
      if (title.size >= 24) {
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillText(title.text, x, y);
      }
      
      ctx.shadowBlur = 0;
    }
  }
}

// Визуальные эффекты для вирусных моментов
function drawViralEffects(
  ctx: CanvasRenderingContext2D,
  sceneIdx: number,
  sceneProgress: number,
  time: number,
  W: number,
  H: number,
  scale: number
) {
  const cx = W / 2;
  const cy = H / 2;

  // Сцена 1: Взрыв энергии при появлении
  if (sceneIdx === 0 && sceneProgress > 0.1 && sceneProgress < 0.3) {
    const burstProgress = (sceneProgress - 0.1) / 0.2;
    const burstRadius = burstProgress * 300 * scale;
    const burstAlpha = (1 - burstProgress) * 0.6;
    
    ctx.globalAlpha = burstAlpha;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, burstRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Лучи
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const len = burstRadius * 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * burstRadius * 0.8, cy + Math.sin(angle) * burstRadius * 0.8);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.stroke();
    }
  }

  // Сцена 4: Большие цифры с эффектом пульсации
  if (sceneIdx === 3 && sceneProgress > 0.2 && sceneProgress < 0.5) {
    const pulse = Math.sin(time * 4) * 0.1 + 1;
    const alpha = Math.min(1, (sceneProgress - 0.2) / 0.1);
    
    ctx.save();
    ctx.translate(cx, cy + 100 * scale);
    ctx.scale(pulse, pulse);
    ctx.globalAlpha = alpha * 0.8;
    
    ctx.font = `bold ${80 * scale}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#ffd700';
    ctx.fillText('10x', 0, 0);
    
    ctx.restore();
  }

  // Сцена 5: Контраст масштабов
  if (sceneIdx === 4 && sceneProgress > 0.3 && sceneProgress < 0.6) {
    const alpha = Math.min(1, (sceneProgress - 0.3) / 0.1);
    
    // Левая сторона — высокое напряжение
    ctx.globalAlpha = alpha * 0.9;
    ctx.font = `bold ${50 * scale}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff6b35';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#ff6b35';
    ctx.fillText('110kV', cx - 150 * scale, cy + 150 * scale);
    
    // Стрелка
    ctx.font = `bold ${40 * scale}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillStyle = '#00d4ff';
    ctx.fillText('→', cx, cy + 150 * scale);
    
    // Правая сторона — низкое напряжение
    ctx.shadowColor = '#00d4ff';
    ctx.fillStyle = '#00d4ff';
    ctx.fillText('220V', cx + 150 * scale, cy + 150 * scale);
    
    ctx.shadowBlur = 0;
  }

  // Сцена 6: Финальный взрыв частиц
  if (sceneIdx === 5 && sceneProgress > 0.2 && sceneProgress < 0.5) {
    const burstProgress = (sceneProgress - 0.2) / 0.3;
    
    for (let i = 0; i < 30; i++) {
      const angle = (i * Math.PI * 2) / 30 + time * 2;
      const radius = (100 + burstProgress * 200) * scale;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      const size = (3 + Math.sin(time * 5 + i) * 2) * scale;
      
      ctx.globalAlpha = (1 - burstProgress) * 0.8;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#00d4ff' : '#ff6b35';
      ctx.fill();
      
      // Свечение
      ctx.globalAlpha = (1 - burstProgress) * 0.3;
      ctx.beginPath();
      ctx.arc(px, py, size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

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
  
  // ХУК: Первые 2 секунды - СУПЕР-ЦЕПЛЯЮЩЕЕ вступление
  if (p < 0.25) {
    const hookProgress = p / 0.25;
    
    // МЕГА-вспышка в начале
    if (hookProgress < 0.2) {
      const flash = 1 - hookProgress / 0.2;
      ctx.globalAlpha = flash;
      
      // Градиентная вспышка
      const flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 500 * scale);
      flashGrad.addColorStop(0, '#ffffff');
      flashGrad.addColorStop(0.3, '#ffd700');
      flashGrad.addColorStop(0.6, '#00d4ff');
      flashGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flashGrad;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    
    // Электрические разряды — больше и ярче
    if (hookProgress > 0.05) {
      const sparkAlpha = Math.min(1, (hookProgress - 0.05) / 0.1);
      for (let i = 0; i < 16; i++) {
        const angle = (time * 10 + i * Math.PI / 8);
        const len = (200 + Math.sin(time * 15 + i * 3) * 100) * scale;
        const sx = cx + Math.cos(angle) * 40 * scale;
        const sy = cy + Math.sin(angle) * 40 * scale;
        const ex = cx + Math.cos(angle) * len;
        const ey = cy + Math.sin(angle) * len;
        
        ctx.globalAlpha = sparkAlpha * 0.8 * (Math.sin(time * 25 + i * 5) * 0.5 + 0.5);
        drawGlowLine(ctx, sx, sy, ex, ey, i % 2 === 0 ? '#00d4ff' : '#ffd700', 3 * scale, 15 * scale);
      }
    }
    
    // Большой цепляющий текст с эффектом "печатающейся машины"
    const textAlpha = hookProgress < 0.1 ? easeOut(hookProgress / 0.1) : hookProgress > 0.75 ? 1 - easeInOut((hookProgress - 0.75) / 0.25) : 1;
    ctx.globalAlpha = textAlpha;
    
    // Масштабирование и тряска
    const textScale = 1 + (1 - hookProgress) * 0.5;
    const shake = hookProgress < 0.2 ? Math.sin(time * 35) * 4 * scale * (1 - hookProgress / 0.2) : 0;
    ctx.save();
    ctx.translate(cx + shake, cy);
    ctx.scale(textScale, textScale);
    
    // ГЛАВНЫЙ ХУК — вирусный заголовок
    drawGlowText(ctx, '🔥 99% ЛЮДЕЙ', 0, -100 * scale, '#ff6b35', 50 * scale, '#ff6b35');
    drawGlowText(ctx, 'НЕ ЗНАЮТ', 0, -35 * scale, '#ffd700', 60 * scale, '#ffd700');
    drawGlowText(ctx, 'КАК ЭТО РАБОТАЕТ!', 0, 40 * scale, '#ffffff', 55 * scale, '#00d4ff');
    drawGlowText(ctx, '⚡', 0, 100 * scale, '#ffd700', 70 * scale, '#ffd700');
    
    ctx.restore();
    
    // Пульсирующие кольца — больше и ярче
    if (hookProgress > 0.1) {
      for (let r = 0; r < 5; r++) {
        const ringProgress = ((hookProgress - 0.1) * 2.5 + r * 0.2) % 1;
        const ringRadius = ringProgress * 400 * scale;
        const ringAlpha = (1 - ringProgress) * 0.5;
        ctx.globalAlpha = ringAlpha;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = r % 2 === 0 ? '#00d4ff' : '#ffd700';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
      }
    }
    
    // Летящие частицы
    if (hookProgress > 0.15) {
      for (let i = 0; i < 20; i++) {
        const angle = (time * 3 + i * Math.PI * 2 / 20);
        const radius = (150 + Math.sin(time * 2 + i) * 50) * scale;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(px, py, 4 * scale, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#00d4ff' : '#ff6b35';
        ctx.fill();
        
        // Свечение
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(px, py, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
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
  const pulse = Math.sin(time * 4) * 0.12 + 1;
  const alpha = easeOut(Math.min(1, p / 0.25));
  
  // Фоновое свечение
  ctx.globalAlpha = alpha * 0.3;
  const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400 * scale);
  bgGlow.addColorStop(0, '#00d4ff');
  bgGlow.addColorStop(0.5, '#ffd700');
  bgGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Главный текст с пульсацией
  ctx.globalAlpha = alpha;
  ctx.save();
  ctx.translate(cx, cy - 50 * scale);
  ctx.scale(pulse, pulse);
  
  // "Теперь ты знаешь!"
  drawGlowText(ctx, '🎉 ТЕПЕРЬ ТЫ', 0, -80 * scale, '#ffffff', 48 * scale, '#00d4ff');
  drawGlowText(ctx, 'ЗНАЕШЬ СЕКРЕТ!', 0, -20 * scale, '#ffd700', 56 * scale, '#ffd700');
  
  ctx.restore();
  
  // Призыв к действию
  if (p > 0.3) {
    const ctaAlpha = easeOut((p - 0.3) / 0.2);
    ctx.globalAlpha = ctaAlpha;
    
    // Кнопка подписки
    const btnY = cy + 80 * scale;
    const btnW = 280 * scale;
    const btnH = 60 * scale;
    
    // Фон кнопки
    const btnGrad = ctx.createLinearGradient(cx - btnW / 2, btnY, cx + btnW / 2, btnY);
    btnGrad.addColorStop(0, '#ff6b35');
    btnGrad.addColorStop(1, '#ffd700');
    ctx.fillStyle = btnGrad;
    
    // Скруглённый прямоугольник
    const radius = 15 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - btnW / 2 + radius, btnY - btnH / 2);
    ctx.lineTo(cx + btnW / 2 - radius, btnY - btnH / 2);
    ctx.quadraticCurveTo(cx + btnW / 2, btnY - btnH / 2, cx + btnW / 2, btnY - btnH / 2 + radius);
    ctx.lineTo(cx + btnW / 2, btnY + btnH / 2 - radius);
    ctx.quadraticCurveTo(cx + btnW / 2, btnY + btnH / 2, cx + btnW / 2 - radius, btnY + btnH / 2);
    ctx.lineTo(cx - btnW / 2 + radius, btnY + btnH / 2);
    ctx.quadraticCurveTo(cx - btnW / 2, btnY + btnH / 2, cx - btnW / 2, btnY + btnH / 2 - radius);
    ctx.lineTo(cx - btnW / 2, btnY - btnH / 2 + radius);
    ctx.quadraticCurveTo(cx - btnW / 2, btnY - btnH / 2, cx - btnW / 2 + radius, btnY - btnH / 2);
    ctx.closePath();
    ctx.fill();
    
    // Свечение кнопки
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Текст кнопки
    ctx.font = `bold ${24 * scale}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🔔 ПОДПИШИСЬ!', cx, btnY);
    
    // Дополнительный текст
    if (p > 0.5) {
      const subAlpha = easeOut((p - 0.5) / 0.2);
      ctx.globalAlpha = subAlpha;
      drawGlowText(ctx, 'Узнай больше крутой физики!', cx, btnY + 50 * scale, '#00d4ff', 20 * scale, '#00d4ff');
    }
  }
  
  // Вихрь частиц
  for (let i = 0; i < 40; i++) {
    const angle = time * 2 + i * Math.PI * 2 / 40;
    const radius = (200 + Math.sin(time * 3 + i * 0.5) * 80) * scale;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    const size = (3 + Math.sin(time * 5 + i) * 2) * scale;
    
    ctx.globalAlpha = alpha * 0.7;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = i % 4 === 0 ? '#ffd700' : i % 4 === 1 ? '#00d4ff' : i % 4 === 2 ? '#ff6b35' : '#ffffff';
    ctx.fill();
    
    // Свечение
    ctx.globalAlpha = alpha * 0.2;
    ctx.beginPath();
    ctx.arc(px, py, size * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Молнии по краям
  if (p > 0.4) {
    const lightningAlpha = easeOut((p - 0.4) / 0.2);
    for (let i = 0; i < 8; i++) {
      const angle = (time * 5 + i * Math.PI / 4);
      const len = (300 + Math.sin(time * 20 + i * 7) * 100) * scale;
      const sx = cx + Math.cos(angle) * 100 * scale;
      const sy = cy + Math.sin(angle) * 100 * scale;
      const ex = cx + Math.cos(angle) * len;
      const ey = cy + Math.sin(angle) * len;
      
      ctx.globalAlpha = lightningAlpha * 0.6 * (Math.sin(time * 30 + i * 10) * 0.5 + 0.5);
      drawGlowLine(ctx, sx, sy, ex, ey, '#ffd700', 2 * scale, 10 * scale);
    }
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
      
      // Обновляем субтитры и озвучку
      if (isVoiceEnabled) {
        const sceneScripts = voiceScripts[currentValidIdx];
        if (sceneScripts) {
          const activeScript = sceneScripts.find(s => time >= s.start && time < s.end);
          if (activeScript && activeScript.text !== currentSubtitle) {
            setCurrentSubtitle(activeScript.text);
            speakText(activeScript.text);
          }
        }
      }
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

    // Поясняющие титры
    drawExplanationTitles(ctx, captionIdx, captionSceneP, W, H, scale);

    // Вирусные визуальные эффекты
    drawViralEffects(ctx, captionIdx, captionSceneP, time, W, H, scale);

    // Субтитры (если включена озвучка)
    if (isVoiceEnabled && currentSubtitle) {
      const subtitleY = H * 0.78;
      const maxWidth = W * 0.85;
      
      ctx.globalAlpha = 0.9;
      ctx.font = `bold ${20 * scale}px 'Segoe UI', Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Фон для субтитров
      const metrics = ctx.measureText(currentSubtitle);
      const textWidth = Math.min(metrics.width, maxWidth);
      const padding = 15 * scale;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      const rectX = W / 2 - textWidth / 2 - padding;
      const rectY = subtitleY - 15 * scale;
      const rectW = textWidth + padding * 2;
      const rectH = 30 * scale;
      const radius = 8 * scale;
      
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + rectW - radius, rectY);
      ctx.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + radius);
      ctx.lineTo(rectX + rectW, rectY + rectH - radius);
      ctx.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - radius, rectY + rectH);
      ctx.lineTo(rectX + radius, rectY + rectH);
      ctx.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - radius);
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();
      ctx.fill();
      
      // Текст субтитров
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(currentSubtitle, W / 2, subtitleY, maxWidth);
      ctx.shadowBlur = 0;
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

    // Инициализируем SpeechSynthesis
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
      // Останавливаем озвучку при размонтировании
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, [render]);

  const togglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    isPlayingRef.current = next;
    if (!next) {
      // Пауза — запоминаем время
      pausedAtRef.current = performance.now();
      // Останавливаем озвучку
      if (speechSynthRef.current) {
        speechSynthRef.current.pause();
      }
    } else {
      // Возобновление — добавляем длительность паузы
      if (pausedAtRef.current > 0) {
        totalPausedRef.current += performance.now() - pausedAtRef.current;
        pausedAtRef.current = 0;
      }
      // Возобновляем озвучку
      if (speechSynthRef.current && isVoiceEnabled) {
        speechSynthRef.current.resume();
      }
    }
  };

  // Функция озвучки текста
  const speakText = (text: string) => {
    if (!isVoiceEnabled || !speechSynthRef.current) return;
    
    // Останавливаем предыдущую речь
    speechSynthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Пытаемся найти русский голос
    const voices = speechSynthRef.current.getVoices();
    const russianVoice = voices.find(v => v.lang.startsWith('ru'));
    if (russianVoice) {
      utterance.voice = russianVoice;
    }
    
    utteranceRef.current = utterance;
    speechSynthRef.current.speak(utterance);
  };

  // Остановить озвучку
  const stopVoice = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
    setCurrentSubtitle('');
  };

  // Включить/выключить озвучку
  const toggleVoice = () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    
    if (!next) {
      stopVoice();
    } else {
      // Инициализируем SpeechSynthesis
      if (!speechSynthRef.current) {
        speechSynthRef.current = window.speechSynthesis;
      }
    }
  };

  const restart = () => {
    startTimeRef.current = 0;
    totalPausedRef.current = 0;
    pausedAtRef.current = 0;
    isPlayingRef.current = true;
    setIsPlaying(true);
    setCurrentSubtitle('');
  };

  // Тексты озвучки для каждой сцены
  const voiceScripts = [
    // Сцена 1: 0-8 сек
    [
      { text: 'Девяносто девять процентов людей не знают, как это работает!', start: 0, end: 4 },
      { text: 'Трансформатор — устройство, которое управляет всей энергией планеты.', start: 4, end: 8 },
    ],
    // Сцена 2: 8-20 сек
    [
      { text: 'Всего три детали: сердечник из стали и две медные обмотки.', start: 8, end: 13 },
      { text: 'Первичная обмотка создаёт магнитное поле.', start: 13, end: 17 },
      { text: 'Вторичная обмотка его ловит.', start: 17, end: 20 },
    ],
    // Сцена 3: 20-35 сек
    [
      { text: 'Это как волшебство, но это чистая физика!', start: 20, end: 25 },
      { text: 'Переменный ток создаёт переменное магнитное поле.', start: 25, end: 30 },
      { text: 'А оно, в свою очередь, создаёт ток во второй обмотке.', start: 30, end: 35 },
    ],
    // Сцена 4: 35-50 сек
    [
      { text: 'Математика проста: сто витков против десяти.', start: 35, end: 40 },
      { text: 'Десять тысяч вольт превращаются в одну тысячу.', start: 40, end: 45 },
      { text: 'В десять раз меньше! Это понижающий трансформатор.', start: 45, end: 50 },
    ],
    // Сцена 5: 50-58 сек
    [
      { text: 'Электростанция выдаёт сто десять тысяч вольт!', start: 50, end: 54 },
      { text: 'А в твоей розетке — всего двести двадцать. В пятьсот раз меньше!', start: 54, end: 58 },
    ],
    // Сцена 6: 58-60 сек
    [
      { text: 'Теперь ты знаешь секрет! Подписывайся!', start: 58, end: 60 },
    ],
  ];

  // Запись видео
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const isRecordingRef = useRef(false);

  // Голосовая озвучка
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fallback метод записи через MediaRecorder
  const startRecordingWithMediaRecorder = async (canvas: HTMLCanvasElement) => {
    if (typeof canvas.captureStream !== 'function') {
      alert('Ваш браузер не поддерживает запись видео.\nПопробуйте Chrome, Firefox или Edge последней версии.');
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      alert('Ваш браузер не поддерживает MediaRecorder.\nПопробуйте Chrome, Firefox или Edge.');
      return;
    }

    restart();

    try {
      let stream: MediaStream;
      try {
        stream = canvas.captureStream(60);
      } catch {
        stream = canvas.captureStream();
      }

      const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        try {
          if (MediaRecorder.isTypeSupported(mime)) {
            selectedMime = mime;
            break;
          }
        } catch { /* ignore */ }
      }

      const options: MediaRecorderOptions = { videoBitsPerSecond: 8_000_000 };
      if (selectedMime) options.mimeType = selectedMime;

      const recorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transformer-animation-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Сохраняем URL для возможности открытия видео
        setRecordedVideoUrl(url);
        
        setIsRecording(false);
        isRecordingRef.current = false;
        setRecordingProgress(0);
      };

      recorder.start(1000);
      setIsRecording(true);
      isRecordingRef.current = true;

      const updateProgress = () => {
        if (!isRecordingRef.current) return;
        const elapsed = (performance.now() - startTimeRef.current - totalPausedRef.current) / 1000;
        const progress = Math.min(elapsed / TOTAL_DURATION, 1);
        setRecordingProgress(progress);
        if (progress >= 1) {
          isRecordingRef.current = false;
          recorder.stop();
        } else {
          requestAnimationFrame(updateProgress);
        }
      };
      requestAnimationFrame(updateProgress);
    } catch (error) {
      console.error('Ошибка записи:', error);
      alert('Ошибка при записи видео: ' + (error as Error).message);
    }
  };

  const startRecording = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert('Canvas не найден. Попробуйте обновить страницу.');
      return;
    }

    // Проверяем поддержку WebCodecs API
    const hasWebCodecs = typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';
    
    if (!hasWebCodecs) {
      // Fallback на MediaRecorder
      await startRecordingWithMediaRecorder(canvas);
      return;
    }

    // Перезапускаем анимацию с начала
    restart();

    try {
      // Проверяем, что codec поддерживается
      const support = await VideoEncoder.isConfigSupported({
        codec: 'vp09.00.10.08',
        width: canvas.width,
        height: canvas.height,
        bitrate: 8_000_000,
        framerate: 60
      });

      if (!support.supported) {
        console.warn('VP9 codec не поддерживается, переключаемся на MediaRecorder');
        await startRecordingWithMediaRecorder(canvas);
        return;
      }

      // Создаём target для webm-muxer
      const target = new ArrayBufferTarget();
      
      // Создаём muxer
      const muxer = new Muxer({
        target,
        video: {
          codec: 'V_VP9',
          width: canvas.width,
          height: canvas.height
        },
        firstTimestampBehavior: 'offset'
      });

      // Создаём VideoEncoder
      const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => {
          console.error('Ошибка кодирования:', e);
          alert('Ошибка кодирования видео: ' + (e as Error).message);
          setIsRecording(false);
          isRecordingRef.current = false;
        }
      });

      // Настраиваем encoder
      encoder.configure({
        codec: 'vp09.00.10.08',
        width: canvas.width,
        height: canvas.height,
        bitrate: 8_000_000, // 8 Mbps
        framerate: 60
      });

      setIsRecording(true);
      isRecordingRef.current = true;

      const startTime = performance.now();
      const frameDuration = 1000 / 60; // 60 FPS

      // Функция захвата кадров
      const captureFrame = () => {
        if (!isRecordingRef.current) return;

        const currentTime = performance.now();
        const elapsed = (currentTime - startTimeRef.current - totalPausedRef.current) / 1000;
        const progress = Math.min(elapsed / TOTAL_DURATION, 1);
        setRecordingProgress(progress);

        // Захватываем кадр с canvas
        const frame = new VideoFrame(canvas, {
          timestamp: (currentTime - startTime) * 1000 // микросекунды
        });

        // Кодируем кадр
        encoder.encode(frame, { keyFrame: Math.floor(elapsed * 60) % 60 === 0 });
        frame.close();

        if (progress >= 1) {
          // Завершаем запись
          encoder.flush();
          encoder.close();
          muxer.finalize();

          // Создаём blob и скачиваем
          const buffer = target.buffer;
          const blob = new Blob([buffer], { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `transformer-animation-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          // Сохраняем URL для возможности открытия видео
          setRecordedVideoUrl(url);

          setIsRecording(false);
          isRecordingRef.current = false;
          setRecordingProgress(0);
          return;
        }

        // Запланируем следующий кадр
        const nextFrameTime = startTime + (elapsed * 1000) + frameDuration;
        const delay = nextFrameTime - performance.now();
        setTimeout(captureFrame, Math.max(0, delay));
      };

      // Начинаем захват
      captureFrame();
    } catch (error) {
      console.error('Ошибка при запуске записи через WebCodecs:', error);
      console.log('Переключаемся на fallback (MediaRecorder)...');
      
      // Переключаемся на fallback
      try {
        await startRecordingWithMediaRecorder(canvas);
      } catch (fallbackError) {
        console.error('Fallback тоже не сработал:', fallbackError);
        alert('Не удалось записать видео.\nВаш браузер не поддерживает необходимые API.\nПопробуйте Chrome 94+ или Edge 94+.');
        setIsRecording(false);
        isRecordingRef.current = false;
      }
    }
  };

  const stopRecording = () => {
    // Останавливаем запись (завершится на следующем кадре)
    isRecordingRef.current = false;
  };

  const openRecordedVideo = () => {
    if (recordedVideoUrl) {
      window.open(recordedVideoUrl, '_blank');
    }
  };

  const clearRecordedVideo = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0e27] p-4 select-none">
      <div className="text-center mb-3">
        <h1 className="text-xl md:text-3xl font-bold text-white mb-1 tracking-tight">
          🔥 Как работает трансформатор
        </h1>
        <p className="text-xs md:text-sm text-gray-400">Вирусная анимация • 60 секунд • Готово для TikTok/Reels</p>
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
        <button
          onClick={toggleVoice}
          disabled={isRecording}
          className={`px-5 py-2 rounded-lg transition-all text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isVoiceEnabled
              ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30'
              : 'bg-gray-600/20 border border-gray-500/40 text-gray-300 hover:bg-gray-600/30'
          }`}
        >
          {isVoiceEnabled ? '🔊 Озвучка ВКЛ' : '🔇 Озвучка ВЫКЛ'}
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

      {recordedVideoUrl && !isRecording && (
        <div className="mt-4 w-full max-w-[380px] p-4 bg-gradient-to-br from-green-900/20 to-cyan-900/20 border border-green-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-400 text-lg">✅</span>
            <span className="text-green-300 text-sm font-medium">Видео записано!</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openRecordedVideo}
              className="flex-1 px-4 py-2 bg-cyan-600/20 border border-cyan-500/40 rounded-lg text-cyan-300 hover:bg-cyan-600/30 transition-all text-sm font-medium cursor-pointer"
            >
              🎬 Открыть видео
            </button>
            <button
              onClick={clearRecordedVideo}
              className="px-4 py-2 bg-red-600/20 border border-red-500/40 rounded-lg text-red-300 hover:bg-red-600/30 transition-all text-sm font-medium cursor-pointer"
            >
              🗑️ Удалить
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Видео откроется в новой вкладке браузера
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

      <div className="mt-4 text-center text-[10px] text-gray-600 max-w-md space-y-1">
        <p>🎬 Визуализация в стиле 3Blue1Brown • Canvas 2D • 60 FPS</p>
        <p className="text-gray-500">💡 Совет: Включите озвучку и запишите видео для TikTok/Reels</p>
        <p className="text-gray-500">🔥 Хэштеги: #физика #наука #трансформатор #образование #wow</p>
      </div>

      {/* Инструкция по сохранению */}
      <div className="mt-6 max-w-2xl bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 text-left">
        <h3 className="text-sm font-bold text-white mb-2">📥 Как сохранить видео с озвучкой:</h3>
        <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
          <li>Включите озвучку кнопкой "🔊 Озвучка ВКЛ"</li>
          <li>Нажмите "⏺ Записать видео" — начнётся запись 60 секунд</li>
          <li>Дождитесь окончания — файл WebM скачается автоматически</li>
          <li>Конвертируйте WebM в MP4 онлайн: <span className="text-cyan-400">cloudconvert.com</span></li>
          <li>Загрузите MP4 на GitHub: создайте репозиторий → "Add file" → "Upload files"</li>
        </ol>
        <p className="text-xs text-gray-500 mt-2">💡 Альтернатива: используйте OBS Studio для записи экрана с системным звуком</p>
      </div>
    </div>
  );
}

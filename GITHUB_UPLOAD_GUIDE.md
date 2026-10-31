# 📤 Инструкция по сохранению видео на GitHub

## 🎯 Где будет сохранено видео

После загрузки на GitHub видео будет доступно по следующим адресам:

### Основной репозиторий:
```
https://github.com/YOUR-USERNAME/YOUR-REPO/raw/main/transformer-video.mp4
```

### GitHub Releases (рекомендуется для видео):
```
https://github.com/YOUR-USERNAME/YOUR-REPO/releases/download/v1.0.0/transformer-video.mp4
```

### GitHub Pages (если включен):
```
https://YOUR-USERNAME.github.io/YOUR-REPO/videos/transformer-video.mp4
```

---

## 📋 Пошаговая инструкция

### Шаг 1: Запись видео с озвучкой

1. Откройте анимацию в браузере (Chrome/Edge рекомендуется)
2. Включите озвучку кнопкой **"🔊 Озвучка ВКЛ"**
3. Убедитесь, что системная громкость включена
4. Нажмите **"⏺ Записать видео"**
5. Дождитесь окончания 60-секундной записи
6. Файл `transformer-animation-{timestamp}.webm` скачается автоматически

### Шаг 2: Конвертация WebM в MP4

**Онлайн (просто):**
- Откройте https://cloudconvert.com/webm-to-mp4
- Загрузите WebM файл
- Скачайте MP4

**Локально (быстрее):**
```bash
# Установите FFmpeg (если не установлен)
# macOS: brew install ffmpeg
# Windows: https://ffmpeg.org/download.html
# Linux: sudo apt install ffmpeg

# Конвертация
ffmpeg -i transformer-animation-*.webm -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k transformer-video.mp4
```

### Шаг 3: Создание репозитория на GitHub

1. Перейдите на https://github.com/new
2. Заполните:
   - **Repository name**: `transformer-animation` (или любое другое)
   - **Description**: `Вирусная анимация о работе трансформатора с озвучкой`
   - **Public** (для публичного доступа)
   - ✅ **Add a README file**
3. Нажмите **"Create repository"**

### Шаг 4: Загрузка видео на GitHub

#### Вариант A: Через веб-интерфейс (просто)

1. Откройте ваш репозиторий
2. Нажмите **"Add file"** → **"Upload files"**
3. Перетащите MP4 файл в область загрузки
4. Внизу страницы в поле "Commit changes":
   - Заголовок: `Добавлено видео с озвучкой`
   - Описание: `60-секундная анимация о работе трансформатора`
5. Нажмите **"Commit changes"**

#### Вариант B: Через Git CLI (профессионально)

```bash
# Клонируйте репозиторий
git clone https://github.com/YOUR-USERNAME/transformer-animation.git
cd transformer-animation

# Создайте папку для видео
mkdir videos
mv ~/Downloads/transformer-animation-*.webm videos/

# Конвертируйте в MP4 (если нужно)
ffmpeg -i videos/transformer-animation-*.webm -c:v libx264 -preset slow -crf 18 videos/transformer-video.mp4

# Добавьте файлы
git add videos/transformer-video.mp4
git commit -m "Добавлено видео с озвучкой"
git push origin main
```

#### Вариант C: Через GitHub Releases (для больших файлов)

1. Откройте ваш репозиторий
2. Справа найдите **"Releases"** → **"Draft a new release"**
3. Заполните:
   - **Tag**: `v1.0.0` (выберите "Create new tag")
   - **Release title**: `Видео с озвучкой - v1.0`
   - **Description**: `60-секундная анимация о работе трансформатора с русской озвучкой`
4. В секции **"Attach binaries"** перетащите MP4 файл
5. Нажмите **"Publish release"**

---

## 🔗 Прямые ссылки на видео

После загрузки видео будет доступно по следующим ссылкам:

### Через основной репозиторий:
```
https://github.com/YOUR-USERNAME/transformer-animation/raw/main/videos/transformer-video.mp4
```

### Через GitHub Releases (рекомендуется):
```
https://github.com/YOUR-USERNAME/transformer-animation/releases/download/v1.0.0/transformer-video.mp4
```

### Через GitHub Pages (если включен):
```
https://YOUR-USERNAME.github.io/transformer-animation/videos/transformer-video.mp4
```

---

## 📱 Публикация в соцсетях

### TikTok
1. Скачайте MP4 с GitHub
2. Откройте TikTok → "+" → "Загрузить"
3. Выберите видео
4. Добавьте трендовую музыку
5. Хэштеги: `#физика #наука #трансформатор #образование #wow #learnontiktok`
6. Опубликуйте

### Instagram Reels
1. Скачайте MP4 с GitHub
2. Откройте Instagram → "+" → "Reels"
3. Загрузите видео
4. Добавьте популярный звук
5. Хэштеги: `#физика #наука #образование #reels #учеба #интересно`
6. Опубликуйте

### YouTube Shorts
1. Откройте YouTube Studio
2. Нажмите "Создать" → "Загрузить видео"
3. Загрузите MP4
4. Заполните:
   - Название: `Как работает трансформатор за 60 секунд #shorts`
   - Описание: `Узнайте секрет трансформатора! 🔥`
   - Теги: `физика, наука, трансформатор, образование, shorts`
5. Опубликуйте

---

## 💡 Советы для вирусности

### Оптимальное время публикации:
- **TikTok**: 19:00-22:00 (будни), 12:00-15:00 (выходные)
- **Instagram**: 11:00-13:00, 19:00-21:00
- **YouTube**: 14:00-16:00 (будни)

### Хэштеги для максимального охвата:
```
#физика #наука #трансформатор #образование #wow #learnontiktok 
#интересно #факты #наука #учеба #студент #школьник #физикапростыми
```

### Описание для соцсетей:
```
🔥 99% людей не знают, как это работает!

Трансформатор — устройство, которое управляет всей энергией планеты. 
Без него не работал бы твой телефон, Wi-Fi и даже этот пост!

Подписывайся, чтобы узнать больше крутой физики! ⚡

#физика #наука #трансформатор #образование
```

---

## 🛠️ Решение проблем

### Видео не воспроизводится на GitHub
- Убедитесь, что файл в формате MP4 (не WebM)
- Проверьте размер файла (GitHub ограничивает файлы >100MB)
- Используйте GitHub Releases для больших файлов

### Озвучка не работает
- Проверьте, что браузер поддерживает Web Speech API (Chrome/Edge)
- Убедитесь, что системная громкость включена
- Попробуйте другой браузер

### Качество видео низкое
- Используйте FFmpeg для конвертации с высоким битрейтом:
  ```bash
  ffmpeg -i input.webm -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k output.mp4
  ```
- Или используйте OBS Studio для записи экрана

---

## 📊 Статистика проекта

- **Размер видео**: ~15-20 MB (60 секунд, 1080p, 60 FPS)
- **Разрешение**: 1080x1920 (9:16)
- **Формат**: MP4 (H.264 + AAC)
- **Озвучка**: Русский язык (Web Speech API)

---

**Готово! Теперь ваше видео доступно на GitHub и готово к публикации в соцсетях! 🚀**

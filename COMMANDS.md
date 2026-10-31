# 📋 КОМАНДЫ ДЛЯ КОПИРОВАНИЯ

## 🔧 СОЗДАНИЕ РЕПОЗИТОРИЯ "electro"

### Способ 1: Через GitHub CLI (быстро)

```bash
# 1. Установите GitHub CLI (если не установлен)
# macOS:
brew install gh

# Windows:
winget install --id GitHub.cli

# Linux (Ubuntu/Debian):
sudo apt install gh

# 2. Авторизуйтесь
gh auth login

# 3. Создайте репозиторий и загрузите файлы
gh repo create electro --public --clone --description "🔥 Вирусная анимация о работе трансформатора с озвучкой"
cd electro
# Скопируйте все файлы проекта в папку electro
git add .
git commit -m "🎬 Initial commit"
git push
```

### Способ 2: Через веб-интерфейс (просто)

1. Откройте: https://github.com/new
2. Заполните:
   - Repository name: `electro`
   - Description: `🔥 Вирусная анимация о работе трансформатора с озвучкой`
   - ✅ Public
   - ✅ Add a README file
3. Нажмите **Create repository**
4. На следующей странице нажмите **uploading an existing file**
5. Перетащите все файлы проекта
6. Нажмите **Commit changes**

---

## 🌐 ВКЛЮЧЕНИЕ GITHUB PAGES

```bash
# Откройте в браузере:
https://github.com/ВАШ-USERNAME/electro/settings/pages

# Выберите:
# Source: Deploy from a branch
# Branch: main
# Folder: /dist
# Нажмите Save
```

Через 2-3 минуты сайт будет доступен:
```
https://ВАШ-USERNAME.github.io/electro/
```

---

## 📹 ЗАПИСЬ И ЗАГРУЗКА ВИДЕО

### Запись видео:
1. Откройте сайт в браузере
2. Нажмите **🔊 Озвучка ВКЛ**
3. Нажмите **⏺ Записать видео**
4. Дождитесь окончания (60 сек)
5. Файл WebM скачается

### Конвертация в MP4:

```bash
# Онлайн: https://cloudconvert.com/webm-to-mp4

# Или через FFmpeg:
# Установка FFmpeg:
# macOS:
brew install ffmpeg

# Windows:
winget install ffmpeg

# Linux:
sudo apt install ffmpeg

# Конвертация:
ffmpeg -i transformer-animation-*.webm -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k transformer-video.mp4
```

### Загрузка видео на GitHub:

```bash
# Через веб-интерфейс:
# 1. Откройте: https://github.com/ВАШ-USERNAME/electro
# 2. Нажмите "Add file" → "Upload files"
# 3. Перетащите MP4
# 4. Нажмите "Commit changes"

# Или через Git CLI:
git add transformer-video.mp4
git commit -m "📹 Добавлено видео с озвучкой"
git push
```

---

## 🎬 СОЗДАНИЕ RELEASE С ВИДЕО

```bash
# Через GitHub CLI:
gh release create v1.0.0 transformer-video.mp4 \
  --title "🎬 Видео с озвучкой - v1.0" \
  --notes "60-секундная анимация о работе трансформатора с русской озвучкой"

# Или через веб-интерфейс:
# 1. Откройте: https://github.com/ВАШ-USERNAME/electro/releases/new
# 2. Tag: v1.0.0
# 3. Title: Видео с озвучкой
# 4. Перетащите MP4
# 5. Нажмите "Publish release"
```

---

## 🔗 ССЫЛКИ НА ВИДЕО

После загрузки видео будет доступно:

### Через основной репозиторий:
```
https://github.com/ВАШ-USERNAME/electro/raw/main/transformer-video.mp4
```

### Через GitHub Releases:
```
https://github.com/ВАШ-USERNAME/electro/releases/download/v1.0.0/transformer-video.mp4
```

### GitHub Pages (сайт):
```
https://ВАШ-USERNAME.github.io/electro/
```

---

## 📱 ПУБЛИКАЦИЯ В СОЦСЕТЯХ

### Скачивание видео:
```bash
# Через curl:
curl -O https://github.com/ВАШ-USERNAME/electro/raw/main/transformer-video.mp4

# Или через wget:
wget https://github.com/ВАШ-USERNAME/electro/raw/main/transformer-video.mp4
```

### Хэштеги для копирования:
```
#физика #наука #трансформатор #образование #wow #learnontiktok #интересно #факты #учеба #студент #школьник #физикапростыми #electro #электричество
```

### Описание для соцсетей:
```
🔥 99% людей не знают, как это работает!

Трансформатор — устройство, которое управляет всей энергией планеты. 
Без него не работал бы твой телефон, Wi-Fi и даже этот пост!

Подписывайся, чтобы узнать больше крутой физики! ⚡

Исходный код: https://github.com/ВАШ-USERNAME/electro

#физика #наука #трансформатор #образование
```

---

## 🛠️ ПОЛНАЯ АВТОМАТИЗАЦИЯ (один скрипт)

### macOS/Linux:
```bash
# Скачайте и запустите скрипт
chmod +x upload-to-github.sh
./upload-to-github.sh
```

### Windows (PowerShell):
```powershell
# Запустите скрипт
.\upload-to-github.ps1
```

---

## ✅ ПОЛНЫЙ ЧЕКЛИСТ

```bash
# 1. Создание репозитория
gh repo create electro --public --description "🔥 Вирусная анимация о работе трансформатора"

# 2. Загрузка файлов
git init
git add .
git commit -m "🎬 Initial commit"
git remote add origin https://github.com/ВАШ-USERNAME/electro.git
git push -u origin main

# 3. Включение GitHub Pages
# Откройте: https://github.com/ВАШ-USERNAME/electro/settings/pages
# Source: main / /dist

# 4. Запись видео
# Откройте сайт → Включите озвучку → Запишите видео

# 5. Конвертация
ffmpeg -i transformer-animation-*.webm -c:v libx264 -preset slow -crf 18 transformer-video.mp4

# 6. Загрузка видео
git add transformer-video.mp4
git commit -m "📹 Добавлено видео с озвучкой"
git push

# 7. Создание Release
gh release create v1.0.0 transformer-video.mp4 --title "Видео с озвучкой"

# 8. Публикация в соцсетях
# Скачайте видео и загрузите в TikTok/Instagram/YouTube
```

---

## 🎯 ИТОГОВЫЕ ССЫЛКИ

После выполнения всех шагов:

- **Репозиторий:** https://github.com/ВАШ-USERNAME/electro
- **Сайт:** https://ВАШ-USERNAME.github.io/electro/
- **Видео:** https://github.com/ВАШ-USERNAME/electro/raw/main/transformer-video.mp4
- **Release:** https://github.com/ВАШ-USERNAME/electro/releases/tag/v1.0.0

---

**Готово! Замените ВАШ-USERNAME на ваше имя пользователя GitHub!** 🚀

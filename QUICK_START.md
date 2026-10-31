# 🚀 БЫСТРАЯ ЗАГРУЗКА В GITHUB (репозиторий: electro)

## 📍 ГДЕ БУДЕТ СОХРАНЕНО ВИДЕО

После загрузки на GitHub видео будет доступно по адресам:

### Основной репозиторий:
```
https://github.com/ВАШ-USERNAME/electro/raw/main/transformer-video.mp4
```

### GitHub Releases (рекомендуется):
```
https://github.com/ВАШ-USERNAME/electro/releases/download/v1.0.0/transformer-video.mp4
```

### GitHub Pages:
```
https://ВАШ-USERNAME.github.io/electro/
```

---

## ⚡ БЫСТРЫЙ СПОСОБ (2 минуты)

### Шаг 1: Создайте репозиторий
1. Откройте: https://github.com/new
2. Repository name: **electro**
3. Description: **Вирусная анимация о работе трансформатора**
4. ✅ Public
5. ✅ Add a README
6. Нажмите **Create repository**

### Шаг 2: Загрузите файлы
1. Откройте ваш репозиторий: `https://github.com/ВАШ-USERNAME/electro`
2. Нажмите **Add file** → **Upload files**
3. Перетащите ВСЕ файлы проекта
4. Нажмите **Commit changes**

### Шаг 3: Включите GitHub Pages
1. Перейдите в **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / folder: **/dist**
4. Нажмите **Save**
5. Через 1-2 минуты сайт будет доступен по адресу:
   ```
   https://ВАШ-USERNAME.github.io/electro/
   ```

### Шаг 4: Запишите видео
1. Откройте сайт: `https://ВАШ-USERNAME.github.io/electro/`
2. Включите озвучку: **🔊 Озвучка ВКЛ**
3. Нажмите: **⏺ Записать видео**
4. Дождитесь окончания (60 секунд)
5. Файл WebM скачается автоматически

### Шаг 5: Конвертируйте в MP4
**Онлайн (просто):**
- Откройте: https://cloudconvert.com/webm-to-mp4
- Загрузите WebM файл
- Скачайте MP4

**Или через FFmpeg:**
```bash
ffmpeg -i transformer-animation-*.webm -c:v libx264 -preset slow -crf 18 transformer-video.mp4
```

### Шаг 6: Загрузите видео на GitHub
1. Откройте ваш репозиторий: `https://github.com/ВАШ-USERNAME/electro`
2. Нажмите **Add file** → **Upload files**
3. Перетащите MP4 файл
4. Commit message: **Добавлено видео с озвучкой**
5. Нажмите **Commit changes**

### Шаг 7: Готово! 🎉
Видео доступно по адресу:
```
https://github.com/ВАШ-USERNAME/electro/raw/main/transformer-video.mp4
```

---

## 🎯 АЛЬТЕРНАТИВНЫЙ СПОСОБ: Через GitHub CLI

### Установка GitHub CLI:
**macOS:**
```bash
brew install gh
```

**Windows:**
```bash
winget install --id GitHub.cli
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install gh

# Fedora
sudo dnf install gh

# Arch
sudo pacman -S github-cli
```

### Авторизация:
```bash
gh auth login
```

### Создание репозитория и загрузка:
```bash
# Создайте репозиторий
gh repo create electro --public --description "Вирусная анимация о работе трансформатора"

# Инициализируйте git
git init
git branch -M main

# Добавьте файлы
git add .
git commit -m "🎬 Initial commit: анимация трансформатора с озвучкой"

# Загрузите на GitHub
git remote add origin https://github.com/ВАШ-USERNAME/electro.git
git push -u origin main
```

### Или используйте автоматический скрипт:
**macOS/Linux:**
```bash
chmod +x upload-to-github.sh
./upload-to-github.sh
```

**Windows (PowerShell):**
```powershell
.\upload-to-github.ps1
```

---

## 📹 ЗАГРУЗКА ВИДЕО ЧЕРЕЗ GITHUB RELEASES

### Через веб-интерфейс:
1. Откройте: `https://github.com/ВАШ-USERNAME/electro/releases/new`
2. Tag version: **v1.0.0**
3. Release title: **Видео с озвучкой**
4. Перетащите MP4 файл
5. Нажмите **Publish release**

### Через GitHub CLI:
```bash
gh release create v1.0.0 transformer-video.mp4 \
  --title "Видео с озвучкой" \
  --notes "60-секундная анимация о работе трансформатора с русской озвучкой"
```

### Ссылка на видео:
```
https://github.com/ВАШ-USERNAME/electro/releases/download/v1.0.0/transformer-video.mp4
```

---

## 📱 ПУБЛИКАЦИЯ В СОЦСЕТЯХ

### TikTok:
1. Скачайте MP4: `https://github.com/ВАШ-USERNAME/electro/raw/main/transformer-video.mp4`
2. Загрузите в TikTok
3. Добавьте трендовую музыку
4. Хэштеги: `#физика #наука #трансформатор #образование #wow`

### Instagram Reels:
1. Скачайте MP4
2. Загрузите в Instagram Reels
3. Добавьте популярный звук
4. Хэштеги: `#физика #наука #образование #reels`

### YouTube Shorts:
1. Скачайте MP4
2. Загрузите на YouTube
3. Название: `Как работает трансформатор за 60 секунд #shorts`
4. Теги: `физика, наука, трансформатор, образование`

---

## ✅ ЧЕКЛИСТ

- [ ] Создан репозиторий **electro**
- [ ] Загружены файлы проекта
- [ ] Включен GitHub Pages
- [ ] Сайт доступен по адресу `https://ВАШ-USERNAME.github.io/electro/`
- [ ] Включена озвучка
- [ ] Записано видео (60 секунд)
- [ ] Конвертировано в MP4
- [ ] Видео загружено на GitHub
- [ ] Видео доступно по прямой ссылке
- [ ] Опубликовано в соцсетях

---

## 🆘 ПРОБЛЕМЫ И РЕШЕНИЯ

### Видео не загружается на GitHub
- Проверьте размер файла (максимум 100MB для обычного репозитория)
- Используйте GitHub Releases для больших файлов
- Конвертируйте с меньшим битрейтом: `ffmpeg -i input.webm -crf 28 output.mp4`

### GitHub Pages не работает
- Подождите 2-3 минуты после включения
- Проверьте, что выбрана ветка **main** и папка **/dist**
- Убедитесь, что проект собран: `npm run build`

### Озвучка не работает
- Используйте Chrome или Edge
- Проверьте системную громкость
- Разрешите доступ к аудио в настройках браузера

---

## 📞 ПОДДЕРЖКА

Если возникли вопросы:
1. Проверьте README.md
2. Проверьте GITHUB_UPLOAD_GUIDE.md
3. Создайте issue в репозитории: `https://github.com/ВАШ-USERNAME/electro/issues/new`

---

**Удачи! Ваше видео будет сохранено в репозитории electro! 🚀**

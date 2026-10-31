# 🎯 ИНСТРУКЦИЯ: Как загрузить проект в репозиторий "electro"

## ⚡ САМЫЙ БЫСТРЫЙ СПОСОБ (5 минут)

### 1️⃣ Создайте репозиторий
```
https://github.com/new
```
- Repository name: **electro**
- ✅ Public
- ✅ Add a README
- Нажмите **Create repository**

### 2️⃣ Загрузите файлы
```
https://github.com/ВАШ-USERNAME/electro
```
- Нажмите **Add file** → **Upload files**
- Перетащите ВСЕ файлы из этой папки
- Нажмите **Commit changes**

### 3️⃣ Включите GitHub Pages
```
https://github.com/ВАШ-USERNAME/electro/settings/pages
```
- Source: **Deploy from a branch**
- Branch: **main** / Folder: **/dist**
- Нажмите **Save**

### 4️⃣ Откройте сайт
Через 2-3 минуты:
```
https://ВАШ-USERNAME.github.io/electro/
```

### 5️⃣ Запишите видео
1. Откройте сайт
2. Нажмите **🔊 Озвучка ВКЛ**
3. Нажмите **⏺ Записать видео**
4. Дождитесь окончания (60 сек)
5. Файл WebM скачается

### 6️⃣ Конвертируйте в MP4
```
https://cloudconvert.com/webm-to-mp4
```

### 7️⃣ Загрузите видео на GitHub
```
https://github.com/ВАШ-USERNAME/electro
```
- Нажмите **Add file** → **Upload files**
- Перетащите MP4
- Нажмите **Commit changes**

### 8️⃣ Готово! 🎉
Видео доступно:
```
https://github.com/ВАШ-USERNAME/electro/raw/main/transformer-video.mp4
```

---

## 📁 СТРУКТУРА ПРОЕКТА

```
electro/
├── 📄 README.md                          # Основная документация
├── 📄 QUICK_START.md                     # Быстрый старт
├── 📄 COMMANDS.md                        # Команды для копирования
├── 📄 FINAL_INSTRUCTIONS.md              # Финальная инструкция
├── 📄 GITHUB_UPLOAD_GUIDE.md             # Подробный гайд
├── 📄 PROJECT_SUMMARY.md                 # Резюме проекта
├── 📄 .gitignore                         # Игнорируемые файлы
├── 📄 upload-to-github.sh                # Скрипт для macOS/Linux
├── 📄 upload-to-github.ps1               # Скрипт для Windows
├── 📄 index.html                         # HTML точка входа
├── 📄 package.json                       # Зависимости
├── 📄 tsconfig.json                      # TypeScript конфиг
├── 📄 vite.config.js                     # Vite конфиг
└── 📁 src/
    ├── 📄 App.tsx                        # Главный компонент
    ├── 📄 index.css                      # Стили
    ├── 📄 main.tsx                       # Точка входа
    └── 📁 components/
        └── 📄 TransformerAnimation.tsx   # Анимация трансформатора
```

---

## 🎬 ЧТО ВКЛЮЧЕНО

✅ **Анимация**: 60-секундная вирусная анимация о трансформаторе  
✅ **Озвучка**: Русская голосовая озвучка через Web Speech API  
✅ **Субтитры**: Синхронизированные субтитры для каждой сцены  
✅ **Запись**: Функция записи видео в WebM (60 FPS, 8 Mbps)  
✅ **Документация**: 6 файлов с инструкциями  
✅ **Скрипты**: Автоматическая загрузка на GitHub (bash/PowerShell)  

---

## 📍 ГДЕ БУДЕТ СОХРАНЕНО ВИДЕО

### После загрузки на GitHub:

**Репозиторий:**
```
https://github.com/ВАШ-USERNAME/electro
```

**Сайт (GitHub Pages):**
```
https://ВАШ-USERNAME.github.io/electro/
```

**Видео:**
```
https://github.com/ВАШ-USERNAME/electro/raw/main/transformer-video.mp4
```

**Release:**
```
https://github.com/ВАШ-USERNAME/electro/releases/download/v1.0.0/transformer-video.mp4
```

---

## 🚀 АЛЬТЕРНАТИВНЫЕ СПОСОБЫ

### Через GitHub CLI (автоматически):

**macOS/Linux:**
```bash
chmod +x upload-to-github.sh
./upload-to-github.sh
```

**Windows:**
```powershell
.\upload-to-github.ps1
```

### Через Git CLI (вручную):
```bash
# Создайте репозиторий на GitHub, затем:
git init
git add .
git commit -m "🎬 Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ-USERNAME/electro.git
git push -u origin main
```

---

## 📱 ПУБЛИКАЦИЯ В СОЦСЕТЯХ

### TikTok / Instagram Reels / YouTube Shorts:

1. Скачайте видео:
   ```
   https://github.com/ВАШ-USERNAME/electro/raw/main/transformer-video.mp4
   ```

2. Загрузите в соцсеть

3. Добавьте трендовую музыку

4. Используйте хэштеги:
   ```
   #физика #наука #трансформатор #образование #wow #learnontiktok
   ```

---

## ❓ ЧАСТЫЕ ВОПРОСЫ

### ❓ Видео не загружается на GitHub
**Ответ:** Проверьте размер файла (максимум 100MB). Используйте GitHub Releases для больших файлов.

### ❓ GitHub Pages не работает
**Ответ:** Подождите 2-3 минуты. Убедитесь, что выбрана ветка **main** и папка **/dist**.

### ❓ Озвучка не работает
**Ответ:** Используйте Chrome или Edge. Проверьте системную громкость.

### ❓ Как найти видео на GitHub?
**Ответ:** Откройте репозиторий → найдите файл `transformer-video.mp4` → нажмите на него → нажмите **Download**.

---

## ✅ ЧЕКЛИСТ

- [ ] Создан репозиторий **electro**
- [ ] Загружены все файлы проекта
- [ ] Включен GitHub Pages
- [ ] Сайт доступен по адресу
- [ ] Включена озвучка
- [ ] Записано видео (60 сек)
- [ ] Конвертировано в MP4
- [ ] Видео загружено на GitHub
- [ ] Видео доступно по прямой ссылке
- [ ] Опубликовано в соцсетях

---

## 📞 ПОДДЕРЖКА

Если возникли вопросы:
1. Прочитайте **README.md**
2. Проверьте **QUICK_START.md**
3. Изучите **COMMANDS.md**
4. Создайте issue: `https://github.com/ВАШ-USERNAME/electro/issues/new`

---

## 🎯 ИТОГ

**Репозиторий:** `electro`  
**Сайт:** `https://ВАШ-USERNAME.github.io/electro/`  
**Видео:** `https://github.com/ВАШ-USERNAME/electro/raw/main/transformer-video.mp4`

**Замените ВАШ-USERNAME на ваше имя пользователя GitHub!**

---

**Удачи! 🚀🔥**

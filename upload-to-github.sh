#!/bin/bash

# Скрипт автоматической загрузки проекта в GitHub репозиторий "electro"
# Использование: chmod +x upload-to-github.sh && ./upload-to-github.sh

set -e

REPO_NAME="electro"
GITHUB_USERNAME=$(git config user.name 2>/dev/null || echo "YOUR-USERNAME")

echo "🚀 Загрузка проекта в GitHub репозиторий: $REPO_NAME"
echo "👤 GitHub username: $GITHUB_USERNAME"
echo ""

# Проверка наличия GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI не установлен!"
    echo ""
    echo "📥 Установите GitHub CLI:"
    echo "  macOS: brew install gh"
    echo "  Windows: winget install --id GitHub.cli"
    echo "  Linux: https://cli.github.com/"
    echo ""
    echo "Или используйте ручную загрузку через веб-интерфейс GitHub"
    exit 1
fi

# Проверка авторизации
if ! gh auth status &> /dev/null; then
    echo "❌ Не выполнена авторизация в GitHub CLI"
    echo ""
    echo "🔐 Выполните авторизацию:"
    echo "  gh auth login"
    exit 1
fi

echo "✅ GitHub CLI установлен и авторизован"
echo ""

# Создание репозитория
echo "📦 Создание репозитория '$REPO_NAME'..."
if gh repo view "$GITHUB_USERNAME/$REPO_NAME" &> /dev/null; then
    echo "⚠️  Репозиторий уже существует"
    read -p "Хотите продолжить и добавить файлы? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    gh repo create "$REPO_NAME" --public --description "🔥 Вирусная анимация о работе трансформатора с голосовой озвучкой"
    echo "✅ Репозиторий создан!"
fi

echo ""

# Инициализация git
echo "🔧 Инициализация git..."
if [ ! -d .git ]; then
    git init
    git branch -M main
fi

# Добавление файлов
echo "📁 Добавление файлов..."
git add .
git commit -m "🎬 Initial commit: анимация трансформатора с озвучкой" || echo "Нет изменений для коммита"

# Настройка remote
echo "🔗 Настройка remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Push
echo "📤 Загрузка на GitHub..."
git push -u origin main --force

echo ""
echo "✅ Готово! Проект загружен в GitHub!"
echo ""
echo "📍 Ваш репозиторий:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "🌐 GitHub Pages (если включен):"
echo "   https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo ""
echo "📹 После записи видео загрузите его через:"
echo "   1. Веб-интерфейс GitHub"
echo "   2. Или создайте Release:"
echo "      gh release create v1.0.0 transformer-video.mp4 --title 'Видео с озвучкой' --notes '60-секундная анимация'"
echo ""
echo "🎯 Следующие шаги:"
echo "   1. Откройте https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "   2. Включите GitHub Pages в Settings → Pages"
echo "   3. Запишите видео кнопкой '⏺ Записать видео'"
echo "   4. Загрузите MP4 в репозиторий"
echo ""

# PowerShell скрипт для загрузки проекта в GitHub репозиторий "electro"
# Использование: .\upload-to-github.ps1

$ErrorActionPreference = "Stop"

$RepoName = "electro"
$GitHubUsername = (git config user.name 2>$null)
if (-not $GitHubUsername) { $GitHubUsername = "YOUR-USERNAME" }

Write-Host "🚀 Загрузка проекта в GitHub репозиторий: $RepoName" -ForegroundColor Cyan
Write-Host "👤 GitHub username: $GitHubUsername" -ForegroundColor Cyan
Write-Host ""

# Проверка GitHub CLI
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghInstalled) {
    Write-Host "❌ GitHub CLI не установлен!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Установите GitHub CLI:" -ForegroundColor Yellow
    Write-Host "  winget install --id GitHub.cli" -ForegroundColor White
    Write-Host "  Или скачайте: https://cli.github.com/" -ForegroundColor White
    Write-Host ""
    Write-Host "Или используйте ручную загрузку через веб-интерфейс GitHub" -ForegroundColor Yellow
    exit 1
}

# Проверка авторизации
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Не выполнена авторизация в GitHub CLI" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔐 Выполните авторизацию:" -ForegroundColor Yellow
    Write-Host "  gh auth login" -ForegroundColor White
    exit 1
}

Write-Host "✅ GitHub CLI установлен и авторизован" -ForegroundColor Green
Write-Host ""

# Создание репозитория
Write-Host "📦 Создание репозитория '$RepoName'..." -ForegroundColor Cyan
$repoExists = gh repo view "$GitHubUsername/$RepoName" 2>$null
if ($repoExists) {
    Write-Host "⚠️  Репозиторий уже существует" -ForegroundColor Yellow
    $continue = Read-Host "Хотите продолжить и добавить файлы? (y/n)"
    if ($continue -ne "y") { exit 1 }
} else {
    gh repo create $RepoName --public --description "🔥 Вирусная анимация о работе трансформатора с голосовой озвучкой"
    Write-Host "✅ Репозиторий создан!" -ForegroundColor Green
}

Write-Host ""

# Инициализация git
Write-Host "🔧 Инициализация git..." -ForegroundColor Cyan
if (-not (Test-Path .git)) {
    git init
    git branch -M main
}

# Добавление файлов
Write-Host "📁 Добавление файлов..." -ForegroundColor Cyan
git add .
git commit -m "🎬 Initial commit: анимация трансформатора с озвучкой" 2>$null

# Настройка remote
Write-Host "🔗 Настройка remote..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin "https://github.com/$GitHubUsername/$RepoName.git"

# Push
Write-Host "📤 Загрузка на GitHub..." -ForegroundColor Cyan
git push -u origin main --force

Write-Host ""
Write-Host "✅ Готово! Проект загружен в GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Ваш репозиторий:" -ForegroundColor Cyan
Write-Host "   https://github.com/$GitHubUsername/$RepoName" -ForegroundColor White
Write-Host ""
Write-Host "🌐 GitHub Pages (если включен):" -ForegroundColor Cyan
Write-Host "   https://$GitHubUsername.github.io/$RepoName/" -ForegroundColor White
Write-Host ""
Write-Host "📹 После записи видео загрузите его через:" -ForegroundColor Cyan
Write-Host "   1. Веб-интерфейс GitHub" -ForegroundColor White
Write-Host "   2. Или создайте Release:" -ForegroundColor White
Write-Host "      gh release create v1.0.0 transformer-video.mp4 --title 'Видео с озвучкой'" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Следующие шаги:" -ForegroundColor Cyan
Write-Host "   1. Откройте https://github.com/$GitHubUsername/$RepoName" -ForegroundColor White
Write-Host "   2. Включите GitHub Pages в Settings → Pages" -ForegroundColor White
Write-Host "   3. Запишите видео кнопкой '⏺ Записать видео'" -ForegroundColor White
Write-Host "   4. Загрузите MP4 в репозиторий" -ForegroundColor White
Write-Host ""

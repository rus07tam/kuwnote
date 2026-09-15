# Инструкция по сборке и загрузке Kuwnote в GitHub Actions

Для сборки кроссплатформенного приложения **Kuwnote** (`Desktop: Windows, macOS, Linux` и `Android: APK/AAB`) настроены три GitHub Actions пайплайна:

---

## 📂 Файлы рабочих процессов (Workflows)

1. **`.github/workflows/release.yml` — Полный релизный пайплайн**
   - **Триггеры**:
     - Пуш git-тега релиза (например: `git tag v2.0.0 && git push origin v2.0.0`)
     - Пуш в ветку `main`
     - Ручной запуск через вкладку **Actions** (`workflow_dispatch`)
   - **Что делает**:
     - Параллельно собирает **Desktop** на трех ОС (`ubuntu-22.04`, `windows-latest`, `macos-latest`).
     - Собирает **Android APK** на Ubuntu с установкой Android SDK 34, NDK r26b, Java 17 и Rust android-таргетов (`aarch64-linux-android`, `armv7-linux-androideabi`, `x86_64-linux-android`, `i686-linux-android`).
     - Загружает все исполняемые файлы как **Artifacts** сборки.
     - При наличии тега автоматически создает **GitHub Release** и прикрепляет все файлы в релиз.

2. **`.github/workflows/desktop.yml` — Сборка только для Desktop**
   - Сборка на Windows, macOS и Linux.
   - Поддержка форматов: `.exe`, `.msi`, `.dmg`, `.app`, `.deb`, `.AppImage`, `.rpm`.
   - Загрузка в GitHub Actions Artifacts.

3. **`.github/workflows/android.yml` — Сборка только для Android**
   - Сборка пакетов `.apk` (и `.aab` по выбору).
   - Загрузка в GitHub Actions Artifacts.

---

## 🚀 Как запустить сборку и получить файлы

### Вариант 1. Запуск релиза через Git-тег (Рекомендуется)
```bash
git tag v2.0.0
git push origin v2.0.0
```
После пуша тега GitHub Actions соберет все платформы и опубликует релиз на странице **Releases** вашего репозитория с готовыми для скачивания бинарниками:
- **Windows**: `Kuwnote_2.0.0_x64-setup.exe`, `Kuwnote_2.0.0_x64_en-US.msi`
- **macOS**: `Kuwnote_2.0.0_universal.dmg`
- **Linux**: `kuwnote_2.0.0_amd64.deb`, `Kuwnote_2.0.0_amd64.AppImage`
- **Android**: `app-universal-release-unsigned.apk` (или подписанный APK)

### Вариант 2. Ручной запуск из веб-интерфейса GitHub
1. Перейдите во вкладку **Actions** в вашем репозитории на GitHub.
2. В левой колонке выберите воркфлоу:
   - `Build and Release Kuwnote (Desktop & Android)`
   - или `Build Desktop`
   - или `Build Android`
3. Нажмите кнопку **Run workflow**, выберите ветку (`main`) и нажмите зеленую кнопку запуска.
4. После завершения откройте страницу выполненного запуска и в блоке **Artifacts** скачайте нужный zip-архив с исполняемыми файлами.

---

## 🔑 Подпись Android APK (Опционально)
По умолчанию сборка генерирует готовый APK. Если вы хотите автоматически подписывать APK релизным ключом:
1. Создайте keystore:
   ```bash
   keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias kuwnote
   ```
2. Закодируйте его в base64:
   ```bash
   base64 -w 0 release.jks > keystore_base64.txt
   ```
3. В настройках репозитория **Settings -> Secrets and variables -> Actions** добавьте переменные:
   - `ANDROID_KEYSTORE_BASE64`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`

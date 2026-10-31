import { useState, useRef } from 'react';

type Status = 'idle' | 'loading' | 'converting' | 'done' | 'error';

export default function VideoConverter() {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToMp4 = async (file: File) => {
    setStatus('loading');
    setProgress(0);
    setErrorMsg('');
    setOutputUrl(null);
    setFileName(file.name.replace(/\.[^/.]+$/, '') + '.mp4');

    try {
      // Создаём video элемент для декодирования
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;
      
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Не удалось загрузить видео'));
      });

      const width = video.videoWidth;
      const height = video.videoHeight;
      const duration = video.duration;

      if (!width || !height || !duration) {
        throw new Error('Не удалось получить параметры видео');
      }

      // Создаём canvas для покадрового захвата
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Не удалось создать canvas context');

      // Проверяем поддержку VideoEncoder
      if (typeof VideoEncoder === 'undefined') {
        throw new Error('Ваш браузер не поддерживает конвертацию. Используйте Chrome 94+ или Edge 94+.');
      }

      // Проверяем поддержку кодека
      const support = await VideoEncoder.isConfigSupported({
        codec: 'avc1.42001f',
        width,
        height,
        bitrate: 8_000_000,
        framerate: 30
      });

      if (!support.supported) {
        throw new Error('Кодек H.264 не поддерживается в этом браузере');
      }

      setStatus('converting');

      // Создаём MP4 muxer вручную (упрощённая версия)
      // Используем MediaRecorder как fallback, так как он проще
      const stream = canvas.captureStream(30);
      
      let recorder: MediaRecorder;
      const chunks: Blob[] = [];
      
      // Пробуем разные MIME типы
      const mimeTypes = [
        'video/mp4;codecs=avc1.42001f',
        'video/mp4',
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
        throw new Error('Браузер не поддерживает запись видео');
      }

      const isMP4 = selectedMime.includes('mp4');
      const outputName = file.name.replace(/\.[^/.]+$/, '') + (isMP4 ? '.mp4' : '.webm');
      setFileName(outputName);

      recorder = new MediaRecorder(stream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 8_000_000
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const recordingPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: selectedMime }));
        };
      });

      recorder.start(100);

      // Воспроизводим видео и захватываем кадры
      video.currentTime = 0;
      await video.play();

      // Обновляем canvas каждый кадр
      const updateCanvas = () => {
        if (video.ended || video.paused) return;
        ctx.drawImage(video, 0, 0, width, height);
        setProgress(Math.min(video.currentTime / duration, 1));
        requestAnimationFrame(updateCanvas);
      };
      updateCanvas();

      // Ждём окончания видео
      await new Promise<void>((resolve) => {
        video.onended = () => resolve();
        video.onpause = () => {
          if (video.currentTime >= duration - 0.1) resolve();
        };
      });

      // Небольшая задержка для захвата последних кадров
      await new Promise(r => setTimeout(r, 500));
      
      recorder.stop();
      const blob = await recordingPromise;
      
      URL.revokeObjectURL(videoUrl);
      
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setProgress(1);
      setStatus('done');
    } catch (error) {
      console.error('Ошибка конвертации:', error);
      setErrorMsg((error as Error).message);
      setStatus('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      convertToMp4(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.includes('video') || file.name.endsWith('.webm'))) {
      convertToMp4(file);
    }
  };

  const downloadVideo = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setStatus('idle');
    setProgress(0);
    setOutputUrl(null);
    setFileName('');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 p-6 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🎬</span>
        <div>
          <h3 className="text-lg font-bold text-white">Конвертер WebM → MP4</h3>
          <p className="text-xs text-gray-400">Работает прямо в браузере, без установки программ</p>
        </div>
      </div>

      {status === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-purple-500/50 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-500/5 transition-all"
        >
          <div className="text-5xl mb-3">📁</div>
          <p className="text-white font-medium mb-1">Перетащите WebM файл сюда</p>
          <p className="text-gray-400 text-sm">или нажмите для выбора файла</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/webm,.webm"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {(status === 'loading' || status === 'converting') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white">
              {status === 'loading' ? '🔄 Загрузка видео...' : '⚙️ Конвертация...'}
            </span>
            <span className="text-cyan-300 font-mono">{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {status === 'converting' ? 'Подождите, идёт перекодирование...' : 'Подготовка...'}
          </p>
        </div>
      )}

      {status === 'done' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-green-300 font-medium">Конвертация завершена!</p>
              <p className="text-xs text-gray-400">Файл: {fileName}</p>
            </div>
          </div>
          
          {outputUrl && (
            <video
              src={outputUrl}
              controls
              className="w-full rounded-lg border border-gray-700"
              style={{ maxHeight: '400px' }}
            />
          )}
          
          <div className="flex gap-2">
            <button
              onClick={downloadVideo}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-cyan-600 rounded-lg text-white font-medium hover:opacity-90 transition-all cursor-pointer"
            >
              💾 Скачать {fileName.endsWith('.mp4') ? 'MP4' : 'WebM'}
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-all cursor-pointer"
            >
              🔄 Ещё
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            💡 Совет: Если нужен именно MP4, используйте Chrome — он поддерживает запись в MP4 напрямую
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-300 font-medium mb-1">❌ Ошибка конвертации</p>
            <p className="text-xs text-gray-400">{errorMsg}</p>
          </div>
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-all cursor-pointer"
          >
            🔄 Попробовать снова
          </button>
        </div>
      )}
    </div>
  );
}

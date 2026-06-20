import React, { useState, useRef, useEffect } from 'react';
import { Upload, File, FileCode, CheckCircle, AlertTriangle, RefreshCw, Sliders, Download, Trash2, Plus, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { ConversionType, ConverterInfo, ConversionJob } from '../types';
import { convertImage, convertHEIC, mergePDFs, splitPDF, compressPDF, convertPdfToImages, convertPdfToWord, convertImagesToPDF, convertTxtToPdf, convertPdfToTxt, convertJsonToCsv, convertCsvToJson, convertDocxToTxt, convertAudioVideo } from '../utils/converter';
import { Language, TRANSLATIONS } from '../utils/translations';
import CustomSelect, { SelectOption } from './CustomSelect';
import { recordActiveVisit } from '../utils/tracker';

interface ConverterWidgetProps {
  currentConverter: ConverterInfo;
  onProcessedCountChange: (count: number) => void;
  processedCount: number;
  onSelectConverter?: (id: ConversionType) => void;
  lang: Language;
}

export default function ConverterWidget({
  currentConverter,
  onProcessedCountChange,
  processedCount,
  onSelectConverter,
  lang,
}: ConverterWidgetProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [pagesInput, setPagesInput] = useState('1-2');
  const [imgFormat, setImgFormat] = useState<string>('image/jpeg');
  const [quality, setQuality] = useState(80); // 1-100 scale
  const [audioOutputFormat, setAudioOutputFormat] = useState<string>('mp3');
  const [videoOutputFormat, setVideoOutputFormat] = useState<string>('mp4');
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [convertedOutputs, setConvertedOutputs] = useState<{ url: string; name: string }[]>([]);

  const [subConversionMode, setSubConversionMode] = useState<ConversionType>('universal');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  const isRtl = lang === 'fa' || lang === 'ar';

  // Track file list updates to automatically assign and isolate the best default sub-conversion mode
  useEffect(() => {
    if (selectedFiles.length > 0) {
      const firstFile = selectedFiles[0];
      const fileExt = '.' + firstFile.name.split('.').pop()?.toLowerCase();
      
      const isAudio = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma'].includes(fileExt);
      const isVideo = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.3gp'].includes(fileExt);
      const isText = ['.txt', '.md', '.html'].includes(fileExt);

      if (isAudio) {
        setSubConversionMode('audio-convert');
      } else if (isVideo) {
        setSubConversionMode('video-convert');
      } else if (fileExt === '.json' || fileExt === '.csv') {
        setSubConversionMode('json-csv');
      } else if (fileExt === '.docx') {
        setSubConversionMode('docx-to-txt');
      } else if (isText) {
        setSubConversionMode('txt-to-pdf');
      } else if (fileExt === '.pdf') {
        if (selectedFiles.length > 1) {
          setSubConversionMode('merge-pdf');
        } else {
          if (!['pdf-to-img', 'pdf-to-docx', 'split-pdf', 'compress-pdf', 'pdf-to-txt'].includes(subConversionMode)) {
            setSubConversionMode('pdf-to-img');
          }
        }
      } else if (fileExt === '.heic' || fileExt === '.heif') {
        if (!['heic-to-img', 'image-to-pdf'].includes(subConversionMode)) {
          setSubConversionMode('heic-to-img');
        }
      } else {
        // Standard Images
        if (selectedFiles.length > 1) {
          setSubConversionMode('image-to-pdf');
        } else {
          if (!['image-convert', 'image-to-pdf'].includes(subConversionMode)) {
            setSubConversionMode('image-convert');
          }
        }
      }
    } else {
      setSubConversionMode('universal');
    }
  }, [selectedFiles]);

  // Size limit calculation (2GB limit for offline client execution safety)
  const currentLimit = 2000 * 1024 * 1024;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndAddFiles = (filesList: FileList | null) => {
    if (!filesList) return;
    const array = Array.from(filesList);
    setErrorMessage('');

    const matchedFiles: File[] = [];

    for (const file of array) {
      // Validate file extension or type format matches accepted patterns
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      const allowedExts = [
        '.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg', '.heic', '.heif', '.tiff',
        '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma',
        '.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.3gp',
        '.docx', '.txt', '.csv', '.json', '.md', '.html'
      ];
      const isAccepted = allowedExts.includes(fileExt);

      if (!isAccepted) {
        setErrorMessage(lang === 'fa' ? `فرمت تعریف نشده: فایل "${file.name}" پشتیبانی نمی‌شود.` : `Invalid format: "${file.name}" is not supported.`);
        return;
      }

      // Check current size constraints (hard cap of 2GB for browser-native execution safety)
      if (file.size > 2000 * 1024 * 1024) {
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
        setErrorMessage(
          lang === 'fa'
            ? `حجم فایل بسیار زیاد است (${sizeInMb} مگابایت). لطفاً از فایل‌های کوچک‌تر استفاده کنید.`
            : `File is too large (${sizeInMb}MB). Please use a file smaller than 2GB for offline processing.`
        );
        return;
      }

      matchedFiles.push(file);
    }

    // Handle combinations smartly without mixing formats
    setSelectedFiles((prev) => {
      const combined = [...prev, ...matchedFiles];
      if (combined.length > 0) {
        const isFirstPdf = combined[0].name.toLowerCase().endsWith('.pdf');
        return combined.filter(file => {
          const isPdf = file.name.toLowerCase().endsWith('.pdf');
          return isPdf === isFirstPdf;
        });
      }
      return combined;
    });

    setStatus('idle');
    setConvertedOutputs([]);
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndAddFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (selectedFiles.length <= 1) {
      setConvertedOutputs([]);
      setStatus('idle');
    }
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === selectedFiles.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...selectedFiles];
    const item = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = item;
    setSelectedFiles(reordered);
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage(lang === 'fa' ? 'لطفاً فایلی را برای تبدیل انتخاب کنید.' : 'Please select a file to convert.');
      return;
    }

    setStatus('processing');
    setProgress(5);
    setErrorMessage('');
    setConvertedOutputs([]);

    try {
      const qDec = quality / 100;
      const primaryFile = selectedFiles[0];

      switch (subConversionMode) {
        case 'image-convert': {
          const blob = await convertImage(primaryFile, imgFormat, qDec, setProgress);
          
          let ext = 'jpg';
          if (imgFormat === 'image/png') ext = 'png';
          else if (imgFormat === 'image/webp') ext = 'webp';
          else if (imgFormat === 'image/gif') ext = 'gif';
          else if (imgFormat === 'image/bmp') ext = 'bmp';
          else if (imgFormat === 'image/x-icon') ext = 'ico';

          const name = primaryFile.name.replace(/\.[^/.]+$/, "") + `_converted.${ext}`;
          
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        case 'heic-to-img': {
          const targetHeicFormat = imgFormat === 'image/png' ? 'image/png' : imgFormat === 'image/webp' ? 'image/webp' : 'image/jpeg';
          const blob = await convertHEIC(primaryFile, targetHeicFormat as any, qDec, setProgress);
          
          let ext = 'jpg';
          if (targetHeicFormat === 'image/png') ext = 'png';
          else if (targetHeicFormat === 'image/webp') ext = 'webp';

          const name = primaryFile.name.replace(/\.[^/.]+$/, "") + `_converted.${ext}`;
          
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        case 'image-to-pdf': {
          const blob = await convertImagesToPDF(selectedFiles, setProgress);
          const name = selectedFiles.length === 1
            ? selectedFiles[0].name.replace(/\.[^/.]+$/, "") + "_offline_converted.pdf"
            : 'images_merged_offline.pdf';
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        case 'merge-pdf': {
          if (selectedFiles.length < 2) {
            throw new Error(lang === 'fa' ? 'ادغام به حداقل ۲ فایل PDF نیاز دارد.' : 'Merge requires at least 2 PDF files to join.');
          }
          const blob = await mergePDFs(selectedFiles, setProgress);
          const name = 'merged_documents_offline.pdf';
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        case 'split-pdf': {
          const blob = await splitPDF(primaryFile, pagesInput, setProgress);
          const name = primaryFile.name.replace(/\.pdf$/i, '') + `_split_page_${pagesInput.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        case 'compress-pdf': {
          const blob = await compressPDF(primaryFile, setProgress);
          const name = primaryFile.name.replace(/\.pdf$/i, '') + `_offline_compressed.pdf`;
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        case 'pdf-to-img': {
          const targetFormat = imgFormat === 'image/png' ? 'image/png' : 'image/jpeg';
          const imageResults = await convertPdfToImages(primaryFile, targetFormat, setProgress);
          
          const resultsArr = imageResults.map((img) => {
            const ext = targetFormat === 'image/png' ? 'png' : 'jpg';
            return {
              url: URL.createObjectURL(img.blob),
              name: primaryFile.name.replace(/\.pdf$/i, '') + `_page_${img.pageIndex}.${ext}`
            };
          });

          setConvertedOutputs(resultsArr);
          break;
        }

        case 'pdf-to-docx': {
          const blob = await convertPdfToWord(primaryFile, setProgress);
          const name = primaryFile.name.replace(/\.pdf$/i, '') + `_offline_converted.docx`;
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        case 'pdf-to-txt': {
          const blob = await convertPdfToTxt(primaryFile, setProgress);
          const name = primaryFile.name.replace(/\.pdf$/i, '') + '_extracted.txt';
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        case 'txt-to-pdf': {
          const blob = await convertTxtToPdf(primaryFile, setProgress);
          const name = primaryFile.name.replace(/\.(txt|md|html)$/i, '') + '_converted.pdf';
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        case 'json-csv': {
          const isJsonExt = primaryFile.name.toLowerCase().endsWith('.json');
          const blob = isJsonExt ? await convertJsonToCsv(primaryFile) : await convertCsvToJson(primaryFile);
          const ext = isJsonExt ? 'csv' : 'json';
          const name = primaryFile.name.replace(/\.[^/.]+$/, "") + `_converted.${ext}`;
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        case 'docx-to-txt': {
          const blob = await convertDocxToTxt(primaryFile, setProgress);
          const name = primaryFile.name.replace(/\.docx$/i, '') + '_extracted_text.txt';
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        case 'audio-convert': {
          const blob = await convertAudioVideo(primaryFile, audioOutputFormat, setProgress);
          const name = primaryFile.name.replace(/\.[^/.]+$/, "") + `_converted.${audioOutputFormat}`;
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        case 'video-convert': {
          const blob = await convertAudioVideo(primaryFile, videoOutputFormat, setProgress);
          const name = primaryFile.name.replace(/\.[^/.]+$/, "") + `_converted.${videoOutputFormat}`;
          setConvertedOutputs([{ url: URL.createObjectURL(blob), name }]);
          break;
        }

        default:
          throw new Error('Converter not supported.');
      }

      setStatus('completed');
      setProgress(100);
      onProcessedCountChange(processedCount + 1);
      
      // Track actual test action locally conforming to tracking framework
      recordActiveVisit(subConversionMode).catch(e => console.error(e));
    } catch (err: any) {
      console.error(err);
      setStatus('failed');
      setErrorMessage(err.message || 'An error occurred during local conversion. Check file integrity.');
    }
  };

  // Classify dynamic file extensions for suggestions in Universal mode
  const getUniversalSuggestions = () => {
    if (selectedFiles.length === 0) return [];
    
    const firstFile = selectedFiles[0];
    const fileExt = '.' + firstFile.name.split('.').pop()?.toLowerCase();
    
    const isAudio = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma'].includes(fileExt);
    const isVideo = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.3gp'].includes(fileExt);
    const isText = ['.txt', '.md', '.html'].includes(fileExt);

    if (isAudio) {
      return [
        {
          id: 'audio-convert' as ConversionType,
          label: lang === 'fa' ? '🎵 تبدیل فرمت و فشرده‌سازی صدا (MP3/WAV/AAC)' : '🎵 Convert & Compress Audio (MP3/WAV/AAC)',
          desc: lang === 'fa' ? 'تبدیل محلی تمام فایل‌های صوتی به فرمت‌های استاندارد MP3, WAV, OGG, M4A' : 'High-fidelity offline audio encoder to convert tracks to WAV, MP3, or OGG.'
        }
      ];
    }

    if (isVideo) {
      return [
        {
          id: 'video-convert' as ConversionType,
          label: lang === 'fa' ? '🎬 تبدیل فرمت ویدیو یا استخراج صدا (به MP3)' : '🎬 Convert Video or Extract Audio to MP3',
          desc: lang === 'fa' ? 'تغییر فرمت ویدیو به WebM / MP4 یا استخراج کامل ترک صوتی آن به فرمت صوتی' : 'Re-encode video layouts offline or extract the sound track straight into MP3/WAV.'
        }
      ];
    }

    if (fileExt === '.docx') {
      return [
        {
          id: 'docx-to-txt' as ConversionType,
          label: lang === 'fa' ? '📝 استخراج متن خام از فایل Word (.docx)' : '📝 Extract Text from Word Document (.docx)',
          desc: lang === 'fa' ? 'استخراج سریع و ۱۰۰٪ محلی تمام متون و خطوط سند ورد به فایل متنی ساده' : 'Extract printable text lines directly into clean .txt files on your browser memory.'
        }
      ];
    }

    if (fileExt === '.json' || fileExt === '.csv') {
      return [
        {
          id: 'json-csv' as ConversionType,
          label: lang === 'fa' ? '📊 تبدیل متقابل فرمت‌های داده (JSON ⇌ CSV)' : '📊 Data Format Converter (JSON ⇌ CSV)',
          desc: lang === 'fa' ? 'تبدیل آسان جداول CSV به آرایه‌های JSON و برعکس به صورت کاملاً آفلاین' : 'Flatten JSON objects to CSV tables, or parse comma-separated tables to JSON list.'
        }
      ];
    }

    if (isText) {
      return [
        {
          id: 'txt-to-pdf' as ConversionType,
          label: lang === 'fa' ? '📄 تبدیل فایل متنی ساده به سند PDF' : '📄 Convert Text Page to PDF Document',
          desc: lang === 'fa' ? 'ساخت مستقیم سند پی‌دی‌اف خواندار به همراه صفحه‌بندی منظم از خطوط متنی شما' : 'Compile plain text pages into newly-formatted clean PDF.'
        }
      ];
    }

    if (fileExt === '.pdf') {
      if (selectedFiles.length > 1) {
        return [
          {
            id: 'merge-pdf' as ConversionType,
            label: lang === 'fa' ? '🔗 ادغام فایل‌های PDF با هم' : '🔗 Merge PDFs Together',
            desc: lang === 'fa' ? 'چسباندن فایل‌های PDF آپلود شده به صورت متوالی و یکجا' : 'Combine and glue all uploaded PDF files in sequence.'
          }
        ];
      }
      return [
        {
          id: 'pdf-to-img' as ConversionType,
          label: lang === 'fa' ? '🖼️ تبدیل PDF به عکس (JPG/PNG)' : '🖼️ Convert PDF to JPG / PNG',
          desc: lang === 'fa' ? 'ذخیره تک‌تک صفحات سند به صورت عکس‌های مجزا' : 'Render page views straight into high-resolution standard snapshots.'
        },
        {
          id: 'pdf-to-docx' as ConversionType,
          label: lang === 'fa' ? '📝 تبدیل PDF به فایل Word (DOCX)' : '📝 Convert PDF to DOCX Word',
          desc: lang === 'fa' ? 'استخراج تمام متون و پاراگراف‌ها به فایل ورد سند' : 'Extract headings, paragraphs, and formatted lines offline.'
        },
        {
          id: 'split-pdf' as ConversionType,
          label: lang === 'fa' ? '✂️ برش و تفکیک صفحات PDF' : '✂️ Split Page Ranges',
          desc: lang === 'fa' ? 'جداسازی صفحات خاص و انتخابی به عنوان فایل جدید' : 'Slice particular page intervals out to form a smaller file.'
        },
        {
          id: 'compress-pdf' as ConversionType,
          label: lang === 'fa' ? '📉 فشرده‌سازی و کاهش حجم PDF' : '📉 Compress PDF Size',
          desc: lang === 'fa' ? 'کاهش حجم فایل بدون افت کیفیت محسوس سند' : 'Reduce file bounds privately modifying embedded stream dictionaries.'
        },
        {
          id: 'pdf-to-txt' as ConversionType,
          label: lang === 'fa' ? '📝 استخراج متن درون فایل PDF به فایل متنی خام' : '📝 Extract PDF Text to TXT file',
          desc: lang === 'fa' ? 'استخراج همبسته حروف و کلمات متن از سند به فایل متنی ساده' : 'Extract all paragraphs in plain text string from PDF sandbox.'
        }
      ];
    }
    
    if (fileExt === '.heic' || fileExt === '.heif') {
      return [
        {
          id: 'heic-to-img' as ConversionType,
          label: lang === 'fa' ? '🎨 تبدیل HEIC به فرمت‌های عکس' : '🎨 Convert HEIC to JPEG / PNG',
          desc: lang === 'fa' ? 'تبدیل عکس‌های اختصاصی آیفون به فرمت‌های استاندارد وب' : 'Translate proprietary iOS apple raw files into readable outputs.'
        },
        {
          id: 'image-to-pdf' as ConversionType,
          label: lang === 'fa' ? '📄 تبدیل مستقیم عکس به سند PDF' : '📄 Convert Photo to PDF',
          desc: lang === 'fa' ? 'کامپایل کردن فایل تصویری درون سند پی‌دی‌اف و ذخیره آن' : 'Compile formatted snapshot frames inside lightweight high-fidelity PDF.'
        }
      ];
    }
    
    const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg', '.tiff'].includes(fileExt);
    if (isImage) {
      if (selectedFiles.length > 1) {
        return [
          {
            id: 'image-to-pdf' as ConversionType,
            label: lang === 'fa' ? '📄 تبدیل عکس‌ها به PDF چند صفحه‌ای' : '📄 Direct Multipage Image to PDF',
            desc: lang === 'fa' ? 'ترکیب و چسباندن همه عکس‌های انتخابی در قالب یک پی‌دی‌اف' : 'Combine all selected screenshots cleanly into a single ordered PDF.'
          },
          {
            id: 'image-convert' as ConversionType,
            label: lang === 'fa' ? '🔄 تبدیل فرمت دسته جمعی تصاویر' : '🔄 Batch Image Format Convert',
            desc: lang === 'fa' ? 'تغییر فرمت گروهی عکس‌ها به WebP, JPG, PNG و غیره' : 'Re-encode multiple static snapshots in series to different output.'
          }
        ];
      }
      return [
        {
          id: 'image-convert' as ConversionType,
          label: lang === 'fa' ? '🔄 تبدیل فرمت و فشرده‌سازی عکس' : '🔄 Convert or Compress Image Format',
          desc: lang === 'fa' ? 'تغییر فرمت به WebP, PNG, JPEG, BMP با کنترل کیفیت' : 'Re-encode to WebP, PNG, JPEG, GIF, BMP, or ICO with customize compression profiles.'
        },
        {
          id: 'image-to-pdf' as ConversionType,
          label: lang === 'fa' ? '📄 تبدیل عکس به سند PDF کتبی' : '📄 Convert Image to PDF Document',
          desc: lang === 'fa' ? 'ذخیره کردن عکس در قالب سند قابل حمل پی‌دی‌اف یک صفحه‌ای' : 'Render static picture inside newly created portable document page grids.'
        }
      ];
    }
    
    return [];
  };

  const suggestions = getUniversalSuggestions();

  // Safe estimation warning flag for memory capacity warnings
  const isLargeFileDetected = selectedFiles.some((f) => f.size > 15 * 1024 * 1024);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden" id="converter-box">
      {/* Visual Workspace Sub-Header info */}
      <div className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between" id="converter-meta-bar">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t('module_active')}: {currentConverter.title}
        </span>
        <span className="text-[10px] px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-extrabold border border-blue-100 dark:border-blue-900" id="max-size-limiter">
          {t('max_size')}: 2GB
        </span>
      </div>

      <div className="p-6">
        {/* Memory Warning Alert */}
        {isLargeFileDetected && (
          <div className={`mb-5 flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-900 dark:text-amber-300 text-xs ${isRtl ? 'text-right' : 'text-left'}`} id="memory-warning">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-bold">{t('large_file_warn')}:</span> {t('large_file_warn_desc').replace('{size}', ((selectedFiles.reduce((acc, f) => acc + f.size, 0)) / (1024 * 1024)).toFixed(1))}
            </div>
          </div>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={selectedFiles.length === 0 ? triggerUploadClick : undefined}
          className={`relative border-2 border-dashed rounded-2xl py-12 px-6 flex flex-col items-center justify-center transition-all ${
            selectedFiles.length === 0 ? 'cursor-pointer' : ''
          } ${
            isDragging
              ? 'border-blue-500 bg-blue-50/55 dark:bg-blue-900/15 shadow-inner'
              : 'border-slate-300 dark:border-slate-800 bg-slate-50/30 hover:bg-slate-50/70 dark:bg-slate-950/10 dark:hover:bg-slate-950/20'
          }`}
          id="drag-workspace"
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple={true}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,.heic,.heif,.tiff,.mp3,.wav,.ogg,.m4a,.aac,.flac,.wma,.mp4,.webm,.mov,.avi,.mkv,.flv,.3gp,.docx,.txt,.csv,.json,.md,.html"
            onChange={handleFileChange}
          />

          {selectedFiles.length === 0 ? (
            <div className="text-center" id="empty-state">
              <Upload className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto stroke-1" />
              <p className="mt-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('drag_drop_browse')}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                {lang === 'fa' 
                  ? 'فرمت‌های پشتیبانی شده: اسناد (PDF, Word, TXT, CSV, JSON)، صوتی (MP3, WAV, AAC, M4A...)، ویدیویی (MP4, WebM...)، تصاویر سبک و سنگین (HEIC, JPG, PNG, WEBP, SVG)' 
                  : 'Supported formats: Documents (PDF, DOCX, TXT, CSV, JSON), Audio (MP3, WAV, AAC, OGG...), Video (MP4, WebM...), and Images (HEIC, PNG, JPG, WebP, SVG, GIF, TIFF)'} (Max: 2GB)
              </p>
            </div>
          ) : (
            <div className={`w-full ${isRtl ? 'text-right' : 'text-left'}`} id="active-files-list">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                {t('selected_files')} ({selectedFiles.length})
              </h3>
              
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
                    id={`file-item-${idx}`}
                  >
                    <div className={`flex items-center gap-3 min-w-0 ${isRtl ? 'pl-4' : 'pr-4'}`}>
                      <File className="w-5 h-5 shrink-0 text-slate-400 dark:text-slate-500" />
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {(subConversionMode === 'merge-pdf' || subConversionMode === 'image-to-pdf') && (
                        <>
                           <button
                            type="button"
                            onClick={() => moveFile(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFile(idx, 'down')}
                            disabled={idx === selectedFiles.length - 1}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        title="Remove File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(subConversionMode === 'merge-pdf' || subConversionMode === 'image-to-pdf') && (
                <button
                  type="button"
                  onClick={triggerUploadClick}
                  className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500 cursor-pointer dark:text-blue-400"
                  id="add-more-pdf-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('add_more_items')}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* SMART SUGGESTIONS - UNIVERSAL AUTO-DETECT PANEL */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-blue-50/15 dark:bg-slate-950/30 border border-blue-100/50 dark:border-slate-800" id="universal-suggestions-box">
            <div className={`flex items-center gap-2 mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
              <div>
                <h4 className="text-xs font-extrabold text-blue-900 dark:text-slate-200 tracking-wider uppercase">
                  {t('auto_detect_title')}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t('auto_detect_desc')}</p>
              </div>
            </div>

            {suggestions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="suggestions-cards">
                {suggestions.map((suggestion) => {
                  const isActive = subConversionMode === suggestion.id;
                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => setSubConversionMode(suggestion.id)}
                      className={`flex flex-col ${isRtl ? 'text-right' : 'text-left'} p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'border-blue-500 ring-2 ring-blue-500/15 bg-blue-50/20 dark:bg-blue-950/20 shadow-md shadow-blue-500/5'
                          : 'bg-white dark:bg-slate-900 border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-750'
                      }`}
                    >
                      <span className={`text-xs font-extrabold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {suggestion.label}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-semibold">
                        {suggestion.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 text-xs text-amber-800">
                {t('generic_format_det')}
              </div>
            )}
          </div>
        )}

        {/* Custom Converter Config Settings depending on active selected module */}
        {selectedFiles.length > 0 && status === 'idle' && subConversionMode !== 'universal' && (
          <div className={`mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 ${isRtl ? 'text-right' : 'text-left'}`} id="options-panel">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                {t('configure_settings')}
              </h4>
            </div>

            {/* Split page range fields */}
            {subConversionMode === 'split-pdf' && (
              <div className="space-y-1.5" id="split-pdf-fields">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('split_range_label')}
                </label>
                <input
                  type="text"
                  value={pagesInput}
                  onChange={(e) => setPagesInput(e.target.value)}
                  placeholder="e.g. 1-2, 4"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{t('split_range_help')}</p>
              </div>
            )}

            {/* Format choice sliders (WebP, JPEG, PNG, GIF, BMP, ICO) & compression */}
            {(subConversionMode === 'image-convert' || subConversionMode === 'pdf-to-img' || subConversionMode === 'heic-to-img') && (() => {
              const imageOptions: SelectOption[] = [
                { value: 'image/jpeg', label: 'JPEG (.jpg)', desc: lang === 'fa' ? 'عکس فشرده با کیفیت بالا' : 'Compressed high-quality picture' },
                { value: 'image/png', label: 'PNG (.png)', desc: lang === 'fa' ? 'عکس بدون افت کیفیت' : 'Lossless, supports transparency' },
                { value: 'image/webp', label: 'WebP (.webp)', desc: lang === 'fa' ? 'بهینه‌ترین فرمت عکس وب' : 'Next-gen web optimized format' },
                { value: 'image/gif', label: 'GIF (.gif)', desc: lang === 'fa' ? 'فرمت عکس ساده/انیمیشن' : 'Animation or simple image' },
                { value: 'image/bmp', label: 'BMP (.bmp)', desc: lang === 'fa' ? 'فرمت بیت‌مپ غیرفشرده' : 'Uncompressed bitmap format' },
                { value: 'image/x-icon', label: 'ICO (.ico)', desc: lang === 'fa' ? 'فرمت آیکون استاندارد وب‌سایت' : 'Favicon standard file layout' },
              ];
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="image-options-panel">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('output_format_label')}
                    </label>
                    <CustomSelect
                      value={imgFormat}
                      onChange={(val) => setImgFormat(val)}
                      options={imageOptions}
                      lang={lang}
                      id="image-format-custom-select"
                    />
                  </div>

                  {imgFormat !== 'image/png' && imgFormat !== 'image/bmp' && imgFormat !== 'image/gif' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                        <span>{t('quality_label')}</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400">{quality}%</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full text-blue-600 h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {quality < 60 ? t('quality_low_help') : quality > 90 ? t('quality_high_help') : t('quality_balanced_help')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Audio Convert Options */}
            {subConversionMode === 'audio-convert' && (() => {
              const audioOptions: SelectOption[] = [
                { value: 'mp3', label: 'MP3 (.mp3)', desc: lang === 'fa' ? 'رایج‌ترین فرمت صوتی فشرده' : 'Highly compressed standard audio' },
                { value: 'wav', label: 'WAV (.wav)', desc: lang === 'fa' ? 'کیفیت بالا و فشرده‌نشده (استودیویی)' : 'High quality lossless studio audio' },
                { value: 'ogg', label: 'OGG (.ogg)', desc: lang === 'fa' ? 'فرمت صوتی منبع باز بهینه' : 'Highly optimized open-source direct stream' },
                { value: 'm4a', label: 'M4A (.m4a)', desc: lang === 'fa' ? 'فرمت صوتی باکیفیت اپل' : 'Apple standard AAC/ALAC audio profile' },
                { value: 'aac', label: 'AAC (.aac)', desc: lang === 'fa' ? 'فرمت صوتی پیشرفته و کارآمد' : 'Advanced efficient standard audio coding' },
                { value: 'flac', label: 'FLAC (.flac)', desc: lang === 'fa' ? 'کیفیت فوق‌العاده بالا و بدون اتلاف' : 'Free lossless ultra fidelity audio' },
              ];
              return (
                <div className="space-y-1.5" id="audio-convert-fields">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'fa' ? 'فرمت صوتی هدف' : 'Target Audio Format'}
                  </label>
                  <CustomSelect
                    value={audioOutputFormat}
                    onChange={(val) => setAudioOutputFormat(val)}
                    options={audioOptions}
                    lang={lang}
                    id="audio-format-custom-select"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-1">
                    {lang === 'fa' ? 'تبدیل ۱۰۰٪ آفلاین و محلی در مرورگر شما بدون آپلود فایل.' : 'Processed 100% locally in your secure sandbox.'}
                  </p>
                </div>
              );
            })()}

            {/* Video Convert Options */}
            {subConversionMode === 'video-convert' && (() => {
              const videoOptions: SelectOption[] = [
                { value: 'mp4', label: 'MP4 (.mp4 Video)', desc: lang === 'fa' ? 'فرمت ویدیویی استاندارد با بیشترین سازگاری' : 'Standard MP4 container with high compatibility' },
                { value: 'webm', label: 'WebM (.webm Video)', desc: lang === 'fa' ? 'فرمت ویدیویی مدرن و بهینه شده برای وب' : 'Next-gen HTML5 video standard' },
                { value: 'mp3', label: 'MP3 (.mp3 Audio)', desc: lang === 'fa' ? 'استخراج جداگانه صدا از روی ویدیو' : 'Demux and extract standard audio track' },
                { value: 'wav', label: 'WAV (.wav Audio)', desc: lang === 'fa' ? 'استخراج صدا با کیفیت اصلی بدون فشرده‌سازی' : 'Extract studio grade lossless audio track' },
              ];
              return (
                <div className="space-y-1.5" id="video-convert-fields">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'fa' ? 'فرمت خروجی هدف' : 'Target Output Format'}
                  </label>
                  <CustomSelect
                    value={videoOutputFormat}
                    onChange={(val) => setVideoOutputFormat(val)}
                    options={videoOptions}
                    lang={lang}
                    id="video-format-custom-select"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-1">
                    {lang === 'fa' ? 'استخراج صدا با کدک‌های استاندارد صوتی بومی انجام خواهد شد.' : 'Directly demux audio structures with browser-native fast streams.'}
                  </p>
                </div>
              );
            })()}

            {/* JSON / CSV Options */}
            {subConversionMode === 'json-csv' && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {lang === 'fa' 
                  ? 'تبدیل داده ساختار یافته محلی. اگر فایل JSON دارای لیست باشد، به جدول هموار CSV تبدیل می‌شود و برعکس.' 
                  : 'Structured data parser. Flatten nested JSON objects to CSV tables, or bundle tabular rows into JSON object array.'}
              </p>
            )}

            {/* DOCX to TXT Options */}
            {subConversionMode === 'docx-to-txt' && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {lang === 'fa' 
                  ? 'این ماژول متن محرمانه، جداول و خطوط سند ورد را استخراج کرده و در قالب فایل متنی ساده ذخیره می‌کند.' 
                  : 'This module extracts structured paragraphs and records from MS Word document to plaintext completely offline.'}
              </p>
            )}

            {/* TXT to PDF Options */}
            {subConversionMode === 'txt-to-pdf' && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {lang === 'fa' 
                  ? 'خطوط متن ساده را به عنوان صفحات کتاب به سند جدید PDF کامپایل کنید.' 
                  : 'Compile text flow into beautifully-formatted printable PDF chapters.'}
              </p>
            )}

            {/* PDF to TXT Options */}
            {subConversionMode === 'pdf-to-txt' && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {lang === 'fa' 
                  ? 'استخراج تمام نوشته‌های لایه متنی سند PDF شما به یک فایل متنی ساده (TXT).' 
                  : 'Extract clean raw unicode characters page-by-page to plain text document offline.'}
              </p>
            )}

            {subConversionMode === 'pdf-to-docx' && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('pdf_to_docx_help')}
              </p>
            )}

            {subConversionMode === 'compress-pdf' && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('compress_pdf_help')}
              </p>
            )}
            
            {subConversionMode === 'merge-pdf' && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {t('merge_pdf_help')}
              </p>
            )}

            {subConversionMode === 'image-to-pdf' && (
              <p className="text-[10px] text-slate-550 dark:text-slate-400 font-semibold leading-relaxed">
                {t('image_to_pdf_help')}
              </p>
            )}
          </div>
        )}

        {/* Action Error details display field */}
        {errorMessage && (
          <div className={`mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5 ${isRtl ? 'text-right' : 'text-left'}`} id="error-message-field">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-500 mt-0.5" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Execution buttons & state progress bars */}
        {selectedFiles.length > 0 && subConversionMode !== 'universal' && (
          <div className="mt-6" id="action-engine">
            {status === 'idle' && (
              <button
                type="button"
                onClick={handleConvert}
                className="w-full py-3 px-5 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-500 rounded-xl cursor-pointer shadow-lg hover:shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
                id="convert-trigger-btn"
              >
                <span>{t('btn_convert_now')}</span>
              </button>
            )}

            {status === 'processing' && (
              <div className={`space-y-2.5 ${isRtl ? 'text-right' : 'text-left'}`} id="converting-progress-wrapper">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    {t('btn_converting')}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-150 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                     className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                     style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-455 dark:text-slate-500">{t('js_sandbox_alert')}</p>
              </div>
            )}

            {status === 'failed' && (
              <button
                type="button"
                onClick={handleConvert}
                className="w-full py-3 px-5 text-sm font-extrabold text-white bg-red-650 hover:bg-red-500 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
                id="convert-retry-btn"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('btn_retry')}</span>
              </button>
            )}

            {status === 'completed' && convertedOutputs.length > 0 && (
              <div className={`space-y-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 ${isRtl ? 'text-right' : 'text-left'}`} id="success-results">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">
                    {t('success_title')}
                  </h4>
                </div>
                
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  {t('success_desc')}
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {convertedOutputs.map((out, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 text-xs"
                      id={`output-file-block-${index}`}
                    >
                      <div className={`flex items-center gap-2 min-w-0 ${isRtl ? 'pl-2' : 'pr-2'}`}>
                        <FileCode className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{out.name}</span>
                      </div>
                      <a
                        href={out.url}
                        download={out.name}
                        className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[10px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Download locally"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('btn_download')}</span>
                      </a>
                    </div>
                  ))}
                </div>

                {convertedOutputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      convertedOutputs.forEach((out) => {
                        const link = document.createElement('a');
                        link.href = out.url;
                        link.download = out.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      });
                    }}
                    className="w-full py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-2"
                    id="download-all-batch-btn"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('btn_download_all')} ({convertedOutputs.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFiles([]);
                    setStatus('idle');
                    setProgress(0);
                    setConvertedOutputs([]);
                  }}
                  className="w-full text-center text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline font-semibold transition-all pt-1 cursor-pointer block"
                  id="reset-form-btn"
                >
                  {t('btn_convert_another')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Safety message layout */}
      <div className="bg-slate-50/50 dark:bg-slate-950/40 px-6 py-4 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed" id="security-disclaimer">
        🛡️ {t('bottom_security_disclaimer')}
      </div>
    </div>
  );
}

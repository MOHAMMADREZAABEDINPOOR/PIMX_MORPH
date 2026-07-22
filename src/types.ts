export type ConversionType =
  | 'universal'
  | 'pdf-to-img'
  | 'pdf-to-docx'
  | 'image-convert'
  | 'image-to-pdf'
  | 'merge-pdf'
  | 'split-pdf'
  | 'compress-pdf'
  | 'heic-to-img'
  | 'audio-convert'
  | 'video-convert'
  | 'txt-to-pdf'
  | 'pdf-to-txt'
  | 'json-csv'
  | 'docx-to-txt';

export interface ConverterInfo {
  id: ConversionType;
  title: string;
  description: string;
  icon: string;
  acceptedTypes: string[];
  maxFreeSize: number; // in bytes (e.g. 5MB)
  maxProSize: number; // in bytes (e.g. 50MB)
  seoTitle: string;
  seoDescription: string;
}

export interface ConversionJob {
  id: string;
  file: File;
  name: string;
  size: number;
  type: ConversionType;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  outputUrl?: string;
  outputName?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPro: boolean;
}

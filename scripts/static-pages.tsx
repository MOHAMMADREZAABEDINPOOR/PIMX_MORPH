import React from 'react';
import RouteSections from '../src/components/RouteSections';
import { renderToString } from 'react-dom/server';
import { MotionConfig } from 'motion/react';
import HomeHero from '../src/components/HomeHero';
import HomeSections, { HomeFinale } from '../src/components/HomeSections';
import HomeFAQ from '../src/components/HomeFAQ';
import BrandMark from '../src/components/BrandMark';
import Studio from '../src/components/Studio';
import Library from '../src/components/Library';

export const pages = {
  '/': { title: 'Private File Converter — Images, PDF, Audio & Video', description: 'Convert images, HEIC, PDF, documents, audio and video locally with PIMX MORPH. No account or file upload. Save finished files in your private browser library.' },
  '/upload': { title: 'Private file converter — images, PDF, audio & video', description: 'Choose files, discover compatible output formats, convert and download on your device. Convert images, PDFs, documents, audio and video without uploading their contents.' },
  '/offline': { title: 'Offline file converter & install', description: 'Install PIMX MORPH and check your saved offline tools. Download the optional media engine for local audio and video conversion without an internet connection.' },
  '/library': { title: 'Your local file library', description: 'Find, download and delete your converted files saved in this browser. Browse the library of image, PDF, document and media tools.' },
};

export function renderPage(route: string) {
  return renderToString(<MotionConfig reducedMotion="always"><div className="site-shell"><header className="site-header"><a href="/" className="brand"><span className="brand-symbol"><BrandMark/></span>PIMX MORPH</a><nav className="main-nav" aria-label="Main navigation">{[['/', 'Home'], ['/upload', 'Studio'], ['/library', 'Library'], ['/offline', 'Offline']].map(([url,label])=><a key={url} href={url} aria-current={route===url ? 'page' : undefined}>{label}</a>)}</nav><a href="/upload" className="header-cta">Let’s convert</a></header><main id="main-content">
    {route==='/' && <><HomeHero lang="en" paused onPause={()=>{}}/><HomeSections lang="en" paused/><HomeFAQ lang="en"/><HomeFinale lang="en" paused/></>}
    {route==='/upload' && <><div className="page-intro upload-intro page-inset"><h1>A new form starts here.</h1><p>Choose your files. We’ll find the formats that fit.</p></div><Studio lang="en" onCategoryChange={()=>{}}/><RouteSections lang="en" surface="studio"/></>}
    {route==='/library' && <Library lang="en"/>}
    {route==='/offline' && <><section className="page-intro page-inset"><h1>Take your studio along.</h1><p>Install MORPH. Save the tools you need. Keep creating without a connection.</p><h2>Your offline kit</h2><p>Everyday tools are cached after the app loads. Audio and video use an additional media-engine download. Open the app online to check actual cache readiness before disconnecting.</p></section><RouteSections lang="en" surface="offline"/></>}
  </main><footer className="site-footer"><a href="/" className="brand">PIMX MORPH</a><p>A better shape for what’s next.</p><div className="footer-word" aria-hidden="true">MORPH</div></footer></div></MotionConfig>);
}

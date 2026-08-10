# HH Goa 2026 Frame Generator

A modern, production-ready web application built with Next.js 15, TypeScript, Tailwind CSS, and HTML5 Canvas.

## Features
- **Upload Images**: Drag and drop support for JPG, PNG, and iPhone HEIC files (auto-converted to PNG).
- **Auto Image Processing**: Automatically scales and centers images to fill the frame perfectly.
- **Beautiful Frame**: Modern gradient and glassmorphism design with HH Goa 2026 branding.
- **Instant Preview**: Live preview generated in the browser.
- **Export & Share**: Download the final PNG or share directly to X (Twitter).
- **Privacy-First**: No database, no auth. Everything runs in the browser.

## Getting Started

1. Navigate to the project directory:
   ```bash
   cd frame-generator
   ```

2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- HTML5 Canvas API
- `react-dropzone`
- `heic2any`
- `lucide-react`

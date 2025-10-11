# Shanghai Planetarium Smart Guide

## Overview

This is an intelligent tourist guide application for Shanghai Planetarium (上海天文馆智能导览). The app provides visitors with exhibit information and AI-powered Q&A assistance to enhance their museum experience. Visitors can browse exhibit content and interact with an AI docent to learn about astronomical knowledge.

**Application Name**: 上海天文馆智能导览 (Shanghai Planetarium Smart Guide)

**Key Features**:
- Browse exhibit information by gallery and display
- Read detailed exhibit descriptions
- Ask questions to an AI docent about exhibits
- No login required - accessible to all visitors

## Recent Changes (October 11, 2025)

- **Removed authentication system**: Deleted login page, auth store, and all authentication-related code
- **Removed training features**: Deleted fill-in-blank and paraphrase training pages
- **Removed Supabase database**: Switched to local JSON data loading from files
- **Updated branding**: Changed app name to "上海天文馆智能导览"
- **Simplified UI**: Removed user progress tracking, login buttons, and training features
- **Redesigned pages**: Updated WelcomePage and StudyPage for tourist use

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Framework**: Vue 3 with TypeScript and Composition API
- Uses `<script setup>` SFC syntax for component development
- Vite as the build tool and dev server (runs on port 5000)
- Pinia for state management (currently minimal usage)
- Vue Router for client-side routing with history mode

**UI/UX Design**:
- TailwindCSS for utility-first styling with custom theme configuration
- Responsive design supporting both desktop and mobile interfaces
- Light gradient background (from-gray-50 via-blue-50) with blue primary colors
- White semi-transparent cards for content display
- Touch gesture handling for mobile devices (swipe navigation)

**Component Structure**:
- **WelcomePage.vue**: Landing page with navigation to exhibit browser and AI chat
- **StudyPage.vue**: Exhibit browser with sidebar navigation and content display
- **AiChatPage.vue**: AI-powered Q&A interface for visitor questions
- Reusable utility functions in `src/lib/` and `src/utils/`

### Data Architecture

**Content Storage**:
- JSON file: `shanghai_astronomy_museum.json` (96 paragraphs)
- Markdown file: `讲解逐字稿.md` (original docent scripts)
- Data loaded locally on page load, no database required

**Content Structure**:
- Organized by section (展区) and module (模块)
- Each paragraph includes:
  - id, section, module, title, content
  - keywords for search/highlighting
  - fill_blanks and voice_check_phrases (legacy fields, not used)

**Data Loading**:
- Primary: Load from local JSON file
- Fallback: Parse markdown file for content
- No database or server calls required

### External Dependencies

**AI Services Integration**:

1. **SiliconFlow AI** (Primary AI Provider)
   - Chat completions API for intelligent Q&A
   - Multiple model support (DeepSeek-V3.1, Kimi-K2, Qwen2.5, etc.)
   - Configured via `src/utils/siliconflow.ts`
   - API key: `VITE_SILICONFLOW_API_KEY`
   - Base URL: `https://api.siliconflow.cn/v1`
   - Used for AI docent conversations

2. **iFlytek Speech Recognition** (Optional, not actively used)
   - WebSocket-based real-time speech-to-text
   - Configuration in `src/config/iflytek.ts` and `src/lib/iflytek.ts`

3. **Browser Web Speech API** (Optional)
   - Native browser speech recognition as backup
   - Configured in `src/lib/speechRecognition.ts`

**Third-Party Libraries**:
- `lucide-vue-next` - Icon library for UI
- `clsx` + `tailwind-merge` - Utility class management
- Development tools: ESLint, TypeScript, Autoprefixer

**Deployment Platforms**:
- Vercel: Configured with `vercel.json` for SPA routing
- Replit: Dev server configured for `.replit.dev` and `.replit.co` domains with HMR support

**Environment Variables** (.env):
- `VITE_SILICONFLOW_API_KEY` - AI service authentication (required)
- Legacy variables (not used): VITE_SUPABASE_*, VITE_IFLYTEK_*

### Removed/Deprecated Features

The following features have been removed:
- User authentication and login system
- Supabase database integration
- User progress tracking
- Fill-in-blank training exercises
- Paraphrase/speech training
- Express.js API server (backend not needed for current functionality)

### Current Routes

- `/` - Welcome page with app introduction
- `/study` - Exhibit browser and content display
- `/ai-chat/:paragraphId` - AI docent chat interface for specific exhibit

# SlideForge - AI-Powered Presentation Generator

## Problem Statement
Build an AI-powered PPT/Presentation Generator. User gives a prompt → AI turns it into structured slides → render/export PPT. Uses 3 AI models: DeepSeek-V3.1 (Orchestrator), GPT-OSS-120B (Content Generator), Qwen3-Coder-Next (Layout Generator).

## Architecture
- **Backend**: FastAPI + MongoDB + python-pptx + fpdf2
- **Frontend**: React + Tailwind + Shadcn/UI
- **Auth**: JWT with httpOnly cookies, bcrypt password hashing
- **LLM Integration**: OpenAI-compatible SDK for all 3 models with mock fallbacks

## User Personas
- Content creators needing quick presentation generation
- Business professionals for pitch decks and reports
- Educators creating lecture slides

## Core Requirements (Static)
- Prompt-based presentation generation
- 3-model AI pipeline (orchestrate → content → layout → render)
- PPTX and PDF export
- JWT authentication
- Generation history
- Slide preview with navigation

## What's Been Implemented (2026-03-28)
- Full JWT auth (register, login, logout, me, refresh, brute force protection)
- Admin seeding on startup
- 3-model LLM pipeline with mock fallbacks (when API keys empty)
- Background async generation with status polling
- PPTX rendering with python-pptx (blue/white theme, title + content layouts)
- PDF rendering with fpdf2 (matching slide design)
- Split-screen auth pages (login/register)
- Dashboard with collapsible sidebar
- New Presentation page with prompt input + progress stepper + slide preview
- History page with status badges and delete
- Presentation view with slide canvas, navigation (prev/next/dots), thumbnails
- Download buttons for both PPTX and PDF
- Design: Outfit + Manrope fonts, #0052FF primary blue, white backgrounds

## Testing Results
- Backend: 15/15 API tests passed (100%)
- Frontend: All UI flows working (100%)
- Overall: 100% success rate

## Prioritized Backlog
### P0 (Critical - Next)
- Add real LLM API keys for DeepSeek, GPT-OSS, Qwen3 integration
- Production CORS configuration

### P1 (Important)
- Multiple slide layout types (comparison, timeline, image+text)
- Theme/color customization for generated presentations
- Edit slides after generation (modify titles/bullets)

### P2 (Nice to Have)
- Image support in slides (AI-generated or stock)
- Design themes (dark, corporate, creative, minimal)
- Collaborative sharing / public links
- Presentation templates library
- Real-time SSE instead of polling for generation progress

## Next Tasks
1. User adds LLM API keys to .env for real AI content
2. Add slide editing capability
3. Add presentation themes/templates
4. Add image support in slides

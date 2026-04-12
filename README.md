# ValueScope — Value Readiness Scale Agent

An ElizaOS AI agent that operationalizes the Value Readiness Scale (VRS) framework (Leonova & Durojaiye, 2025) for African professionals evaluating global career opportunities.

Built by Dolapo Durojaiye, PhD candidate at Lobachevsky State University, BD professional, and published researcher on the Japa phenomenon and African youth emigration.

## What it does

ValueScope runs a 10-question assessment across 5 research-validated dimensions: Personal & Professional Values (F1), Cognitive & Learning Readiness (F2), Interpersonal & Digital Competence (F3), Civic & Ethical Orientation (F4), and Resilience & Flexibility (F5).

Users receive a scored readiness profile, overall readiness level, recommended global markets, and 3 concrete next steps.

## Why this exists

This makes a 2-hour research consultation accessible in 3 minutes. Built so people in my network get a real assessment, not generic career advice.

## Stack
- ElizaOS v1.7.2
- Nosana decentralized GPU infrastructure
- Groq LLM inference (llama-3.3-70b-versatile)
- TypeScript custom VRS plugin

## Running locally

    git clone https://github.com/inspiredvoyagesng-star/agent-challenge
    cd agent-challenge
    npm install --ignore-scripts
    cd node_modules/bun && node install.js && cd ../..
    cp .env.example .env
    npm start

## Research foundation

Leonova, A., & Durojaiye, D. (2025). Value Readiness Scale. Lobachevsky State University.

## Nosana Builders Challenge

Submitted for the Nosana Builders Challenge: https://nosana.io

# Software Requirements & SRS Overview

> This document provides an overview of the requirements for **EduSphere — AI-Powered IELTS Preparation Platform**.  
> For the comprehensive, full-specification document, please refer to the official [Software Requirements Specification (SRS)](SRS.md).

---

## 1. Executive Summary

**EduSphere** is an AI-powered, enterprise-grade IELTS preparation platform built on ASP.NET Core (.NET 8 Clean Architecture) and React with TypeScript. It provides comprehensive test simulation for all 4 skills (Listening, Reading, Writing, Speaking), automated AI essay evaluation with Retrieval-Augmented Generation (RAG), and a Spaced Repetition vocabulary system (SuperMemo SM-2).

---

## 2. Core Functional Modules

| Module ID | Module Name | Primary Objective & Technologies |
| :--- | :--- | :--- |
| **FR-AUTH** | Identity & Access Control | JWT + Refresh Token Rotation, BCrypt, Role-Based Access Control (Student / Admin). |
| **FR-READ** | Reading Examination Engine | Split-screen passage viewer, 20-minute countdown, multi-type question parsing, auto-scoring, Redis caching. |
| **FR-LIST** | Listening Examination Engine | 4-section audio streaming, playback speed control, auto-scoring, transcript timestamp linking. |
| **FR-WRIT** | Writing AI Grading Engine ⭐ | Real-time word counter, Semantic Kernel + Qdrant RAG against official IELTS Band Descriptors (4 criteria evaluation). |
| **FR-SPEA** | Speaking Practice Simulator | Part 1/2/3 topics, sequential prep & response countdown timers, AI lexical/fluency feedback. |
| **FR-VOCAB** | Vocabulary Builder (SM-2) | SuperMemo SM-2 Spaced Repetition algorithm, 3D flip flashcards, contextual add from Reading. |
| **FR-AITUTOR**| RAG Academic AI Tutor | Vectorized knowledge base in Qdrant, streaming token response (< 2s latency) for IELTS inquiries. |
| **FR-DASH** | Analytics & Mock Testing | Overall Band Score calculation with official IELTS rounding, Skill Radar Chart, Study Streak (🔥), full mock test simulation. |

---

## 3. Non-Functional Criteria

- **Architecture:** Clean Architecture + CQRS (MediatR), Inward dependency rule.
- **Latency:** Read endpoints `< 150ms` (Redis Cache-Aside); AI streaming `< 2s`.
- **Security:** HTTPS, BCrypt password hashing, JWT expiration/rotation, RFC 7807 Problem Details.
- **Quality Assurance:** Unit test coverage `>= 80%` on Domain and Application layers.
- **DevOps:** Fully containerized with Docker Compose (MSSQL, Redis, Qdrant, API, Client) and GitHub Actions CI/CD.

---

For detailed specification including entity definitions, API contracts, and acceptance criteria, see:
- [Detailed Software Requirements Specification (docs/SRS.md)](SRS.md)
- [Master Development Plan (plan/Sumary.md)](../plan/Sumary.md)

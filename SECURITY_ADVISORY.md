# 🚨 보안 경고 - API 키 노출

## ⚠️ 긴급 조치 필요

**상태:** API 키가 GitHub 공개 저장소에 노출되었습니다.

**노출된 키:** Google Gemini API Key (`AIzaSyAhKVsivUKfVlVDeIrGV-IZlcD6xtk6vNY`)

---

## ✅ 완료된 조치

1. ✅ 문서 파일에서 API 키 제거 (GEMINI_MIGRATION.md, DEPLOYMENT_SUCCESS.md)
2. ✅ 플레이스홀더로 교체 (`YOUR_GOOGLE_API_KEY_HERE`)
3. ✅ 변경사항 커밋 및 푸시

**커밋:** `4a36139 - Security: Remove exposed API key from documentation`

---

## 🔴 즉시 해야 할 일

### 1. Google Cloud Console에서 API 키 재생성

**단계:**

1. **Google Cloud Console 접속**
   - URL: https://console.cloud.google.com/apis/credentials

2. **기존 키 삭제 또는 제한**
   - 노출된 키 찾기: `AIzaSyAhKVsivUKfVlVDeIrGV-IZlcD6xtk6vNY`
   - "Delete" 또는 "Restrict" 클릭

3. **새 API 키 생성**
   - "Create Credentials" → "API Key" 클릭
   - 새로운 키 복사

4. **키 제한 설정 (권장)**
   ```
   API restrictions:
   - Generative Language API

   Application restrictions:
   - HTTP referrers (websites)
   - Add: problem-hacker-production.up.railway.app/*
   - Add: localhost:3000/* (개발용)
   ```

---

### 2. Railway 환경 변수 업데이트

**방법 1: Railway CLI**
```bash
railway variables set GOOGLE_GENERATIVE_AI_API_KEY=새로운_API_키 --service problem-hacker
```

**방법 2: Railway Dashboard**
1. https://railway.com/project/ae9357fd-3c51-434b-bd00-b0d42eb47ffd 접속
2. problem-hacker 서비스 선택
3. Variables 탭
4. `GOOGLE_GENERATIVE_AI_API_KEY` 값 수정
5. Deploy (자동으로 재배포됨)

---

### 3. 로컬 .env 파일 업데이트

```bash
# .env 파일 수정
echo "GOOGLE_GENERATIVE_AI_API_KEY=새로운_API_키" > .env
echo "DATABASE_URL=postgresql://localhost:5432/problem_hacker" >> .env
```

**확인:** .env 파일이 .gitignore에 포함되어 있는지 확인
```bash
cat .gitignore | grep "^\.env$"
```

---

## 🛡️ Git 히스토리 정리 (선택사항)

### 문제점
현재 API 키가 최신 파일에서는 제거되었지만, **이전 커밋 히스토리에 여전히 남아있습니다.**

누구나 git history를 보면 이전 커밋에서 키를 찾을 수 있습니다:
```bash
git log --all --full-history -S "AIzaSy" --source
```

### 해결 방법: BFG Repo-Cleaner 사용

**1. BFG 설치**
```bash
brew install bfg
```

**2. 저장소 백업**
```bash
cd /Users/kimsaeam/cc-playground
git clone --mirror problem-hacker problem-hacker-backup.git
```

**3. API 키 제거**
```bash
cd /Users/kimsaeam/cc-playground/problem-hacker
bfg --replace-text <(echo "AIzaSyAhKVsivUKfVlVDeIrGV-IZlcD6xtk6vNY==>YOUR_GOOGLE_API_KEY_HERE")
```

**4. Git GC 실행**
```bash
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

**5. Force Push**
```bash
git push origin --force --all
git push origin --force --tags
```

**⚠️ 주의:** Force push는 협업자가 있는 경우 문제를 일으킬 수 있습니다.

---

## 📊 보안 점검 체크리스트

### 즉시 (긴급)
- [ ] Google Cloud Console에서 노출된 API 키 삭제/제한
- [ ] 새 API 키 생성
- [ ] Railway 환경 변수 업데이트
- [ ] 로컬 .env 파일 업데이트
- [ ] 애플리케이션 테스트 (새 키로 작동 확인)

### 단기 (24시간 내)
- [ ] Git 히스토리 정리 (BFG 사용)
- [ ] API 키 제한 설정 (도메인/IP 제한)
- [ ] Railway 로그 확인 (비정상적인 사용 여부)

### 장기 (보안 강화)
- [ ] .env 파일이 절대 커밋되지 않도록 pre-commit hook 설정
- [ ] GitHub Actions로 secret scanning 설정
- [ ] Google Cloud 사용량 알림 설정
- [ ] API 키 정기 교체 정책 수립

---

## 🔒 향후 예방 조치

### 1. Pre-commit Hook 설정

`.git/hooks/pre-commit` 파일 생성:
```bash
#!/bin/bash
if git diff --cached --name-only | grep -qE '\.env$'; then
  echo "🚨 Error: .env file in commit!"
  echo "Remove .env from staging: git reset HEAD .env"
  exit 1
fi

# Check for API keys in staged files
if git diff --cached | grep -qE 'AIza[0-9A-Za-z_-]{35}'; then
  echo "🚨 Error: Google API key detected in commit!"
  exit 1
fi
```

```bash
chmod +x .git/hooks/pre-commit
```

### 2. .gitignore 강화

```
# Environment variables
.env
.env.local
.env.*.local

# Secrets
secrets/
*.key
*.pem

# Config with secrets
*-secrets.json
credentials.json
```

### 3. GitHub Secret Scanning

- GitHub에서 자동으로 탐지되었을 가능성 있음
- Repository → Security → Secret scanning alerts 확인

---

## 📞 지원

### Google Cloud Support
- **Console:** https://console.cloud.google.com
- **API 키 관리:** https://console.cloud.google.com/apis/credentials

### Railway Support
- **Dashboard:** https://railway.com/project/ae9357fd-3c51-434b-bd00-b0d42eb47ffd
- **Docs:** https://docs.railway.app

---

## 📝 타임라인

| 시간 | 이벤트 |
|------|--------|
| 2026-02-04 05:33 | API 키가 GEMINI_MIGRATION.md에 커밋됨 |
| 2026-02-04 05:37 | API 키가 DEPLOYMENT_SUCCESS.md에 커밋됨 |
| 2026-02-04 05:45 | 사용자가 노출 발견 |
| 2026-02-04 05:46 | 문서에서 API 키 제거 완료 |
| **지금** | **새 API 키 생성 필요** |

---

## ⚡ 요약

### 완료됨 ✅
- 문서 파일에서 API 키 삭제
- 플레이스홀더로 교체
- GitHub에 푸시

### 해야 할 일 🔴
1. **즉시:** Google Cloud에서 새 API 키 생성
2. **즉시:** Railway 환경 변수 업데이트
3. **즉시:** 로컬 .env 업데이트
4. **선택:** Git 히스토리 정리 (BFG)

### 영향
- **현재 파일:** ✅ 안전 (키 제거됨)
- **Git 히스토리:** ⚠️ 키 남아있음 (재생성 필요)
- **Railway 배포:** 🟡 새 키로 업데이트 필요

---

**생성일:** 2026-02-04
**우선순위:** 🔴 긴급 (CRITICAL)
**상태:** 진행 중

# Railway 배포 가이드

## 현재 상태

✅ Railway 프로젝트 생성: `honest-compassion`
✅ PostgreSQL 데이터베이스 추가 완료
✅ GitHub 저장소: https://github.com/mark2rocket/problem-hacker

## 배포 완료 단계

### 1. Railway 대시보드 접속
URL: https://railway.com/project/ae9357fd-3c51-434b-bd00-b0d42eb47ffd

### 2. 새 서비스 추가 (Next.js 앱)

대시보드에서:
1. **"+ New"** 버튼 클릭
2. **"GitHub Repo"** 선택
3. `mark2rocket/problem-hacker` 저장소 선택
4. 자동으로 빌드 시작됨

### 3. 환경 변수 설정

새로 생성된 서비스에서 **Variables** 탭으로 이동 후 다음 변수들을 추가:

#### 필수 환경 변수:
```
OPENAI_API_KEY=<your-openai-api-key>
```

#### DATABASE_URL (자동 설정)
PostgreSQL 데이터베이스를 참조하려면:
1. **Settings** → **Variables** → **Reference Variables**
2. `Postgres` 서비스의 `DATABASE_URL` 선택

또는 직접 설정:
```
DATABASE_URL=postgresql://postgres:yKJcdQUFuHlNzSHpwTnzEhmYTbHUdxPR@postgres.railway.internal:5432/railway
```

### 4. 도메인 생성

서비스 **Settings** → **Networking** → **Generate Domain**

또는 커스텀 도메인 추가 가능

### 5. 데이터베이스 마이그레이션

서비스가 배포된 후, 다음 명령어로 마이그레이션 실행:

```bash
railway run --service problem-hacker npx drizzle-kit generate
railway run --service problem-hacker npx drizzle-kit migrate
```

또는 Railway 대시보드에서:
**Deployments** → **Deploy** → **Run Command**
```
npx drizzle-kit migrate
```

## 배포 확인

### 빌드 설정 (railway.toml에서 자동 감지됨)

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
healthcheckPath = "/api/health"
healthcheckTimeout = 100
```

### 헬스체크

배포 후 다음 URL에서 헬스체크 확인:
```
https://<your-domain>/api/health
```

응답 예시:
```json
{
  "status": "ok",
  "timestamp": "2026-02-04T05:30:00.000Z"
}
```

## 환경 변수 전체 목록

### Next.js 서비스에 필요한 변수:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API 키 (필수) | `sk-...` |
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `postgresql://...` |
| `NODE_ENV` | 환경 설정 (자동) | `production` |

### Postgres 서비스 변수 (자동 생성됨):

| 변수명 | 값 |
|--------|-----|
| `DATABASE_URL` | `postgresql://postgres:yKJcdQUFuHlNzSHpwTnzEhmYTbHUdxPR@postgres.railway.internal:5432/railway` |
| `DATABASE_PUBLIC_URL` | `postgresql://postgres:yKJcdQUFuHlNzSHpwTnzEhmYTbHUdxPR@shortline.proxy.rlwy.net:23774/railway` |

## 트러블슈팅

### 빌드 실패
- **원인**: Node.js 버전 불일치
- **해결**: `package.json`에 엔진 명시:
  ```json
  "engines": {
    "node": "18.x"
  }
  ```

### 데이터베이스 연결 실패
- **원인**: DATABASE_URL 미설정
- **해결**: Postgres 서비스의 DATABASE_URL을 참조 변수로 추가

### 헬스체크 타임아웃
- **원인**: 앱 시작 시간이 너무 오래 걸림
- **해결**: `railway.toml`에서 `healthcheckTimeout` 증가

## CLI를 통한 대체 배포 (선택사항)

```bash
# 서비스 선택
railway service problem-hacker

# 환경 변수 설정
railway variables set OPENAI_API_KEY=<your-key>

# GitHub 저장소에서 배포
railway up --detach

# 로그 확인
railway logs

# 도메인 생성
railway domain
```

## 완료 후 확인사항

- [ ] Next.js 서비스 생성됨
- [ ] GitHub 저장소 연동됨
- [ ] 환경 변수 설정됨 (OPENAI_API_KEY, DATABASE_URL)
- [ ] 빌드 성공
- [ ] 헬스체크 통과
- [ ] 도메인 생성됨
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 앱 정상 작동 확인

## 비용 참고

Railway Free Plan:
- $5/월 무료 크레딧
- 사용량 초과 시 자동 과금
- PostgreSQL 스토리지: 5GB까지 무료

---

**생성일**: 2026-02-04
**프로젝트**: honest-compassion
**프로젝트 ID**: ae9357fd-3c51-434b-bd00-b0d42eb47ffd

# GitHub 연결 가이드

이 가이드는 날씨 해커톤 참가자들이 GitHub 리포지토리를 연결하는 방법을 설명합니다.

## GitHub 연결 방법 선택

리포지토리를 연결할 때는 두 가지 방법 중 하나를 선택할 수 있습니다.

### 1️⃣ 개인 액세스 토큰 (더 유연함)

**특징:**
- 이미 액세스 권한이 있는 모든 리포지토리에서 즉시 작동합니다
- 세밀한 권한 제어가 가능합니다

**설정 방법:**

1. [github.com](https://github.com)에서 로그인합니다
2. 우상단 프로필 → **Settings** 클릭
3. 좌측 메뉴에서 **Developer settings** → **Personal access tokens** → **Tokens (classic)** 선택
4. **Generate new token** 클릭
5. 다음 항목들을 체크합니다:
   - `repo` - 저장소 접근
   - `workflow` - GitHub Actions (필요시)
   - `user` - 사용자 정보
6. **Generate token** 클릭
7. 생성된 토큰을 복사합니다 (다시 볼 수 없으니 안전한 곳에 보관)
8. Claude Code에서 토큰을 붙여넣습니다

### 2️⃣ GitHub 로그인 (더 적은 단계)

**특징:**
- 한 번의 클릭으로 GitHub 계정으로 로그인합니다
- 간단한 설정 절차

**주의사항:**
- 조직 소유 리포지토리는 관리자 승인이 필요할 수 있습니다

**설정 방법:**

1. Claude Code에서 GitHub 연결 화면으로 이동합니다
2. **GitHub으로 계속하기** 버튼을 클릭합니다
3. GitHub 로그인 페이지에서 계정 정보를 입력합니다
4. 권한 요청을 승인합니다
5. 연결이 완료됩니다

## 어떤 방법을 선택해야 할까요?

| 상황 | 추천 방법 |
|------|---------|
| 간단하게 빠르게 시작하고 싶을 때 | GitHub 로그인 |
| 보안이 중요하고 세밀한 제어를 원할 때 | 개인 액세스 토큰 |
| 여러 계정을 사용해야 할 때 | 개인 액세스 토큰 |
| 조직 리포지토리에 접근해야 할 때 | GitHub 로그인 (관리자 승인 필요) |

## 트러블슈팅

### Q: 토큰이 작동하지 않습니다
**A:** 토큰을 다시 생성하고 필요한 권한이 모두 체크되어 있는지 확인하세요.

### Q: 조직 리포지토리에 접근할 수 없습니다
**A:** 조직 관리자에게 승인을 요청하세요. Settings → Application → Authorized OAuth Apps에서 확인할 수 있습니다.

### Q: 여러 리포지토리를 동시에 사용하고 싶습니다
**A:** 개인 액세스 토큰을 사용하는 것을 추천합니다. 더 많은 유연성을 제공합니다.

## 추가 자료

- [GitHub 개인 액세스 토큰 공식 문서](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub 보안 가이드](https://docs.github.com/en/authentication)

---

**문제가 발생하면 해커톤 스태프에게 문의하세요.**

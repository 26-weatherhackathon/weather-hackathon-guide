# CLAUDE.md - 협업 규칙

이 레포에서 작업할 때 Claude Code(및 모든 협업자)가 반드시 지켜야 하는 Git 규칙입니다.

## 1. GitHub 협업 원칙 (필수, 예외 없음)

- **main 브랜치에 직접 커밋·푸시하지 않습니다.** 사소한 오타 수정이라도 예외 없음.
- 모든 변경 작업은 **새 브랜치를 만들어서** 진행하고, **PR(Pull Request)을 올려서** 머지합니다.
- 새 브랜치는 항상 `origin/main` 기준으로 생성합니다.
  ```
  git checkout -b <branch-name> origin/main
  ```
- 작업 시작 전 반드시 `git branch --show-current`로 현재 브랜치를 확인합니다.
  여러 작업(다른 탭, 다른 팀원)이 동시에 진행 중일 수 있으므로, 엉뚱한 브랜치에서 작업을 시작하지 않도록 주의합니다.
- PR 생성 전 `git log --oneline origin/main..HEAD`로 의도한 커밋만 포함되어 있는지 확인합니다.
- 무관한 변경사항(다른 작업의 미커밋 파일 등)은 `git add`로 함께 올리지 않습니다. 의도한 파일만 명시적으로 스테이징합니다.

## 2. 브랜치 이름 규칙

`<type>/<설명>` 형태로 짓습니다.

| type | 용도 | 예시 |
|---|---|---|
| `feature/` | 새 기능 | `feature/typhoon-map` |
| `fix/` | 버그 수정 | `fix/api-key-leak` |
| `docs/` | 가이드·문서 수정 | `docs/repo-select-screenshot` |

## 3. PR 워크플로우

1. `git checkout -b <branch> origin/main`
2. 작업 및 커밋
3. `git push -u origin <branch>`
4. `gh pr create`로 PR 생성 (제목·본문에 변경 이유를 명확히 작성)
5. 리뷰·머지는 팀원 또는 사용자 확인 후 진행 (Claude Code가 임의로 머지하지 않음)

## 4. 예외 처리

예외는 없습니다. 사용자가 "이번엔 main에 바로 올려도 돼"처럼 **명시적으로** 요청한 경우에만 이 규칙을 건너뛸 수 있습니다. 명시적 지시가 없으면 항상 브랜치 + PR로 진행합니다.

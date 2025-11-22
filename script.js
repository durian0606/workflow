    // ========================================
    // ⭐ 상수 정의
    // ========================================

    /**
     * 시간 관련 상수 (밀리초)
     */
    const TIME = {
      SECOND: 1000,
      MINUTE: 60 * 1000,
      HOUR: 60 * 60 * 1000,
      DAY: 24 * 60 * 60 * 1000,
      WEEK: 7 * 24 * 60 * 60 * 1000
    };

    /**
     * UI 관련 상수
     */
    const UI_CONSTANTS = {
      TOAST_DURATION: 3000,           // Toast 메시지 표시 시간
      TOAST_DURATION_LONG: 5000,      // Toast 긴 표시 시간
      DEBOUNCE_DELAY: 300,            // Debounce 기본 대기 시간
      THROTTLE_LIMIT: 300,            // Throttle 기본 제한 시간
      TEAM_CODE_LENGTH: 6,            // 팀 코드 길이
      MAX_TOAST_COUNT: 5,             // 최대 동시 Toast 개수
      AUTO_SAVE_DELAY: 1000,          // 자동 저장 대기 시간
      SEARCH_DEBOUNCE: 300,           // 검색 디바운스 시간
      SCROLL_THROTTLE: 100,           // 스크롤 쓰로틀 시간
      API_TIMEOUT: 5000,              // API 요청 타임아웃
      CODE_CHANGE_COOLDOWN: 5 * 60 * 1000  // 팀코드 변경 쿨다운 (5분)
    };

    /**
     * Firebase 데이터베이스 경로
     */
    const DB_PATHS = {
      TEAMS: 'teams',
      WORKLIST: 'worklist',
      ASSIGNEES: 'assignees',
      SITES: 'sites',
      SETTINGS: 'settings',
      METADATA: 'metadata'
    };

    /**
     * 에러 메시지
     */
    const ERROR_MESSAGES = {
      NETWORK_ERROR: '네트워크 연결을 확인해주세요',
      INVALID_TEAM_CODE: '유효하지 않은 팀 코드입니다',
      TEAM_NOT_FOUND: '팀을 찾을 수 없습니다',
      DUPLICATE_TEAM_CODE: '이미 존재하는 팀 코드입니다',
      SAVE_FAILED: '저장에 실패했습니다',
      LOAD_FAILED: '불러오기에 실패했습니다',
      PERMISSION_DENIED: '권한이 없습니다',
      INVALID_INPUT: '입력값이 올바르지 않습니다',
      UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다'
    };

    // ========================================
    // ⭐ 유틸리티 함수
    // ========================================

    /**
     * 성능 최적화: 디바운스 (Debounce)
     * 연속된 이벤트를 하나로 그룹화하여 마지막 호출만 실행
     * @param {Function} func - 실행할 함수
     * @param {number} wait - 대기 시간 (ms)
     * @returns {Function} - 디바운스된 함수
     */
    function debounce(func, wait = UI_CONSTANTS.DEBOUNCE_DELAY) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    /**
     * 성능 최적화: 쓰로틀 (Throttle)
     * 일정 시간마다 최대 한 번만 함수 실행
     * @param {Function} func - 실행할 함수
     * @param {number} limit - 제한 시간 (ms)
     * @returns {Function} - 쓰로틀된 함수
     */
    function throttle(func, limit = UI_CONSTANTS.THROTTLE_LIMIT) {
      let inThrottle;
      return function executedFunction(...args) {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }

    /**
     * 성능 최적화: DOM 요소 캐싱
     * 자주 사용하는 DOM 요소를 캐시하여 성능 향상
     */
    const DOM = {
      cache: {},
      get(selector) {
        if (!this.cache[selector]) {
          this.cache[selector] = document.querySelector(selector) || document.getElementById(selector);
        }
        return this.cache[selector];
      },
      clear() {
        this.cache = {};
      }
    };

    /**
     * 성능 최적화: 메모이제이션 (Memoization)
     * 함수 결과를 캐시하여 동일한 입력에 대해 재계산 방지
     * @param {Function} func - 메모이제이션할 함수
     * @returns {Function} - 메모이제이션된 함수
     */
    function memoize(func) {
      const cache = new Map();
      return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
          return cache.get(key);
        }
        const result = func.apply(this, args);
        cache.set(key, result);
        return result;
      };
    }

    /**
     * SHA-256 해시 생성
     * @param {string} str - 해시할 문자열
     * @returns {Promise<string>} - 16진수 해시 문자열
     */
    async function hashPassword(str) {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    }

    /**
     * 담당자별 색상 팔레트 (12가지 구분 가능한 색상)
     */
    const ASSIGNEE_COLORS = [
      '#2196f3', // 파란색
      '#4caf50', // 초록색
      '#ff9800', // 주황색
      '#9c27b0', // 보라색
      '#f44336', // 빨간색
      '#00bcd4', // 청록색
      '#ff5722', // 진한 주황색
      '#3f51b5', // 남색
      '#8bc34a', // 연두색
      '#e91e63', // 분홍색
      '#009688', // 청록색 (진함)
      '#673ab7'  // 진보라색
    ];

    /**
     * 담당자별 고유 색상 반환 (메모이제이션 적용)
     * @param {string} assigneeName - 담당자 이름
     * @returns {string} - 색상 코드 (#xxxxxx)
     */
    const getAssigneeColor = memoize(function(assigneeName) {
      if (!assigneeName) return '#999999'; // 미정인 경우 회색

      // assignees 배열에서 해당 담당자의 인덱스 찾기
      const index = assignees.findIndex(a => a.name === assigneeName);

      if (index === -1) return '#999999'; // 찾지 못한 경우 회색

      // 색상 팔레트를 순환하여 색상 반환
      return ASSIGNEE_COLORS[index % ASSIGNEE_COLORS.length];
    });

    // ========================================
    // ⭐ Toast 알림 시스템
    // ========================================

    /**
     * Toast 알림 표시
     * @param {string} message - 표시할 메시지
     * @param {string} type - 'success'|'error'|'warning'|'info'
     * @param {number} duration - 표시 시간 (ms, 기본 3000)
     */
    window.showToast = function(message, type = 'info', duration = UI_CONSTANTS.TOAST_DURATION) {
      const container = document.getElementById('toastContainer');
      if (!container) {
        console.error('Toast 컨테이너를 찾을 수 없습니다');
        return;
      }

      // Toast 요소 생성
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;

      // 아이콘 선택
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
      `;

      container.appendChild(toast);

      // 자동 제거
      setTimeout(() => {
        toast.classList.add('toast-hiding');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    };

    // ========================================
    // ⭐ 모달 토글 함수들
    // ========================================
    
    window.toggleGuideModal = function() {
      console.log('📖 사용 설명서 모달 토글');
      const modal = document.getElementById('guideModal');
      if (modal) {
        modal.classList.toggle('active');
        console.log(modal.classList.contains('active') ? '✅ 열림' : '✅ 닫힘');
      } else {
        console.error('❌ guideModal을 찾을 수 없습니다');
      }
    };

    // ========================================
    // ⭐ 통계 대시보드
    // ========================================

    let currentStatsPeriod = 'today'; // 'today', 'week', 'month', 'all'

    // 🚀 성능 최적화: 통계 캐시
    let statsCache = {};
    let lastWorksHash = null;

    // works 데이터의 해시 생성 (변경 감지용)
    function getWorksHash() {
      const workIds = Object.keys(works).sort().join(',');
      const workStates = Object.values(works).map(w => `${w.completed}${w.date}${w.deadline}`).join(',');
      return `${workIds}-${workStates}`;
    }

    // 캐시 무효화 (works 데이터 변경 시 호출)
    window.invalidateStatsCache = function() {
      statsCache = {};
      lastWorksHash = null;
      console.log('🔄 통계 캐시 무효화');
    };

    window.toggleStatsModal = function() {
      console.log('📊 통계 대시보드 모달 토글');
      const modal = document.getElementById('statsModal');
      if (modal) {
        const isOpening = !modal.classList.contains('active');
        modal.classList.toggle('active');

        if (isOpening) {
          console.log('✅ 통계 모달 열림 - 데이터 계산 중...');
          calculateAndRenderStats();
        }

        console.log(modal.classList.contains('active') ? '✅ 열림' : '✅ 닫힘');
      } else {
        console.error('❌ statsModal을 찾을 수 없습니다');
      }
    };

    window.changeStatsPeriod = function(period) {
      console.log('📅 통계 기간 변경:', period);
      currentStatsPeriod = period;

      // 버튼 활성화 상태 변경
      document.querySelectorAll('.stats-period-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');

      // 통계 재계산
      calculateAndRenderStats();
    };

    function calculateAndRenderStats() {
      console.log('📊 통계 계산 시작 - 기간:', currentStatsPeriod);

      // 🚀 성능 최적화: 캐시 확인
      const currentHash = getWorksHash();
      const cacheKey = `${currentStatsPeriod}-${currentHash}`;

      if (statsCache[cacheKey]) {
        console.log('⚡ 캐시 히트! 저장된 통계 사용');
        renderStats(statsCache[cacheKey]);
        return;
      }

      console.log('🔄 캐시 미스 - 통계 새로 계산');

      // 기간 필터링을 위한 날짜 계산
      const now = new Date();
      let startDate = null;

      if (currentStatsPeriod === 'today') {
        // 오늘 (00:00:00부터)
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
      } else if (currentStatsPeriod === 'week') {
        // 이번 주 (월요일부터)
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 일요일은 -6, 월~토는 1-dayOfWeek
        startDate = new Date(now);
        startDate.setDate(now.getDate() + diff);
        startDate.setHours(0, 0, 0, 0);
      } else if (currentStatsPeriod === 'month') {
        // 이번 달 (1일부터)
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      // 'all'인 경우 startDate는 null로 유지 (필터링 없음)

      const startDateStr = startDate ? startDate.toISOString().split('T')[0] : null;
      console.log('📅 시작일:', startDateStr || '전체');

      // 통계 객체 초기화
      const stats = {
        total: 0,
        completed: 0,
        inProgress: 0,
        overdue: 0,
        byAssignee: {},
        bySite: {}
      };

      // 🚀 팀원이 있으면 모든 팀원을 초기화 (작업이 없어도 표시되도록)
      if (currentTeamId && assignees && assignees.length > 0) {
        assignees.forEach(assignee => {
          stats.byAssignee[assignee.name] = { total: 0, completed: 0 };
        });
        console.log('👥 팀원 초기화:', assignees.length, '명');
      }

      // 모든 작업 순회
      Object.values(works).forEach(work => {
        // 기간 필터링
        if (startDateStr && work.date < startDateStr) {
          return; // 기간 밖의 작업은 제외
        }

        stats.total++;

        // 완료/진행중 구분
        if (work.completed) {
          stats.completed++;
        } else {
          stats.inProgress++;

          // 기한 초과 체크
          const today = new Date().toISOString().split('T')[0];
          const deadline = work.deadline || work.date;
          if (deadline < today) {
            stats.overdue++;
          }
        }

        // 담당자별 집계
        const assignee = work.assignee || '미정';
        if (!stats.byAssignee[assignee]) {
          stats.byAssignee[assignee] = { total: 0, completed: 0 };
        }
        stats.byAssignee[assignee].total++;
        if (work.completed) {
          stats.byAssignee[assignee].completed++;
        }

        // 현장별 집계
        const site = work.site || '미정';
        if (!stats.bySite[site]) {
          stats.bySite[site] = 0;
        }
        stats.bySite[site]++;
      });

      console.log('📊 통계 계산 완료:', stats);

      // 🚀 성능 최적화: 캐시에 저장
      statsCache[cacheKey] = stats;
      console.log('💾 통계 캐시 저장:', cacheKey);

      // 통계 렌더링
      renderStats(stats);
    }

    function renderStats(stats) {
      // 1. 요약 카드 업데이트
      document.getElementById('statsTotalWorks').textContent = stats.total;
      document.getElementById('statsCompletedWorks').textContent = stats.completed;
      document.getElementById('statsInProgressWorks').textContent = stats.inProgress;
      document.getElementById('statsOverdueWorks').textContent = stats.overdue;

      // 2. 완료율 계산 및 표시
      const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

      // 원형 차트 업데이트
      const circle = document.getElementById('statsCircleFill');
      const circumference = 326.7; // 2 * PI * 52
      const offset = circumference - (completionRate / 100) * circumference;
      if (circle) {
        circle.style.strokeDashoffset = offset;
      }

      // 완료율 퍼센트 표시
      document.getElementById('statsCompletionRate').textContent = `${completionRate}%`;

      // 진행 바 상세 업데이트
      const total = stats.total || 1; // 0으로 나누기 방지
      const completedPercent = Math.round((stats.completed / total) * 100);
      const inProgressPercent = Math.round((stats.inProgress / total) * 100);
      const overduePercent = Math.round((stats.overdue / total) * 100);

      document.getElementById('statsCompletedCount').textContent = `${stats.completed}개`;
      document.getElementById('statsInProgressCount').textContent = `${stats.inProgress}개`;
      document.getElementById('statsOverdueCount').textContent = `${stats.overdue}개`;

      document.getElementById('statsCompletedBar').style.width = `${completedPercent}%`;
      document.getElementById('statsInProgressBar').style.width = `${inProgressPercent}%`;
      document.getElementById('statsOverdueBar').style.width = `${overduePercent}%`;

      // 3. 담당자별 통계 렌더링 (🚀 DocumentFragment 사용)
      const assigneeListEl = document.getElementById('statsAssigneeList');
      assigneeListEl.innerHTML = '';

      // 담당자별 통계를 완료 작업 수 기준으로 정렬
      const assigneeStats = Object.entries(stats.byAssignee).sort((a, b) => b[1].total - a[1].total);

      if (assigneeStats.length === 0) {
        assigneeListEl.innerHTML = '<div style="color: #999; text-align: center; padding: 20px;">데이터가 없습니다</div>';
      } else {
        const fragment = document.createDocumentFragment();
        assigneeStats.forEach(([assignee, data]) => {
          const item = document.createElement('div');
          item.className = 'stats-assignee-item';

          const assigneeColor = getAssigneeColor(assignee);
          item.style.borderLeftColor = assigneeColor;

          item.innerHTML = `
            <div class="stats-assignee-name">
              <span class="stats-assignee-color-dot" style="background: ${assigneeColor};"></span>
              ${assignee}
            </div>
            <div class="stats-assignee-counts">
              <div class="stats-count">
                <span class="stats-count-label">완료:</span>
                <span class="stats-count-value completed">${data.completed}</span>
              </div>
              <div class="stats-count">
                <span class="stats-count-label">전체:</span>
                <span class="stats-count-value total">${data.total}</span>
              </div>
            </div>
          `;

          fragment.appendChild(item);
        });
        assigneeListEl.appendChild(fragment);
      }

      // 4. 현장별 통계 렌더링 (🚀 DocumentFragment 사용)
      const siteListEl = document.getElementById('statsSiteList');
      siteListEl.innerHTML = '';

      // 현장별 통계를 작업 수 기준으로 정렬
      const siteStats = Object.entries(stats.bySite).sort((a, b) => b[1] - a[1]);

      if (siteStats.length === 0) {
        siteListEl.innerHTML = '<div style="color: #999; text-align: center; padding: 20px;">데이터가 없습니다</div>';
      } else {
        const fragment = document.createDocumentFragment();
        siteStats.forEach(([site, count]) => {
          const item = document.createElement('div');
          item.className = 'stats-site-item';

          item.innerHTML = `
            <div class="stats-site-name">${site}</div>
            <div class="stats-site-count">${count}</div>
          `;

          fragment.appendChild(item);
        });
        siteListEl.appendChild(fragment);
      }

      // Lucide 아이콘 초기화
      if (window.lucide) lucide.createIcons();

      console.log('✅ 통계 렌더링 완료');
    }

    window.toggleCompanyCodeModal = function() {
      console.log('🔑 팀코드 모달 토글');
      const modal = document.getElementById('companyCodeModal');
      
      if (!modal) {
        console.error('❌ companyCodeModal을 찾을 수 없습니다');
        return;
      }
      
      if (!modal.classList.contains('active')) {
        console.log('✅ 모달 열기 - 회사 코드 표시');
        
        if (companyInfo && companyInfo.companyCode) {
          document.getElementById('displayCompanyCode').textContent = companyInfo.companyCode;
          console.log('✅ 회사 코드:', companyInfo.companyCode);
        } else {
          console.error('❌ companyInfo가 없습니다');
          document.getElementById('displayCompanyCode').textContent = '로딩 중...';
          
          setTimeout(() => {
            if (companyInfo && companyInfo.companyCode) {
              document.getElementById('displayCompanyCode').textContent = companyInfo.companyCode;
            } else {
              document.getElementById('displayCompanyCode').textContent = '------';
            }
          }, 500);
        }
      }
      
      modal.classList.toggle('active');
      console.log(modal.classList.contains('active') ? '✅ 열림' : '✅ 닫힘');
    };

    // ===== 팀 관리 함수들 =====

    window.toggleCreateTeamModal = function() {
      console.log('➕ 팀 만들기 모달 토글');
      const modal = document.getElementById('createTeamModal');
      if (modal) {
        modal.classList.toggle('active');
      }
    };

    window.toggleJoinTeamModal = function() {
      console.log('🔗 팀 참여하기 모달 토글');
      const modal = document.getElementById('joinTeamModal');
      if (modal) {
        modal.classList.toggle('active');
      }
    };

    window.toggleTeamSelectionModal = async function() {
      console.log('👥 팀 선택 모달 토글');
      const modal = document.getElementById('teamSelectionModal');
      if (modal) {
        const isOpening = !modal.classList.contains('active');
        modal.classList.toggle('active');

        // 모달을 열 때 초대 목록 로드
        if (isOpening && currentUserId) {
          await loadInvitationsInTeamSelection();
        }
      }
    };

    window.toggleTeamManagementModal = function() {
      console.log('👥 팀 관리 메인 진입');

      // 팀이 있으면 팀 설정 모달, 없으면 팀 선택 모달
      if (currentTeamId) {
        toggleTeamSettingsModal();
      } else {
        toggleTeamSelectionModal();
      }
    };

    window.toggleInviteMemberModal = async function() {
      console.log('👥 팀원 초대 모달 토글');
      const modal = document.getElementById('inviteMemberModal');
      if (modal) {
        const isOpening = !modal.classList.contains('active');

        // 모달을 열 때 팀 정보 로드
        if (isOpening && currentTeamId) {
          try {
            const teamInfoRef = window.dbRef(window.db, `teams/${currentTeamId}/info`);
            const teamInfoSnapshot = await new Promise((resolve, reject) => {
              const timeoutId = setTimeout(() => reject(new Error('Timeout')), 15000);
              window.dbOnValue(teamInfoRef, (snapshot) => {
                clearTimeout(timeoutId);
                resolve(snapshot);
              }, { onlyOnce: true });
            });

            if (teamInfoSnapshot.exists()) {
              teamInfo = teamInfoSnapshot.val();
              document.getElementById('inviteTeamCode').textContent = teamInfo.teamCode || '------';
            }
          } catch (error) {
            console.error('팀 정보 로드 실패:', error);
          }
        }

        modal.classList.toggle('active');
      }
    };

    // 팀 정보 실시간 리스너
    let teamInfoListener = null;
    let teamMembersListener = null;

    window.toggleTeamSettingsModal = async function() {
      console.log('⚙️ 팀 설정 모달 토글');
      const modal = document.getElementById('teamSettingsModal');
      if (!modal) return;

      const isOpening = !modal.classList.contains('active');
      console.log('모달 상태:', isOpening ? '열기' : '닫기');

      // 먼저 모달 토글
      modal.classList.toggle('active');

      // 모달을 여는 경우에만 데이터 로드
      if (isOpening && currentTeamId) {
        console.log('✅ 모달 열림 - 데이터 로드 시작');

        // 팀 정보 실시간 리스너 등록
        const teamInfoRef = window.dbRef(window.db, `teams/${currentTeamId}/info`);

        // 기존 리스너 제거
        if (teamInfoListener) {
          window.dbOff(teamInfoRef, 'value', teamInfoListener);
          teamInfoListener = null;
        }

        // 새 리스너 등록
        teamInfoListener = (snapshot) => {
          if (snapshot.exists()) {
            teamInfo = snapshot.val();
            console.log('🔄 팀 정보 업데이트됨:', teamInfo);

            // 팀명 표시
            const nameInput = document.getElementById('editTeamNameInput');
            if (nameInput) {
              nameInput.value = teamInfo.name || '';
            }

            // 팀코드 표시
            const codeDisplay = document.getElementById('settingsTeamCode');
            if (codeDisplay) {
              codeDisplay.textContent = teamInfo.teamCode || '------';
              console.log('✅ 팀코드 표시됨:', teamInfo.teamCode);
            }

            // 코드 변경 버튼 활성화 상태 확인
            updateChangeCodeButtonState();
          }
        };

        window.dbOnValue(teamInfoRef, teamInfoListener);

        // 팀원 목록 실시간 리스너 등록
        const membersRef = window.dbRef(window.db, `teams/${currentTeamId}/members`);

        // 기존 리스너 제거
        if (teamMembersListener) {
          window.dbOff(membersRef, 'value', teamMembersListener);
          teamMembersListener = null;
        }

        // 새 리스너 등록
        teamMembersListener = (snapshot) => {
          const memberList = document.getElementById('teamMemberList');
          const memberCount = document.getElementById('teamMemberCount');

          if (snapshot.exists()) {
            const members = snapshot.val();
            const memberArray = Object.entries(members);

            if (memberCount) {
              memberCount.textContent = memberArray.length;
            }

            if (memberList) {
              memberList.innerHTML = '';
              memberArray.forEach(([userId, memberData]) => {
                const li = document.createElement('li');
                li.className = 'site-item';

                const roleIcon = memberData.role === 'creator'
                  ? '<i data-lucide="crown" style="width: 16px; height: 16px; vertical-align: text-bottom; color: #ffa726;"></i> '
                  : '<i data-lucide="user" style="width: 16px; height: 16px; vertical-align: text-bottom;"></i> ';
                const roleText = '';

                li.innerHTML = `
                  <span style="display: flex; align-items: center; gap: 8px;">
                    <span>${roleIcon}${memberData.name}${roleText}</span>
                    <span style="font-size: 11px; color: #999;">(${userId})</span>
                  </span>
                `;
                memberList.appendChild(li);
              });
            }
            console.log('✅ 팀원 목록 업데이트됨:', memberArray.length, '명');
          } else {
            if (memberCount) memberCount.textContent = '0';
            if (memberList) memberList.innerHTML = '<li class="site-item" style="text-align: center; color: #999;">팀원이 없습니다</li>';
          }
        };

        window.dbOnValue(membersRef, teamMembersListener);
      }
      // 모달을 닫는 경우 리스너 정리
      else if (!isOpening) {
        console.log('✅ 모달 닫힘 - 리스너 정리');

        // 팀 정보 리스너 정리
        if (teamInfoListener) {
          const teamInfoRef = window.dbRef(window.db, `teams/${currentTeamId}/info`);
          window.dbOff(teamInfoRef, 'value', teamInfoListener);
          teamInfoListener = null;
        }

        // 팀원 목록 리스너 정리
        if (teamMembersListener) {
          const membersRef = window.dbRef(window.db, `teams/${currentTeamId}/members`);
          window.dbOff(membersRef, 'value', teamMembersListener);
          teamMembersListener = null;
        }
      }
    };

    // 로그인 시 받은 초대 확인 및 알림
    async function checkPendingInvitations() {
      if (!currentUserId) return;

      try {
        const invitationsRef = window.dbRef(window.db, `users/${currentUserId}/invitations`);
        const snapshot = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Timeout')), 15000);
          window.dbOnValue(invitationsRef, (snapshot) => {
            clearTimeout(timeoutId);
            resolve(snapshot);
          }, { onlyOnce: true });
        });

        if (!snapshot.exists()) return;

        const invitations = snapshot.val();
        const pendingInvitations = Object.entries(invitations).filter(([id, inv]) => inv.status === 'pending');

        if (pendingInvitations.length > 0) {
          setTimeout(() => {
            showToast(`📬 받은 초대 ${pendingInvitations.length}개가 있습니다. 팀관리에서 확인하세요!`, 'info', UI_CONSTANTS.TOAST_DURATION_LONG);
          }, TIME.SECOND); // 로그인 후 1초 뒤에 표시
        }
      } catch (error) {
        console.error('초대 확인 실패:', error);
      }
    }

    // 팀 선택 모달에서 초대 목록 로드
    async function loadInvitationsInTeamSelection() {
      try {
        const invitationsRef = window.dbRef(window.db, `users/${currentUserId}/invitations`);
        const snapshot = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Timeout')), 15000);
          window.dbOnValue(invitationsRef, (snapshot) => {
            clearTimeout(timeoutId);
            resolve(snapshot);
          }, { onlyOnce: true });
        });

        const invitationsList = document.getElementById('teamSelectionInvitations');
        invitationsList.innerHTML = '';

        if (!snapshot.exists()) {
          updateInvitationBadge(0);
          return;
        }

        const invitations = snapshot.val();
        const pendingInvitations = Object.entries(invitations).filter(([id, inv]) => inv.status === 'pending');

        if (pendingInvitations.length === 0) {
          updateInvitationBadge(0);
          return;
        }

        updateInvitationBadge(pendingInvitations.length);

        // 헤더 추가
        const header = document.createElement('div');
        header.style.cssText = 'margin-bottom: 15px;';
        header.innerHTML = `
          <h4 style="font-size: 15px; color: #333; font-weight: 600; margin-bottom: 5px;">
            📬 받은 초대 (${pendingInvitations.length})
          </h4>
          <p style="font-size: 12px; color: #999;">아래 초대를 수락하여 팀에 참여할 수 있습니다</p>
        `;
        invitationsList.appendChild(header);

        pendingInvitations.forEach(([invitationId, invitation]) => {
          const invitationCard = document.createElement('div');
          invitationCard.style.cssText = 'border: 2px solid #2a459c; border-radius: 8px; padding: 15px; margin-bottom: 12px; background: linear-gradient(135deg, #e3f2fd 0%, white 100%);';

          const date = new Date(invitation.createdAt).toLocaleString('ko-KR');

          invitationCard.innerHTML = `
            <div style="margin-bottom: 12px;">
              <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 5px;">
                ${invitation.teamName}
              </div>
              <div style="font-size: 13px; color: #666;">
                <strong>${invitation.inviterName}</strong>님이 초대했습니다
              </div>
              <div style="font-size: 11px; color: #999; margin-top: 5px;">
                ${date}
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="admin-btn" onclick="acceptInvitation('${invitationId}', '${invitation.teamId}')" style="flex: 1; background: #4caf50; padding: 10px; width: auto;">
                <i data-lucide="check" style="width: 14px; height: 14px; vertical-align: text-bottom;"></i> 수락
              </button>
              <button class="admin-btn" onclick="rejectInvitation('${invitationId}')" style="flex: 1; background: #f44336; padding: 10px; width: auto;">
                <i data-lucide="x" style="width: 14px; height: 14px; vertical-align: text-bottom;"></i> 거절
              </button>
            </div>
          `;

          invitationsList.appendChild(invitationCard);
        });

        // 구분선 추가
        const divider = document.createElement('div');
        divider.style.cssText = 'border-top: 1px solid #ddd; margin: 20px 0;';
        invitationsList.appendChild(divider);

        // Lucide 아이콘 초기화
        if (window.lucide) lucide.createIcons();

      } catch (error) {
        console.error('초대 목록 로드 실패:', error);
      }
    }

    // 팀 코드 생성 함수 (6자리 영문+숫자)
    function generateTeamCode() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동되기 쉬운 문자 제외 (I, O, 0, 1)
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    window.createTeam = async function() {
      const teamName = document.getElementById('newTeamNameInput').value.trim();

      if (!teamName) {
        showToast('팀명을 입력하세요.', 'warning');
        return;
      }

      // 로그인 확인
      if (!currentUserId || !userInfo) {
        showToast('로그인이 필요합니다.', 'warning');
        return;
      }

      // 이미 팀에 속해있는지 확인
      if (currentTeamId) {
        showToast('이미 팀에 속해 있습니다. 새 팀을 만들려면 먼저 현재 팀에서 나가야 합니다.', 'warning', 4000);
        return;
      }

      try {
        // 1. 고유한 팀 ID 및 코드 생성
        const teamId = 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const teamCode = generateTeamCode();

        // 2. 팀 정보 저장
        const teamInfoRef = window.dbRef(window.db, `teams/${teamId}/info`);
        await window.dbSet(teamInfoRef, {
          teamId: teamId,
          name: teamName,
          teamCode: teamCode,
          createdBy: currentUserId,
          createdAt: new Date().toISOString()
        });

        // 3. 팀원 목록에 생성자 추가
        const memberRef = window.dbRef(window.db, `teams/${teamId}/members/${currentUserId}`);
        await window.dbSet(memberRef, {
          name: userInfo.name,
          joinedAt: new Date().toISOString(),
          role: 'creator'
        });

        // 4. 기존 개인 작업을 팀 작업으로 이전
        const personalWorksRef = window.dbRef(window.db, `companies/${currentUserId}/works`);
        const personalWorksSnapshot = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Timeout')), 15000);
          window.dbOnValue(personalWorksRef, (snapshot) => {
            clearTimeout(timeoutId);
            resolve(snapshot);
          }, { onlyOnce: true });
        });

        const teamWorklistsRef = window.dbRef(window.db, `teams/${teamId}/worklists`);

        if (personalWorksSnapshot.exists()) {
          const personalWorks = personalWorksSnapshot.val();
          console.log('📦 개인 작업 이전 중:', Object.keys(personalWorks).length, '개');

          // 개인 작업을 팀 작업으로 복사
          await window.dbSet(teamWorklistsRef, personalWorks);

          // 기존 개인 작업 삭제 (선택사항 - 필요시 주석 해제)
          // await window.dbRemove(personalWorksRef);
        } else {
          // 개인 작업이 없으면 빈 객체로 초기화
          await window.dbSet(teamWorklistsRef, {});
        }

        // 4-1. 기존 개인 현장도 팀 현장으로 이전
        const personalSitesRef = window.dbRef(window.db, `companies/${currentUserId}/sites`);
        const personalSitesSnapshot = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Timeout')), 15000);
          window.dbOnValue(personalSitesRef, (snapshot) => {
            clearTimeout(timeoutId);
            resolve(snapshot);
          }, { onlyOnce: true });
        });

        const teamSitesRef = window.dbRef(window.db, `teams/${teamId}/sites`);

        if (personalSitesSnapshot.exists()) {
          const personalSites = personalSitesSnapshot.val();
          console.log('📦 개인 현장 이전 중:', Object.keys(personalSites).length, '개');

          // 개인 현장을 팀 현장으로 복사
          await window.dbSet(teamSitesRef, personalSites);
        } else {
          // 개인 현장이 없으면 빈 객체로 초기화
          await window.dbSet(teamSitesRef, {});
        }

        // 5. 사용자의 currentTeamId 업데이트
        const userInfoRef = window.dbRef(window.db, `users/${currentUserId}/info`);
        await window.dbUpdate(userInfoRef, {
          currentTeamId: teamId
        });

        // 6. 전역 변수 업데이트
        currentTeamId = teamId;
        userInfo.currentTeamId = teamId;

        showToast(`팀이 생성되었습니다! (팀코드: ${teamCode})`, 'success', 4000);

        // 입력 필드 초기화
        document.getElementById('newTeamNameInput').value = '';

        toggleCreateTeamModal();

        // 팀 선택 모달도 닫기
        const teamSelectionModal = document.getElementById('teamSelectionModal');
        if (teamSelectionModal && teamSelectionModal.classList.contains('active')) {
          teamSelectionModal.classList.remove('active');
        }

        // 데이터 재로드 및 통계 캐시 무효화
        loadWorks();
        loadSites();
        loadAssignees();
        loadAllCompaniesWorks();
        if (window.invalidateStatsCache) {
          window.invalidateStatsCache();
        }

        // 팀 설정 모달 자동으로 열기
        setTimeout(() => {
          toggleTeamSettingsModal();
        }, 500);

        console.log('팀 생성 완료:', teamId, teamCode);

      } catch (error) {
        console.error('팀 생성 실패:', error);
        showToast('팀 생성에 실패했습니다: ' + error.message, 'error', 4000);
      }
    };

    window.joinTeam = async function() {
      const teamCode = document.getElementById('joinTeamCodeInput').value.trim().toUpperCase();

      if (!teamCode) {
        showToast('팀코드를 입력하세요.', 'warning');
        return;
      }

      if (teamCode.length !== UI_CONSTANTS.TEAM_CODE_LENGTH) {
        showToast('팀코드는 6자리입니다.', 'warning');
        return;
      }

      // 로그인 확인
      if (!currentUserId || !userInfo) {
        showToast('로그인이 필요합니다.', 'warning');
        return;
      }

      // 이미 팀에 속해있는지 확인
      if (currentTeamId) {
        showToast('이미 팀에 속해 있습니다. 새 팀에 참여하려면 먼저 현재 팀에서 나가야 합니다.', 'warning', 4000);
        return;
      }

      try {
        // 1. 팀코드로 팀 찾기
        const teamsRef = window.dbRef(window.db, 'teams');
        const teamsSnapshot = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Timeout')), 10000);
          window.dbOnValue(teamsRef, (snapshot) => {
            clearTimeout(timeoutId);
            resolve(snapshot);
          }, { onlyOnce: true });
        });

        let foundTeamId = null;
        let foundTeamInfo = null;

        if (teamsSnapshot.exists()) {
          const teams = teamsSnapshot.val();
          for (const teamId in teams) {
            if (teams[teamId].info && teams[teamId].info.teamCode === teamCode) {
              foundTeamId = teamId;
              foundTeamInfo = teams[teamId].info;
              break;
            }
          }
        }

        if (!foundTeamId) {
          showToast('존재하지 않는 팀코드입니다.', 'error');
          return;
        }

        // 2. 팀에 멤버로 추가
        const memberRef = window.dbRef(window.db, `teams/${foundTeamId}/members/${currentUserId}`);
        await window.dbSet(memberRef, {
          name: userInfo.name,
          joinedAt: new Date().toISOString(),
          role: 'member'
        });

        // 3. 사용자의 currentTeamId 업데이트
        const userInfoRef = window.dbRef(window.db, `users/${currentUserId}/info`);
        await window.dbUpdate(userInfoRef, {
          currentTeamId: foundTeamId
        });

        // 4. 전역 변수 업데이트
        currentTeamId = foundTeamId;
        userInfo.currentTeamId = foundTeamId;

        showToast(`팀에 참여했습니다! (${foundTeamInfo.name})`, 'success', 4000);

        // 입력 필드 초기화
        document.getElementById('joinTeamCodeInput').value = '';

        toggleJoinTeamModal();

        // 데이터 재로드 및 통계 캐시 무효화
        loadWorks();
        loadSites();
        loadAssignees();
        loadAllCompaniesWorks();
        if (window.invalidateStatsCache) {
          window.invalidateStatsCache();
        }

        console.log('팀 참여 완료:', foundTeamId);

      } catch (error) {
        console.error('팀 참여 실패:', error);
        showToast('팀 참여에 실패했습니다: ' + error.message, 'error', 4000);
      }
    };

    window.copyTeamCodeForInvite = function() {
      if (!teamInfo || !teamInfo.teamCode) {
        showToast('팀코드를 불러올 수 없습니다.', 'error');
        return;
      }

      const code = teamInfo.teamCode;
      const btn = document.getElementById('copyInviteCodeBtn');

      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          if (btn) {
            btn.innerHTML = '<i data-lucide="check" style="width: 14px; height: 14px; vertical-align: text-bottom;"></i> 복사완료!';
            btn.style.background = '#4caf50';
            if (window.lucide) lucide.createIcons();

            setTimeout(() => {
              btn.innerHTML = '<i data-lucide="clipboard" style="width: 14px; height: 14px; vertical-align: text-bottom;"></i> 코드 복사하기';
              btn.style.background = '';
              if (window.lucide) lucide.createIcons();
            }, 2000);
          }

          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }).catch(err => {
          showToast('복사 실패: ' + err.message, 'error');
        });
      } else {
        showToast('클립보드 기능을 사용할 수 없습니다.', 'error');
      }
    };

    window.inviteByUserId = async function() {
      const inputElement = document.getElementById('inviteUserIdInput');
      const userId = inputElement.value.trim();

      if (!userId) {
        showToast('사용자 ID를 입력하세요.', 'warning');
        return;
      }

      if (!currentTeamId || !teamInfo) {
        showToast('팀 정보를 불러올 수 없습니다.', 'error');
        return;
      }

      try {
        // 1. 해당 사용자가 존재하는지 확인
        const userRef = window.dbRef(window.db, `users/${userId}/info`);
        const userSnapshot = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Timeout')), 15000);
          window.dbOnValue(userRef, (snapshot) => {
            clearTimeout(timeoutId);
            resolve(snapshot);
          }, { onlyOnce: true });
        });

        if (!userSnapshot.exists()) {
          showToast('존재하지 않는 사용자 ID입니다.', 'error');
          inputElement.blur(); // 키보드 내리기
          return;
        }

        const targetUser = userSnapshot.val();

        // 2. 이미 팀원인지 확인
        const memberRef = window.dbRef(window.db, `teams/${currentTeamId}/members/${userId}`);
        const memberSnapshot = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Timeout')), 15000);
          window.dbOnValue(memberRef, (snapshot) => {
            clearTimeout(timeoutId);
            resolve(snapshot);
          }, { onlyOnce: true });
        });

        if (memberSnapshot.exists()) {
          showToast('이미 팀에 소속된 사용자입니다.', 'warning');
          inputElement.blur(); // 키보드 내리기
          return;
        }

        // 3. 초대하려는 사용자가 다른 팀에 소속되어 있는지 확인
        if (targetUser.currentTeamId) {
          showToast('해당 사용자는 이미 다른 팀에 소속되어 있습니다.', 'warning');
          inputElement.blur(); // 키보드 내리기
          return;
        }

        // 4. 초대 생성
        const invitationsRef = window.dbRef(window.db, `users/${userId}/invitations`);
        const newInvitationRef = window.dbPush(invitationsRef);
        await window.dbSet(newInvitationRef, {
          teamId: currentTeamId,
          teamName: teamInfo.name,
          invitedBy: currentUserId,
          inviterName: userInfo.name,
          createdAt: new Date().toISOString(),
          status: 'pending'
        });

        showToast(`${targetUser.name}님에게 초대를 보냈습니다.`, 'success');
        inputElement.value = '';
        inputElement.blur(); // 키보드 내리기
      } catch (error) {
        console.error('초대 실패:', error);
        showToast('초대 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
        inputElement.blur(); // 키보드 내리기
      }
    };

    // (삭제됨 - 987번 줄의 async 함수로 대체)

    // 초대 목록 모달 토글
    window.toggleInvitationsModal = async function() {
      const modal = document.getElementById('invitationsModal');
      if (modal) {
        const isOpening = !modal.classList.contains('active');

        if (isOpening && currentUserId) {
          await loadInvitations();
        }

        modal.classList.toggle('active');
      }
    };

    // 초대 목록 로드
    async function loadInvitations() {
      try {
        const invitationsRef = window.dbRef(window.db, `users/${currentUserId}/invitations`);
        const snapshot = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Timeout')), 15000);
          window.dbOnValue(invitationsRef, (snapshot) => {
            clearTimeout(timeoutId);
            resolve(snapshot);
          }, { onlyOnce: true });
        });

        const invitationsList = document.getElementById('invitationsList');
        invitationsList.innerHTML = '';

        if (!snapshot.exists()) {
          invitationsList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px 20px;">받은 초대가 없습니다</p>';
          updateInvitationBadge(0);
          return;
        }

        const invitations = snapshot.val();
        const pendingInvitations = Object.entries(invitations).filter(([id, inv]) => inv.status === 'pending');

        if (pendingInvitations.length === 0) {
          invitationsList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px 20px;">받은 초대가 없습니다</p>';
          updateInvitationBadge(0);
          return;
        }

        updateInvitationBadge(pendingInvitations.length);

        pendingInvitations.forEach(([invitationId, invitation]) => {
          const invitationCard = document.createElement('div');
          invitationCard.style.cssText = 'border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: white;';

          const date = new Date(invitation.createdAt).toLocaleString('ko-KR');

          invitationCard.innerHTML = `
            <div style="margin-bottom: 12px;">
              <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 5px;">
                ${invitation.teamName}
              </div>
              <div style="font-size: 13px; color: #666;">
                <strong>${invitation.inviterName}</strong>님이 초대했습니다
              </div>
              <div style="font-size: 12px; color: #999; margin-top: 5px;">
                ${date}
              </div>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="admin-btn" onclick="acceptInvitation('${invitationId}', '${invitation.teamId}')" style="flex: 1; background: #4caf50;">
                <i data-lucide="check" style="width: 14px; height: 14px; vertical-align: text-bottom;"></i> 수락
              </button>
              <button class="admin-btn" onclick="rejectInvitation('${invitationId}')" style="flex: 1; background: #f44336;">
                <i data-lucide="x" style="width: 14px; height: 14px; vertical-align: text-bottom;"></i> 거절
              </button>
            </div>
          `;

          invitationsList.appendChild(invitationCard);
        });

        // Lucide 아이콘 초기화
        if (window.lucide) lucide.createIcons();

      } catch (error) {
        console.error('초대 목록 로드 실패:', error);
      }
    }

    // 초대 배지 업데이트
    function updateInvitationBadge(count) {
      const badge = document.getElementById('invitationBadge');
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline';
      } else {
        badge.style.display = 'none';
      }
    }

    // 초대 수락
    window.acceptInvitation = async function(invitationId, teamId) {
      try {
        // 1. 현재 팀이 있는지 확인
        if (currentTeamId) {
          if (!confirm('다른 팀에 소속되어 있습니다. 현재 팀을 나가고 새 팀에 참여하시겠습니까?')) {
            return;
          }
          // 현재 팀 나가기
          await leaveCurrentTeam();
        }

        // 2. 새 팀에 참여
        const memberRef = window.dbRef(window.db, `teams/${teamId}/members/${currentUserId}`);
        await window.dbSet(memberRef, {
          name: userInfo.name,
          joinedAt: new Date().toISOString(),
          role: 'member'
        });

        // 3. 사용자 정보 업데이트
        const userInfoRef = window.dbRef(window.db, `users/${currentUserId}/info`);
        await window.dbUpdate(userInfoRef, {
          currentTeamId: teamId
        });

        // 4. 초대 상태 업데이트
        const invitationRef = window.dbRef(window.db, `users/${currentUserId}/invitations/${invitationId}`);
        await window.dbUpdate(invitationRef, {
          status: 'accepted',
          acceptedAt: new Date().toISOString()
        });

        // 5. 전역 변수 업데이트
        currentTeamId = teamId;
        teamInfo = null;

        showToast('팀 초대를 수락했습니다!', 'success');

        // 팀 선택 모달 닫기
        const teamSelectionModal = document.getElementById('teamSelectionModal');
        if (teamSelectionModal && teamSelectionModal.classList.contains('active')) {
          teamSelectionModal.classList.remove('active');
        }

        // 초대 모달 닫기
        const invitationsModal = document.getElementById('invitationsModal');
        if (invitationsModal) {
          invitationsModal.classList.remove('active');
        }

        // 초대 배지 업데이트 (0으로 설정)
        updateInvitationBadge(0);

        // 페이지 새로고침 대신 데이터 다시 로드
        loadWorks();
        loadSites();
        loadAssignees();
        loadAllCompaniesWorks();

        // 통계 캐시 무효화
        if (window.invalidateStatsCache) {
          window.invalidateStatsCache();
        }

        console.log('✅ 팀 데이터 재로드 완료');
      } catch (error) {
        console.error('초대 수락 실패:', error);
        showToast('초대 수락 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
      }
    };

    // 초대 거절
    window.rejectInvitation = async function(invitationId) {
      if (!confirm('이 초대를 거절하시겠습니까?')) {
        return;
      }

      try {
        const invitationRef = window.dbRef(window.db, `users/${currentUserId}/invitations/${invitationId}`);
        await window.dbUpdate(invitationRef, {
          status: 'rejected',
          rejectedAt: new Date().toISOString()
        });

        showToast('초대를 거절했습니다.', 'info');

        // 두 곳의 초대 리스트 모두 새로고침
        await loadInvitations();
        await loadInvitationsInTeamSelection();
      } catch (error) {
        console.error('초대 거절 실패:', error);
        showToast('초대 거절 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
      }
    };

    // 현재 팀 나가기 (초대 수락 시 사용)
    async function leaveCurrentTeam() {
      const memberRef = window.dbRef(window.db, `teams/${currentTeamId}/members/${currentUserId}`);
      await window.dbRemove(memberRef);
    }

    // 팀 설정 모달에서 팀코드 복사
    window.copyTeamCodeFromSettings = function() {
      if (!teamInfo || !teamInfo.teamCode) {
        showToast('팀코드를 불러올 수 없습니다.', 'error');
        return;
      }

      const code = teamInfo.teamCode;
      const btn = document.getElementById('copySettingsCodeBtn');

      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          if (btn) {
            btn.innerHTML = '<i data-lucide="check" style="width: 14px; height: 14px; vertical-align: text-bottom;"></i> 복사완료!';
            btn.style.background = '#4caf50';
            if (window.lucide) lucide.createIcons();

            setTimeout(() => {
              btn.innerHTML = '<i data-lucide="clipboard" style="width: 14px; height: 14px; vertical-align: text-bottom;"></i> 코드 복사하기';
              btn.style.background = '';
              if (window.lucide) lucide.createIcons();
            }, 2000);
          }

          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }).catch(err => {
          showToast('복사 실패: ' + err.message, 'error');
        });
      } else {
        showToast('클립보드 기능을 사용할 수 없습니다.', 'error');
      }
    };

    // 팀코드 변경하기
    // 팀 코드 변경 버튼 상태 업데이트
    function updateChangeCodeButtonState() {
      const btn = document.getElementById('changeTeamCodeBtn');
      if (!btn || !teamInfo) return;

      const lastUpdated = teamInfo.codeUpdatedAt;
      if (!lastUpdated) {
        // 변경 이력이 없으면 활성화
        btn.disabled = false;
        btn.textContent = '🔄 팀코드 변경';
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        return;
      }

      const lastUpdatedTime = new Date(lastUpdated).getTime();
      const now = Date.now();
      const timeDiff = now - lastUpdatedTime;

      if (timeDiff < UI_CONSTANTS.CODE_CHANGE_COOLDOWN) {
        // 5분 미만이면 비활성화
        const remainingSeconds = Math.ceil((UI_CONSTANTS.CODE_CHANGE_COOLDOWN - timeDiff) / TIME.SECOND);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        btn.disabled = true;
        btn.textContent = `⏳ ${minutes}:${seconds.toString().padStart(2, '0')} 후 변경 가능`;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';

        // 1초마다 업데이트
        setTimeout(updateChangeCodeButtonState, TIME.SECOND);
      } else {
        // 5분 이상 지났으면 활성화
        btn.disabled = false;
        btn.textContent = '🔄 팀코드 변경';
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    }

    window.changeTeamCode = async function() {
      if (!currentTeamId || !teamInfo) {
        showToast('팀 정보를 불러올 수 없습니다.', 'error');
        return;
      }

      // 5분 제한 확인
      const lastUpdated = teamInfo.codeUpdatedAt;
      if (lastUpdated) {
        const lastUpdatedTime = new Date(lastUpdated).getTime();
        const now = Date.now();
        const timeDiff = now - lastUpdatedTime;

        if (timeDiff < UI_CONSTANTS.CODE_CHANGE_COOLDOWN) {
          const remainingSeconds = Math.ceil((UI_CONSTANTS.CODE_CHANGE_COOLDOWN - timeDiff) / TIME.SECOND);
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = remainingSeconds % 60;
          showToast(`팀코드는 ${minutes}분 ${seconds}초 후에 변경할 수 있습니다.`, 'warning', 4000);
          return;
        }
      }

      const confirmed = confirm('⚠️ 팀코드를 변경하시겠습니까?\n\n새로운 코드가 생성되며, 기존 코드로는 더 이상 팀에 가입할 수 없습니다.\n\n※ 기존 팀원은 영향받지 않습니다.');

      if (!confirmed) return;

      try {
        // 새 팀코드 생성
        const newTeamCode = generateTeamCode();
        const now = new Date().toISOString();

        // Firebase에 업데이트 (info 경로 수정)
        const teamInfoRef = window.dbRef(window.db, `teams/${currentTeamId}/info`);
        await window.dbUpdate(teamInfoRef, {
          teamCode: newTeamCode,
          codeUpdatedAt: now
        });

        showToast('✅ 팀코드가 변경되었습니다!', 'success');

        if (navigator.vibrate) {
          navigator.vibrate([50, 100, 50]);
        }
      } catch (error) {
        console.error('팀코드 변경 실패:', error);
        showToast('팀코드 변경에 실패했습니다.', 'error');
      }
    };

    // 팀 설정 모달에서 ID로 초대
    window.inviteByUserIdFromSettings = async function() {
      const userId = document.getElementById('settingsInviteUserIdInput').value.trim();

      if (!userId) {
        showToast('사용자 ID를 입력하세요.', 'warning');
        return;
      }

      // 로그인 및 팀 확인
      if (!currentUserId || !currentTeamId) {
        showToast('팀에 속해 있지 않습니다.', 'warning');
        return;
      }

      // 자기 자신 초대 방지
      if (userId === currentUserId) {
        showToast('자기 자신은 초대할 수 없습니다.', 'warning');
        return;
      }

      try {
        // 1. 초대할 사용자가 존재하는지 확인
        const targetUserRef = window.dbRef(window.db, `users/${userId}/info`);
        const targetUserSnapshot = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Timeout')), 15000);
          window.dbOnValue(targetUserRef, (snapshot) => {
            clearTimeout(timeoutId);
            resolve(snapshot);
          }, { onlyOnce: true });
        });

        if (!targetUserSnapshot.exists()) {
          showToast('존재하지 않는 사용자 ID입니다.', 'error');
          return;
        }

        const targetUserInfo = targetUserSnapshot.val();

        // 2. 대상 사용자가 이미 다른 팀에 속해 있는지 확인
        if (targetUserInfo.currentTeamId) {
          showToast(`${targetUserInfo.name}님은 이미 다른 팀에 속해 있습니다.`, 'warning');
          return;
        }

        // 3. 이미 초대를 보냈는지 확인 (중복 초대 방지)
        const invitationsRef = window.dbRef(window.db, `users/${userId}/invitations`);
        const invitationsSnapshot = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Timeout')), 15000);
          window.dbOnValue(invitationsRef, (snapshot) => {
            clearTimeout(timeoutId);
            resolve(snapshot);
          }, { onlyOnce: true });
        });

        if (invitationsSnapshot.exists()) {
          const invitations = invitationsSnapshot.val();
          const hasPendingInvitation = Object.values(invitations).some(
            inv => inv.teamId === currentTeamId && inv.status === 'pending'
          );

          if (hasPendingInvitation) {
            showToast(`${targetUserInfo.name}님에게 이미 초대를 보냈습니다.`, 'warning');
            return;
          }
        }

        // 4. 초대 정보 생성 (바로 팀원 추가하지 않음)
        const invitationId = Date.now().toString();
        const invitationRef = window.dbRef(window.db, `users/${userId}/invitations/${invitationId}`);
        await window.dbSet(invitationRef, {
          teamId: currentTeamId,
          teamName: teamInfo.name,
          invitedBy: currentUserId,
          inviterName: userInfo.name,
          createdAt: new Date().toISOString(),
          status: 'pending'
        });

        showToast(`${targetUserInfo.name}님에게 초대를 보냈습니다. 상대방이 수락하면 팀에 추가됩니다.`, 'success', 4000);

        // 입력 필드 초기화
        document.getElementById('settingsInviteUserIdInput').value = '';

        // TODO: 팀원 목록 새로고침
        console.log('초대 완료:', userId);

      } catch (error) {
        console.error('초대 실패:', error);
        showToast('초대에 실패했습니다: ' + error.message, 'error', 4000);
      }
    };

    window.saveTeamSettings = async function() {
      const teamName = document.getElementById('editTeamNameInput').value.trim();

      if (!teamName) {
        showToast('팀명을 입력하세요.', 'warning');
        return;
      }

      // 로그인 및 팀 확인
      if (!currentUserId || !currentTeamId) {
        showToast('팀에 속해 있지 않습니다.', 'warning');
        return;
      }

      try {
        // 팀명 업데이트
        const teamInfoRef = window.dbRef(window.db, `teams/${currentTeamId}/info`);
        await window.dbUpdate(teamInfoRef, {
          name: teamName
        });

        showToast('팀 설정이 저장되었습니다.', 'success');

        // TODO: 메인 화면 새로고침하여 변경사항 반영
        console.log('팀 설정 저장 완료:', teamName);

      } catch (error) {
        console.error('팀 설정 저장 실패:', error);
        showToast('팀 설정 저장에 실패했습니다: ' + error.message, 'error', 4000);
      }
    };

    window.leaveTeam = async function() {
      if (!confirm('정말 팀을 나가시겠습니까?\n\n팀을 나가면 팀의 작업 목록에 접근할 수 없습니다.')) {
        return;
      }

      // 로그인 및 팀 확인
      if (!currentUserId || !currentTeamId) {
        showToast('팀에 속해 있지 않습니다.', 'warning');
        return;
      }

      try {
        // 1. 팀 멤버 목록에서 제거
        const memberRef = window.dbRef(window.db, `teams/${currentTeamId}/members/${currentUserId}`);
        await window.dbRemove(memberRef);

        // 2. 사용자의 currentTeamId 초기화
        const userInfoRef = window.dbRef(window.db, `users/${currentUserId}/info`);
        await window.dbUpdate(userInfoRef, {
          currentTeamId: null
        });

        // 3. 전역 변수 업데이트
        const oldTeamId = currentTeamId;
        currentTeamId = null;
        userInfo.currentTeamId = null;

        showToast('팀에서 나갔습니다. 페이지를 새로고침합니다.', 'success', 2000);

        // 팀 설정 모달 닫기
        const modal = document.getElementById('teamSettingsModal');
        if (modal && modal.classList.contains('active')) {
          modal.classList.remove('active');
        }

        console.log('팀 나가기 완료:', oldTeamId);

        // 페이지 새로고침 대신 데이터 다시 로드
        loadWorks();
        loadSites();
        loadAssignees();
        loadAllCompaniesWorks();
        loadInvitations();

        console.log('✅ 데이터 재로드 완료 - 이전 팀 작업 목록 제거됨');

      } catch (error) {
        console.error('팀 나가기 실패:', error);
        showToast('팀 나가기에 실패했습니다: ' + error.message, 'error', 4000);
      }
    };

    window.toggleStaffManageModal = function() {
      console.log('👥 직원 관리 모달 토글');
      const modal = document.getElementById('staffManageModal');
      
      if (!modal) {
        console.error('❌ staffManageModal을 찾을 수 없습니다');
        return;
      }
      
      if (!modal.classList.contains('active')) {
        console.log('✅ 모달 열기 - 직원 목록 렌더링');
        renderStaffList();
      }
      
      modal.classList.toggle('active');
      console.log(modal.classList.contains('active') ? '✅ 열림' : '✅ 닫힘');
    };
    
    window.toggleCompanyInfoModal = function() {
      console.log('🏢 회사 정보 모달 토글');
      const modal = document.getElementById('companyInfoModal');
      
      if (!modal) {
        console.error('❌ companyInfoModal을 찾을 수 없습니다');
        return;
      }
      
      if (!modal.classList.contains('active')) {
        console.log('✅ 모달 열기 - 회사 정보 로드');
        
        if (companyInfo) {
          document.getElementById('editCompanyName').value = companyInfo.name || '';
          console.log('✅ 회사명 로드:', companyInfo.name);
        } else {
          console.error('❌ companyInfo가 없습니다');
          document.getElementById('editCompanyName').value = '';
        }
        
        document.getElementById('currentPasswordForEdit').value = '';
        document.getElementById('newPasswordForEdit').value = '';
        document.getElementById('confirmNewPassword').value = '';
      }
      
      modal.classList.toggle('active');
      console.log(modal.classList.contains('active') ? '✅ 열림' : '✅ 닫힘');
    };
    
    window.toggleTransferAdminModal = function() {
      console.log('🔄 권한 이전 모달 토글');
      const modal = document.getElementById('transferAdminModal');
      
      if (!modal) {
        console.error('❌ transferAdminModal을 찾을 수 없습니다');
        return;
      }
      
      if (!modal.classList.contains('active')) {
        console.log('✅ 모달 열기 - 직원 목록 렌더링');
        renderTransferAdminList();
        document.getElementById('passwordForTransfer').value = '';
      }
      
      modal.classList.toggle('active');
      console.log(modal.classList.contains('active') ? '✅ 열림' : '✅ 닫힘');
    };
    
    console.log('✅ 모든 모달 토글 함수 정의 완료');
    
    // ========================================
    // 이제 원래 코드 시작
    // ========================================
    
    // 문자열 유사도 계산 함수
    function calculateSimilarity(str1, str2) {
      if (!str1 || !str2) return 0;
      
      str1 = str1.toLowerCase().replace(/\s+/g, '');
      str2 = str2.toLowerCase().replace(/\s+/g, '');
      
      if (str1 === str2) return 100;
      
      const len1 = str1.length;
      const len2 = str2.length;
      
      if (len1 === 0 || len2 === 0) return 0;
      
      const matrix = [];
      for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
      }
      
      for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
          const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }
      
      const distance = matrix[len1][len2];
      const maxLen = Math.max(len1, len2);
      const similarity = ((maxLen - distance) / maxLen) * 100;
      
      return similarity;
    }
    
    function areSitesSimilar(site1Name, site1Address, site2Name, site2Address) {
      const full1 = (site1Name || '') + ' ' + (site1Address || '');
      const full2 = (site2Name || '') + ' ' + (site2Address || '');
      
      const similarity = calculateSimilarity(full1, full2);
      
      console.log(`🔍 현장 비교: "${site1Name}" vs "${site2Name}" | 유사도: ${similarity.toFixed(1)}%`);
      
      return similarity >= 80;
    }

    let currentDate = new Date();
    let works = {};
    let assignees = [];
    let sites = {};
    let allCompaniesWorks = {};
    let currentUser = null;
    let currentCompanyId = null;
    let currentUserId = null;
    let isAdmin = false;
    let companyInfo = null;
    let userInfo = null;
    let currentTeamId = null;
    let teamInfo = null;
    let map = null;
    let currentMarker = null;
    let currentLocationMarker = null;
    let routeMarkers = [];
    let routeLine = null;
    let currentPosition = null;
    let isRouteDisplayed = false;
    let draggedElement = null;
    let draggedWorkId = null;
    let originalOrder = [];
    let isDraggingNow = false;
    let selectedCard = null;
    let currentEditingSiteId = null;
    let sectionStates = {
      myActive: true,
      teamActive: true,
      completed: true
    };
    
    function waitForFirebase() {
      if (window.firebaseReady) {
        initApp();
      } else {
        setTimeout(waitForFirebase, 100);
      }
    }
    
    function initApp() {
      console.log('✅ 앱 초기화 시작');
      document.getElementById('companyLoginStep').style.display = 'block';
      checkSavedCompany();
    }
    
    async function checkSavedCompany() {
      // 보안을 위해 자동 로그인 기능 제거, ID만 기억
      showLoginScreen();
    }

    function showLoginScreen() {
      document.getElementById('companyLoginStep').style.display = 'block';

      const savedUserId = localStorage.getItem('savedUserId');
      if (savedUserId) {
        document.getElementById('companyIdInput').value = savedUserId;
      }
    }

    function clearAutoLogin() {
      localStorage.removeItem('autoLogin');
      localStorage.removeItem('savedUserId');
      localStorage.removeItem('savedPassword');
    }
    
    async function checkCompanyIdAvailability(userId) {
      return new Promise((resolve) => {
        const usersRef = window.dbRef(window.db, 'users');
        window.dbOnValue(usersRef, (snapshot) => {
          const users = snapshot.val();

          if (!users) {
            resolve(true);
            return;
          }

          const exists = Object.keys(users).some(id => id === userId);
          resolve(!exists);
        }, { onlyOnce: true });
      });
    }
    
    window.loginCompany = async function() {
      const userId = document.getElementById('companyIdInput').value.trim();
      const password = document.getElementById('companyPasswordInput').value;

      if (!userId) {
        showToast('ID를 입력하세요.', 'warning');
        return;
      }

      if (!password) {
        showToast('비밀번호를 입력하세요.', 'warning');
        return;
      }

      try {
        console.log('🔐 로그인 시도:', userId);

        // Firebase 연결 확인
        if (!window.db || !window.dbRef || !window.dbOnValue) {
          console.error('❌ Firebase가 초기화되지 않았습니다');
          showToast('데이터베이스 연결 오류. 페이지를 새로고침 해주세요.', 'error', 4000);
          return;
        }
        console.log('✅ Firebase 연결 확인 완료');

        // 1. 사용자 정보 확인
        const userRef = window.dbRef(window.db, `users/${userId}/info`);
        console.log('📡 Firebase에서 사용자 정보 조회 시작:', `users/${userId}/info`);

        const userData = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            console.error('⏰ 15초 타임아웃 - Firebase 응답 없음. Security Rules를 확인하세요.');
            reject(new Error('Timeout'));
          }, 15000);

          let unsubscribe;

          try {
            unsubscribe = window.dbOnValue(userRef,
              (snapshot) => {
                console.log('📨 Firebase 응답 수신:', snapshot.exists() ? '데이터 있음' : '데이터 없음');
                clearTimeout(timeoutId);
                if (unsubscribe) unsubscribe();
                resolve(snapshot.val());
              },
              (error) => {
                console.error('🚫 Firebase 읽기 권한 에러:', error.message);
                clearTimeout(timeoutId);
                reject(error);
              }
            );
          } catch (error) {
            console.error('🚫 Firebase onValue 호출 실패:', error);
            clearTimeout(timeoutId);
            reject(error);
          }
        });

        if (!userData) {
          showToast('존재하지 않는 ID입니다.', 'error');
          return;
        }

        // 비밀번호 확인 (평문 비교)
        console.log('🔐 비밀번호 확인 중...');

        if (userData.password !== password) {
          showToast('비밀번호가 일치하지 않습니다.', 'error');
          return;
        }

        console.log('✅ 비밀번호 확인 완료');

        // 2. 전역 변수 설정
        currentUserId = userId;
        currentUser = userData.name;
        currentTeamId = userData.currentTeamId || null;
        currentCompanyId = userId; // 기존 코드 호환성을 위해
        userInfo = userData;

        // 3. ID만 저장 (보안을 위해 비밀번호는 저장하지 않음)
        localStorage.setItem('savedUserId', userId);
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('savedPassword');
        console.log('ℹ️ 사용자 ID만 저장됨 (보안상 비밀번호는 저장 안함)');

        console.log('🎉 로그인 성공! 메인 앱으로 이동...');

        // 4. 바로 메인 앱 표시
        showMainApp();

      } catch (error) {
        console.error('❌ 로그인 오류:', error);
        if (error.message === 'Timeout') {
          showToast('네트워크 연결이 느립니다. 잠시 후 다시 시도해주세요.', 'error', 4000);
        } else {
          showToast('로그인 중 오류가 발생했습니다. 다시 시도해주세요.', 'error', 4000);
        }
      }
    };
    
    window.showCreateCompanyStep = function() {
      document.getElementById('companyLoginStep').style.display = 'none';
      document.getElementById('createCompanyStep').style.display = 'block';
    };

    window.backToCompanyLogin = function() {
      document.getElementById('createCompanyStep').style.display = 'none';
      document.getElementById('companyLoginStep').style.display = 'block';
      
      document.getElementById('newCompanyNameInput').value = '';
      document.getElementById('newAdminNameInput').value = '';
      document.getElementById('newCompanyIdInput').value = '';
      document.getElementById('newCompanyPasswordInput').value = '';
      document.getElementById('confirmPasswordInput').value = '';
      document.getElementById('companyIdHint').textContent = '영문, 숫자 조합 (4-20자)';
      document.getElementById('companyIdHint').className = 'input-hint';
    };
    
    let checkTimeout;
    document.addEventListener('DOMContentLoaded', function() {
      const companyIdInput = document.getElementById('newCompanyIdInput');
      if (companyIdInput) {
        companyIdInput.addEventListener('input', function() {
          clearTimeout(checkTimeout);
          const companyId = this.value.trim();
          const hint = document.getElementById('companyIdHint');
          
          if (!companyId) {
            hint.textContent = '영문, 숫자 조합 (4-20자)';
            hint.className = 'input-hint';
            return;
          }
          
          const regex = /^[a-zA-Z0-9]{4,20}$/;
          if (!regex.test(companyId)) {
            hint.textContent = '❌ 영문, 숫자만 사용 가능 (4-20자)';
            hint.className = 'input-hint error';
            return;
          }
          
          hint.textContent = '확인 중...';
          hint.className = 'input-hint';
          
          checkTimeout = setTimeout(async () => {
            const available = await checkCompanyIdAvailability(companyId);
            if (available) {
              hint.textContent = '✅ 사용 가능한 ID입니다';
              hint.className = 'input-hint success';
            } else {
              hint.textContent = '❌ 이미 사용 중인 ID입니다';
              hint.className = 'input-hint error';
            }
          }, 500);
        });
      }
    });

    window.createCompany = async function() {
      const userId = document.getElementById('newCompanyIdInput').value.trim();
      const password = document.getElementById('newCompanyPasswordInput').value;
      const confirmPassword = document.getElementById('confirmPasswordInput').value;
      const userName = document.getElementById('newAdminNameInput').value.trim();

      if (!userName) {
        showToast('이름을 입력하세요.', 'warning');
        return;
      }

      if (!userId) {
        showToast('ID를 입력하세요.', 'warning');
        return;
      }

      const regex = /^[a-zA-Z0-9]{4,20}$/;
      if (!regex.test(userId)) {
        showToast('ID는 영문과 숫자 조합으로 4-20자여야 합니다.', 'warning', 4000);
        return;
      }

      if (!password) {
        showToast('비밀번호를 입력하세요.', 'warning');
        return;
      }

      if (password.length < 4) {
        showToast('비밀번호는 최소 4자 이상이어야 합니다.', 'warning');
        return;
      }

      if (password !== confirmPassword) {
        showToast('비밀번호가 일치하지 않습니다.', 'warning');
        return;
      }

      const available = await checkCompanyIdAvailability(userId);
      if (!available) {
        showToast('이미 사용 중인 ID입니다.', 'error');
        return;
      }

      try {
        // Firebase 연결 확인
        if (!window.db || !window.dbRef || !window.dbSet) {
          console.error('❌ Firebase가 초기화되지 않았습니다');
          showToast('데이터베이스 연결 오류. 페이지를 새로고침 해주세요.', 'error', 4000);
          return;
        }

        // 1. 사용자 정보 생성
        console.log('📝 사용자 정보 생성 중...');
        const userInfoRef = window.dbRef(window.db, `users/${userId}/info`);

        await window.dbSet(userInfoRef, {
          userId: userId,
          name: userName,
          password: password, // 평문으로 저장
          currentTeamId: null,
          createdAt: new Date().toISOString()
        });

        console.log('✅ 사용자 정보 생성 완료');

        // 2. 개인 작업 목록 초기화
        const personalWorklistsRef = window.dbRef(window.db, `users/${userId}/personalWorklists`);
        await window.dbSet(personalWorklistsRef, {});

        // 3. companies 구조 초기화 (기존 코드 호환성)
        const companiesWorksRef = window.dbRef(window.db, `companies/${userId}/works`);
        await window.dbSet(companiesWorksRef, {});

        const companiesSitesRef = window.dbRef(window.db, `companies/${userId}/sites`);
        await window.dbSet(companiesSitesRef, {});

        // 4. 전역 변수 설정
        currentUserId = userId;
        currentUser = userName;
        currentTeamId = null;

        userInfo = {
          userId: userId,
          name: userName,
          password: password,
          currentTeamId: null,
          createdAt: new Date().toISOString()
        };

        localStorage.setItem('currentUserId', userId);

        showToast(`가입 완료! (${userName})`, 'success', 4000);

        console.log('🎉 회원가입 완료! 로그인 화면으로 이동...');

        // 5. 로그인 화면으로 돌아가기
        document.getElementById('createCompanyStep').style.display = 'none';
        document.getElementById('companyLoginStep').style.display = 'block';

        // 입력란 초기화
        document.getElementById('newAdminNameInput').value = '';
        document.getElementById('newCompanyIdInput').value = '';
        document.getElementById('newCompanyPasswordInput').value = '';
        document.getElementById('confirmPasswordInput').value = '';

        // 로그인 ID 자동 입력
        document.getElementById('companyIdInput').value = userId;

      } catch (error) {
        console.error('❌ 회원가입 중 오류:', error);
        if (error.message === 'Timeout') {
          showToast('네트워크 연결이 느립니다. 잠시 후 다시 시도해주세요.', 'error', 4000);
        } else {
          showToast('회원가입 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
        }
      }
    };
    
    function generateCompanyCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }
    
    function initMap() {
      if (typeof kakao === 'undefined' || !kakao.maps) {
        console.error('카카오맵 API가 로드되지 않았습니다.');
        document.getElementById('map').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;text-align:center;padding:20px;">카카오맵을 불러오는 중입니다...</div>';
        setTimeout(() => {
          if (typeof kakao !== 'undefined' && kakao.maps) {
            initMap();
          }
        }, TIME.SECOND);
        return;
      }
      try {
        const container = document.getElementById('map');
        const options = {
          center: new kakao.maps.LatLng(37.5665, 126.9780),
          level: 3
        };
        map = new kakao.maps.Map(container, options);
        const mapTypeControl = new kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
        setTimeout(() => {
          map.relayout();
        }, 100);
        console.log('✅ 지도 초기화 성공!');

        // 지도 초기화 완료 후 경로 다시 그리기
        setTimeout(() => {
          console.log('🗺️ 지도 초기화 완료 - 경로 업데이트 시작');
          triggerMapUpdate();
        }, 200);
      } catch (error) {
        console.error('❌ 지도 초기화 실패:', error);
        document.getElementById('map').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;text-align:center;padding:20px;">지도를 불러올 수 없습니다.<br>페이지를 새로고침 해주세요.</div>';
      }
    }

    // 지도 초기화 후 경로 업데이트를 위한 헬퍼 함수
    function triggerMapUpdate() {
      if (!map) {
        console.log('⚠️ 지도가 아직 초기화되지 않음');
        return;
      }

      const searchDate = currentDate.toISOString().split('T')[0];
      const myActiveWorks = [];

      Object.keys(works).forEach(workId => {
        const work = works[workId];
        if (work.completed) return;
        if (work.assignee !== currentUser) return;
        let shouldShow = false;
        if (work.work === '시험' || work.parentWorkId) {
          shouldShow = work.date === searchDate;
        } else {
          shouldShow = work.date <= searchDate;
        }
        if (shouldShow) {
          myActiveWorks.push({ ...work, id: workId });
        }
      });

      // 순서대로 정렬
      myActiveWorks.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 999;
        const orderB = typeof b.order === 'number' ? b.order : 999;
        if (orderA === orderB) {
          return a.id.localeCompare(b.id);
        }
        return orderA - orderB;
      });

      console.log('🗺️ 경로 업데이트:', myActiveWorks.length, '개 작업');
      updateMapAutomatically(myActiveWorks);
    }
    
    // 자동 지도 업데이트 함수
    let updateMapTimeout = null;
    function updateMapAutomatically(myActiveWorks) {
      if (!map) {
        console.log('⚠️ 지도가 초기화되지 않음');
        return;
      }

      // 이전 타이머 취소 (중복 호출 방지)
      if (updateMapTimeout) {
        clearTimeout(updateMapTimeout);
      }

      // 300ms 후에 실행 (디바운싱)
      updateMapTimeout = setTimeout(() => {
        console.log('🗺️ 지도 자동 업데이트:', myActiveWorks.length, '개 작업');
        performMapUpdate(myActiveWorks);
      }, 300);
    }

    function performMapUpdate(myActiveWorks) {

      // 내 작업이 있으면 경로 표시
      if (myActiveWorks.length > 0) {
        // 현재 위치 가져오기 (자동, 조용하게)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function(position) {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              currentPosition = new kakao.maps.LatLng(lat, lng);
              drawRouteFromCurrentLocation(currentPosition, myActiveWorks);
            },
            function(error) {
              // 위치 실패 시 첫 번째 현장 중심으로 표시
              console.log('⚠️ 위치 가져오기 실패, 첫 번째 현장으로 표시');
              showFirstSiteOnMap(myActiveWorks);
            },
            {
              enableHighAccuracy: false,
              timeout: UI_CONSTANTS.API_TIMEOUT,
              maximumAge: TIME.MINUTE * 5 // 5분 캐시
            }
          );
        } else {
          // Geolocation 미지원 시 첫 번째 현장 표시
          showFirstSiteOnMap(myActiveWorks);
        }
      } else {
        console.log('📍 내 작업 없음 - 기존 경로 제거');
        // 기존 경로 완전 제거
        if (currentLocationMarker) {
          currentLocationMarker.setMap(null);
          currentLocationMarker = null;
        }
        routeMarkers.forEach(marker => {
          if (marker) marker.setMap(null);
        });
        routeMarkers = [];
        if (routeLine) {
          if (Array.isArray(routeLine)) {
            routeLine.forEach(line => {
              if (line) line.setMap(null);
            });
          } else {
            routeLine.setMap(null);
          }
          routeLine = null;
        }

        // 경로 정보 텍스트 숨기기
        const routeInfo = document.getElementById('routeInfo');
        if (routeInfo) {
          routeInfo.style.display = 'none';
          routeInfo.textContent = '';
        }

        // 내 작업이 없으면 현재 위치 중심으로 표시
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function(position) {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              const myPosition = new kakao.maps.LatLng(lat, lng);

              // 기존 마커 제거
              if (currentLocationMarker) {
                currentLocationMarker.setMap(null);
              }
              routeMarkers.forEach(marker => marker.setMap(null));
              routeMarkers = [];
              if (routeLine) {
                if (Array.isArray(routeLine)) {
                  routeLine.forEach(line => line.setMap(null));
                } else {
                  routeLine.setMap(null);
                }
                routeLine = null;
              }

              // 내 위치 마커 표시
              currentLocationMarker = new kakao.maps.Marker({
                position: myPosition,
                map: map,
                image: new kakao.maps.MarkerImage(
                  'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                  new kakao.maps.Size(24, 35)
                )
              });

              map.setCenter(myPosition);
              map.setLevel(3);
            },
            function(error) {
              console.log('⚠️ 위치 가져오기 실패');
            },
            {
              enableHighAccuracy: false,
              timeout: UI_CONSTANTS.API_TIMEOUT,
              maximumAge: TIME.MINUTE * 5
            }
          );
        }
      }
    }

    // 첫 번째 현장을 지도에 표시
    function showFirstSiteOnMap(myActiveWorks) {
      if (myActiveWorks.length === 0) return;

      const firstSiteName = myActiveWorks[0].site;
      const site = Object.values(sites).find(s => s.name === firstSiteName);

      if (!site || !site.address) {
        console.warn('⚠️ 첫 번째 현장 주소 없음');
        return;
      }

      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(site.address, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

          // 기존 마커 제거
          routeMarkers.forEach(marker => marker.setMap(null));
          routeMarkers = [];

          // 첫 번째 현장 마커 표시
          const marker = new kakao.maps.Marker({
            position: coords,
            map: map
          });
          routeMarkers.push(marker);

          map.setCenter(coords);
          map.setLevel(3);
        }
      });
    }

    window.showRouteFromCurrentLocation = function() {
      console.log('🚀 경로 표시 시작');
      if (!map) {
        showToast('지도가 초기화되지 않았습니다.', 'error');
        return;
      }
      
      const searchDate = currentDate.toISOString().split('T')[0];
      const myActiveWorks = [];
      Object.keys(works).forEach(workId => {
        const work = works[workId];
        if (work.completed) return;
        if (work.assignee !== currentUser) return;
        let shouldShow = false;
        if (work.work === '시험' || work.parentWorkId) {
          shouldShow = work.date === searchDate;
        } else {
          shouldShow = work.date <= searchDate;
        }
        if (shouldShow) {
          myActiveWorks.push(work);
        }
      });
      
      myActiveWorks.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 999;
        const orderB = typeof b.order === 'number' ? b.order : 999;
        if (orderA === orderB) {
          return a.id.localeCompare(b.id);
        }
        return orderA - orderB;
      });
      
      console.log('📋 내 작업 진행 중:', myActiveWorks.length, '개');
      if (myActiveWorks.length === 0) {
        showToast('표시할 작업이 없습니다.', 'info');
        // 경로 정보 숨기기
        const routeInfo = document.getElementById('routeInfo');
        if (routeInfo) {
          routeInfo.style.display = 'none';
          routeInfo.textContent = '';
        }
        return;
      }
      
      if (navigator.geolocation) {
        document.getElementById('loadingOverlay').classList.add('active');
        const routeBtn = document.getElementById('routeBtn');
        if (routeBtn) routeBtn.disabled = true;
        console.log('📍 현재 위치 요청 중...');
        
        const timeout = setTimeout(() => {
          document.getElementById('loadingOverlay').classList.remove('active');
          const routeBtn = document.getElementById('routeBtn');
          if (routeBtn) routeBtn.disabled = false;
          showToast('위치 정보를 가져오는데 시간이 너무 오래 걸립니다. 다시 시도해주세요.', 'warning', 4000);
          console.error('❌ 위치 요청 타임아웃');
        }, 10000);
        
        navigator.geolocation.getCurrentPosition(
          function(position) {
            clearTimeout(timeout);
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log('✅ 현재 위치:', lat, lng);
            currentPosition = new kakao.maps.LatLng(lat, lng);
            drawRouteFromCurrentLocation(currentPosition, myActiveWorks);
          },
          function(error) {
            clearTimeout(timeout);
            document.getElementById('loadingOverlay').classList.remove('active');
            const routeBtn = document.getElementById('routeBtn');
            if (routeBtn) routeBtn.disabled = false;
            let errorMsg = '위치 정보를 가져올 수 없습니다.\n\n';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMsg += '위치 권한이 거부되었습니다.\n브라우저 설정에서 위치 권한을 허용해주세요.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMsg += '위치 정보를 사용할 수 없습니다.';
                break;
              case error.TIMEOUT:
                errorMsg += '위치 정보 요청 시간이 초과되었습니다.';
                break;
              default:
                errorMsg += '알 수 없는 오류가 발생했습니다.';
            }
            showToast(errorMsg, 'error', 4000);
            console.error('❌ 위치 정보 에러:', error);
          }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        showToast('이 브라우저는 위치 서비스를 지원하지 않습니다.', 'error');
      }
    };
    
    function drawRouteFromCurrentLocation(currentPos, myActiveWorks) {
      console.log('🗺️ 경로 그리기 시작 - 기존 경로 완전 제거');

      // 기존 마커 완전 제거
      if (currentLocationMarker) {
        currentLocationMarker.setMap(null);
        currentLocationMarker = null;
      }
      routeMarkers.forEach(marker => {
        if (marker) marker.setMap(null);
      });
      routeMarkers = [];

      // 기존 경로선 완전 제거 (강화)
      if (routeLine) {
        if (Array.isArray(routeLine)) {
          console.log(`🗑️ 배열 경로선 제거: ${routeLine.length}개`);
          routeLine.forEach((line, index) => {
            if (line) {
              line.setMap(null);
              console.log(`  ✓ 경로선 ${index + 1} 제거됨`);
            }
          });
        } else {
          console.log('🗑️ 단일 경로선 제거');
          routeLine.setMap(null);
        }
        routeLine = null;
      }

      // 추가: 경로 정보 텍스트 숨기기
      const routeInfo = document.getElementById('routeInfo');
      if (routeInfo) {
        routeInfo.style.display = 'none';
        routeInfo.textContent = '';
      }

      console.log('✅ 기존 경로 제거 완료');

      // 새 경로 배열 즉시 초기화 (타이밍 이슈 방지)
      routeLine = [];

      const uniqueSites = [];
      const siteNames = new Set();
      myActiveWorks.forEach(work => {
        if (!siteNames.has(work.site)) {
          uniqueSites.push(work.site);
          siteNames.add(work.site);
        }
      });
      console.log('🏗️ 고유 현장:', uniqueSites);
      
      const geocoder = new kakao.maps.services.Geocoder();
      const promises = [];
      const positions = [{
        coords: currentPos,
        siteName: '현재 위치',
        index: 0
      }];
      
      uniqueSites.forEach((siteName, index) => {
        const site = Object.values(sites).find(s => s.name === siteName);
        if (!site || !site.address) {
          console.warn(`⚠️ 현장 "${siteName}"의 주소 정보가 없습니다.`);
          return;
        }
        console.log(`📍 주소 검색: ${siteName} - ${site.address}`);
        const promise = new Promise((resolve) => {
          geocoder.addressSearch(site.address, function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
              const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
              positions.push({
                coords,
                siteName,
                index: index + 1
              });
              console.log(`✅ 좌표 변환 성공: ${siteName}`);
              resolve();
            } else {
              console.warn(`❌ 주소 검색 실패: ${site.address} (상태: ${status})`);
              resolve();
            }
          });
        });
        promises.push(promise);
      });
      
      Promise.all(promises).then(() => {
        console.log('📊 변환된 위치:', positions.length, '개');
        positions.sort((a, b) => a.index - b.index);
        if (positions.length < 2) {
          document.getElementById('loadingOverlay').classList.remove('active');
          document.getElementById('routeBtn').disabled = false;
          showToast('경로를 표시할 현장의 주소를 찾을 수 없습니다. 현장 관리에서 주소를 확인해주세요.', 'error', 4000);
          console.error('❌ 유효한 위치가 2개 미만');
          isRouteDisplayed = false;
          return;
        }

        getRealRoutes(positions).then(routeData => {
          console.log('🎨 마커 그리기 시작');

          const startMarkerContent = `
            <div style="position: relative;">
              <div style="
                background: #ff5722;
                color: white;
                border: 3px solid white;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 18px;
                box-shadow: 0 3px 8px rgba(0,0,0,0.4);
              ">📍</div>
              <div style="
                position: absolute;
                top: -35px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 8px 12px;
                border-radius: 4px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                white-space: nowrap;
                font-size: 13px;
                font-weight: 600;
                color: #ff5722;
              ">🚩 출발</div>
            </div>
          `;
          currentLocationMarker = new kakao.maps.CustomOverlay({
            position: positions[0].coords,
            content: startMarkerContent,
            yAnchor: 1
          });
          currentLocationMarker.setMap(map);

          for (let i = 1; i < positions.length; i++) {
            const pos = positions[i];
            const markerContent = `
              <div style="position: relative;">
                <div style="
                  background: #2a459c;
                  color: white;
                  border: 3px solid white;
                  border-radius: 50%;
                  width: 35px;
                  height: 35px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 14px;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                ">${i}</div>
                <div style="
                  position: absolute;
                  top: -35px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: white;
                  padding: 8px 12px;
                  border-radius: 4px;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  white-space: nowrap;
                  font-size: 13px;
                  font-weight: 600;
                ">${i}. ${pos.siteName}</div>
              </div>
            `;
            const marker = new kakao.maps.CustomOverlay({
              position: pos.coords,
              content: markerContent,
              yAnchor: 1
            });
            marker.setMap(map);
            routeMarkers.push(marker);
          }

          console.log('✏️ 구간별 색상 경로선 그리기');

          const routeColors = [
            '#FF5722',
            '#2196F3',
            '#4CAF50',
            '#9C27B0',
            '#FF9800',
            '#00BCD4',
          ];

          // 경로선 배열 확인 (이미 초기화되어 있어야 함)
          if (!Array.isArray(routeLine)) {
            console.warn('⚠️ routeLine이 배열이 아님, 재초기화');
            routeLine = [];
          }
          console.log(`📍 현재 routeLine 상태: ${routeLine.length}개`);

          routeData.segments.forEach((segment, index) => {
            const color = routeColors[index % routeColors.length];
            const segmentLine = new kakao.maps.Polyline({
              path: segment.points,
              strokeWeight: 6,
              strokeColor: color,
              strokeOpacity: 0.8,
              strokeStyle: 'solid'
            });
            segmentLine.setMap(map);
            routeLine.push(segmentLine);
            console.log(`  ✓ 구간 ${index + 1} 추가 (색상: ${color})`);
          });

          console.log(`✅ 총 ${routeLine.length}개 경로선이 지도에 표시됨`);

          const bounds = new kakao.maps.LatLngBounds();
          routeData.allPoints.forEach(point => bounds.extend(point));
          map.setBounds(bounds);

          document.getElementById('loadingOverlay').classList.remove('active');
          const routeBtn = document.getElementById('routeBtn');
          if (routeBtn) routeBtn.disabled = false;
          isRouteDisplayed = true;

          const totalDistance = (routeData.totalDistance / 1000).toFixed(1);
          const totalTime = Math.round(routeData.totalTime / 60);
          console.log(`✅ 경로 표시 완료 - 총 ${totalDistance}km, 약 ${totalTime}분`);

          const routeInfo = document.getElementById('routeInfo');
          routeInfo.textContent = `${totalDistance}km · ${totalTime}분`;
          routeInfo.style.display = 'inline-block';
          
        }).catch(error => {
          console.error('❌ 경로 계산 실패:', error);
          drawStraightRoute(positions);
        });
      }).catch(error => {
        console.error('❌ 경로 표시 중 에러:', error);
        document.getElementById('loadingOverlay').classList.remove('active');
        const routeBtn = document.getElementById('routeBtn');
        if (routeBtn) routeBtn.disabled = false;
        isRouteDisplayed = false;
        showToast('경로를 표시하는 중 오류가 발생했습니다.', 'error', 4000);
      });
    }

    async function getRealRoutes(positions) {
      const PROXY_BASE = 'https://workflow-blush-five.vercel.app';
      
      const allPoints = [];
      const segments = [];
      let totalDistance = 0;
      let totalTime = 0;
    
      for (let i = 0; i < positions.length - 1; i++) {
        const segmentPoints = [];
        
        const origin = positions[i].coords;
        const destination = positions[i + 1].coords;
    
        const originStr = `${origin.getLng()},${origin.getLat()}`;
        const destStr = `${destination.getLng()},${destination.getLat()}`;
    
        const url = `${PROXY_BASE}/api/directions?origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destStr)}`;
    
        try {
          const resp = await fetch(url, { method: 'GET' });
          if (!resp.ok) throw new Error(`proxy ${resp.status}`);
    
          const data = await resp.json();
    
          if (!data.routes || data.routes.length === 0) {
            segmentPoints.push(origin);
            segmentPoints.push(destination);
          } else {
            const route = data.routes[0];
            const sections = route.sections || [];
    
            sections.forEach(section => {
              (section.roads || []).forEach(road => {
                const verts = road.vertexes || [];
                for (let v = 0; v < verts.length; v += 2) {
                  const lng = verts[v];
                  const lat = verts[v + 1];
                  if (typeof lat === 'number' && typeof lng === 'number') {
                    const point = new kakao.maps.LatLng(lat, lng);
                    segmentPoints.push(point);
                    allPoints.push(point);
                  }
                }
              });
            });
    
            if (route.summary) {
              totalDistance += route.summary.distance || 0;
              totalTime += route.summary.duration || 0;
            }
          }
        } catch (err) {
          console.error(`구간 ${i}-${i+1} 경로 요청 실패:`, err);
          segmentPoints.push(positions[i].coords);
          segmentPoints.push(positions[i + 1].coords);
          allPoints.push(positions[i].coords);
          allPoints.push(positions[i + 1].coords);
        }
        
        segments.push({
          from: positions[i].siteName,
          to: positions[i + 1].siteName,
          points: segmentPoints
        });
      }
    
      return {
        allPoints: allPoints,
        segments: segments,
        totalDistance,
        totalTime
      };
    }

    function drawStraightRoute(positions) {
      // 직선거리 표시 기능 제거됨
      console.log('⚠️ 직선 경로 표시 기능이 제거되었습니다');
      document.getElementById('loadingOverlay').classList.remove('active');
      document.getElementById('routeBtn').disabled = false;
    }

    function loadAllCompaniesWorks() {
      // 팀 데이터만 로드 (개인 계정 제외)
      const teamsRef = window.dbRef(window.db, 'teams');
      window.dbOnValue(teamsRef, (snapshot) => {
        const teams = snapshot.val() || {};
        allCompaniesWorks = {};

        Object.keys(teams).forEach(teamId => {
          const teamInfo = teams[teamId].info;
          let teamName;

          if (teamInfo && teamInfo.name) {
            teamName = teamInfo.name;
          } else {
            // fallback: teamId를 보기 좋게 변환
            teamName = `팀 ${teamId.substring(0, 8)}`;
            console.warn(`⚠️ 팀명 없음: ${teamId}, fallback: "${teamName}"`);
          }

          allCompaniesWorks[teamId] = {
            name: teamName,
            works: teams[teamId].worklists || {},
            sites: teams[teamId].sites || {}
          };
          console.log(`📊 팀 로드: ${teamId} → 팀명: "${teamName}"`);
        });

        console.log('✅ 모든 팀 데이터 로드 완료:', Object.keys(allCompaniesWorks).length, '개 팀');

        if (currentUser) {
          renderWorks();
        }
      });
    }
    
    function loadAssignees() {
      console.log('👥 사용자 목록 로드 중...');

      // 팀이 있으면 팀 멤버, 없으면 개인만
      let assigneesPath;
      if (currentTeamId) {
        assigneesPath = `teams/${currentTeamId}/members`;
        console.log('✅ 팀 멤버 로드:', currentTeamId);
      } else if (currentUserId) {
        // 팀이 없으면 본인만 담당자 목록에 추가
        assignees = [{
          id: currentUserId,
          name: userInfo?.name || currentUser,
          role: 'member'
        }];
        console.log('✅ 개인 사용자 로드 (팀 없음)');
        return;
      } else {
        console.error('❌ currentTeamId와 currentUserId 모두 없습니다!');
        return;
      }

      const assigneesRef = window.dbRef(window.db, assigneesPath);

      window.dbOnValue(assigneesRef, (snapshot) => {
        assignees = [];
        const data = snapshot.val();

        console.log('📊 사용자 데이터:', data);

        if (data) {
          Object.keys(data).forEach(key => {
            assignees.push({
              id: key,
              name: data[key].name,
              role: data[key].role || 'member'
            });
          });
        }

        // 역할별 정렬 (생성자 > 멤버), 이름순
        assignees.sort((a, b) => {
          if (a.role === 'creator' && b.role !== 'creator') return -1;
          if (a.role !== 'creator' && b.role === 'creator') return 1;
          return a.name.localeCompare(b.name);
        });

        console.log('✅ 사용자 목록 로드 완료:', assignees.length, '명');

      }, (error) => {
        console.error('❌ 사용자 목록 로드 실패:', error);
        showToast('사용자 목록을 불러오는데 실패했습니다.', 'error');
      });
    }
    
    
    window.addNewUser = function() {
      const input = document.getElementById('newUserInput');
      const name = input.value.trim();
      if (!name) {
        showToast('사용자 이름을 입력하세요.', 'warning');
        return;
      }
      if (assignees.some(a => a.name === name)) {
        showToast('이미 존재하는 사용자입니다.', 'warning');
        return;
      }
      const assigneesRef = window.dbRef(window.db, `companies/${currentCompanyId}/assignees`);
      const newAssigneeRef = window.dbPush(assigneesRef);
      window.dbSet(newAssigneeRef, {
        name: name
      });
      input.value = '';
    };

    function showMainApp() {
  console.log('📱 메인 앱 표시');
  
  const loginContainer = document.getElementById('loginContainer');
  loginContainer.style.display = 'none';
  loginContainer.style.visibility = 'hidden';
  loginContainer.style.opacity = '0';
  
  const appContainer = document.getElementById('appContainer');
  appContainer.style.display = 'flex';
  appContainer.classList.add('active');
  
  console.log('✅ 화면 전환 완료');
  
  document.getElementById('userAvatar').textContent = currentUser.charAt(0);
  document.getElementById('headerUserName').textContent = currentUser;

  updateDateDisplay();
  loadAssignees();
  loadWorks();
  loadSites();
  loadAllCompaniesWorks();
  renderMenu();
  loadInvitations(); // 초대 배지 로드

  setTimeout(() => {
    initMenuEventListeners();
  }, 100);
  
  // ✅ 추가: 모달 이벤트 리스너도 초기화
  setTimeout(() => {
    initModalEventListeners();
  }, 200);
  
  setTimeout(() => {
    console.log('🗺️ 지도 초기화 시작...');
    initMap();
  }, 500);
  
  console.log('✅ 메인 앱 로드 완료');
}
    
    window.login = function(userName) {
      console.log('🎯 로그인 시도:', userName);
      
      currentUser = userName;
      
      const userEntry = assignees.find(a => a.name === userName);
      if (userEntry) {
        currentUserId = userEntry.id;
        isAdmin = userEntry.isAdmin || false;
        console.log('👤 사용자 정보:', { 
          name: userName, 
          id: currentUserId, 
          isAdmin: isAdmin 
        });
      }
      
      loadCompanyInfo();

      showMainApp();

      // 로그인 후 초대 확인
      checkPendingInvitations();

      console.log('✅ 로그인 완료');
    };

    // toggleMenuFunction으로 이름 변경
    function toggleMenuFunction() {
      console.log('🎯 toggleMenu 호출됨');
      
      const menu = document.getElementById('menuDropdown');
      const menuBtn = document.getElementById('mainMenuBtn');
      const overlay = document.getElementById('menuOverlay');
      
      console.log('📍 메뉴 요소:', {
        menu: !!menu,
        menuBtn: !!menuBtn,
        overlay: !!overlay
      });
      
      if (!menu || !menuBtn) {
        console.error('❌ 메뉴 요소를 찾을 수 없습니다');
        return;
      }
      
      const isActive = menu.classList.contains('active');
      console.log('📊 현재 상태:', isActive ? '열림' : '닫힘');
      
      if (isActive) {
        menu.classList.remove('active');
        menuBtn.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        console.log('✅ 메뉴 닫힘');
      } else {
        menu.classList.add('active');
        menuBtn.classList.add('active');
        if (overlay) overlay.classList.add('active');
        console.log('✅ 메뉴 열림');
      }
    }
    
    // window 객체에도 등록 (하위 메뉴에서 사용)
    window.toggleMenu = toggleMenuFunction;
    
    function loadCompanyInfo() {
      const companyRef = window.dbRef(window.db, `companies/${currentCompanyId}/info`);
      window.dbOnValue(companyRef, (snapshot) => {
        companyInfo = snapshot.val();
        console.log('🏢 회사 정보 로드:', companyInfo);
      });
    }
    
    window.logout = function() {
      console.log('🚪 로그아웃 시작');

      // 메뉴 닫기
      const menu = document.getElementById('menuDropdown');
      const menuBtn = document.getElementById('mainMenuBtn');
      const overlay = document.getElementById('menuOverlay');
      if (menu) menu.classList.remove('active');
      if (menuBtn) menuBtn.classList.remove('active');
      if (overlay) overlay.classList.remove('active');

      currentUser = null;
      currentCompanyId = null;

      const appContainer = document.getElementById('appContainer');
      appContainer.classList.remove('active');
      appContainer.style.display = 'none';

      const loginContainer = document.getElementById('loginContainer');
      loginContainer.style.display = 'flex';
      loginContainer.style.visibility = 'visible';
      loginContainer.style.opacity = '1';

      document.getElementById('companyLoginStep').style.display = 'block';
      document.getElementById('createCompanyStep').style.display = 'none';
      document.getElementById('userSelectStep').style.display = 'none';

      document.getElementById('companyPasswordInput').value = '';

      console.log('✅ 로그아웃 완료 - 회사 로그인 화면으로 이동');
    };

    window.deleteCompany = async function() {
      console.log('⚠️ 회사 탈퇴 시도');
      
      if (!isAdmin) {
        showToast('회사 탈퇴는 관리자만 할 수 있습니다.', 'warning');
        return;
      }
      
      toggleMenu();
      
      const confirmMessage = `⚠️ 회사 탈퇴 경고 ⚠️\n\n` +
        `회사를 탈퇴하면 다음 데이터가 모두 삭제됩니다:\n` +
        `• 모든 작업 내역\n` +
        `• 모든 현장 정보\n` +
        `• 모든 사용자 정보 (${assignees.length}명)\n` +
        `• 회사 정보\n\n` +
        `이 작업은 되돌릴 수 없습니다!\n\n` +
        `정말로 탈퇴하시겠습니까?`;
      
      if (!confirm(confirmMessage)) {
        console.log('❌ 회사 탈퇴 취소됨');
        return;
      }
      
      const password = prompt('회사 비밀번호를 입력하여 탈퇴를 확인하세요:');
      
      if (!password) {
        showToast('탈퇴가 취소되었습니다.', 'info');
        console.log('❌ 비밀번호 입력 취소됨');
        return;
      }
      
      try {
        const companyRef = window.dbRef(window.db, `companies/${currentCompanyId}/info`);
        
        window.dbOnValue(companyRef, async (snapshot) => {
          const companyInfo = snapshot.val();
          
          if (!companyInfo) {
            showToast('회사 정보를 찾을 수 없습니다.', 'error');
            return;
          }
          
          if (companyInfo.password !== password) {
            showToast('비밀번호가 일치하지 않습니다.', 'error');
            console.log('❌ 비밀번호 불일치');
            return;
          }
          
          const finalConfirm = confirm(
            '⚠️ 최종 확인 ⚠️\n\n' +
            '지금 확인을 누르면 회사가 영구적으로 삭제됩니다.\n' +
            '정말로 진행하시겠습니까?'
          );
          
          if (!finalConfirm) {
            showToast('탈퇴가 취소되었습니다.', 'info');
            console.log('❌ 최종 확인 취소됨');
            return;
          }
          
          const companyDataRef = window.dbRef(window.db, `companies/${currentCompanyId}`);
          
          window.dbRemove(companyDataRef).then(() => {
            console.log('✅ 회사 데이터 삭제 완료');
            
            clearAutoLogin();

            showToast('회사 탈퇴가 완료되었습니다. 모든 데이터가 삭제되었습니다.', 'success', UI_CONSTANTS.TOAST_DURATION_LONG);

            currentUser = null;
            currentCompanyId = null;
            
            const appContainer = document.getElementById('appContainer');
            appContainer.classList.remove('active');
            appContainer.style.display = 'none';
            
            const loginContainer = document.getElementById('loginContainer');
            loginContainer.style.display = 'flex';
            loginContainer.style.visibility = 'visible';
            loginContainer.style.opacity = '1';
            
            document.getElementById('companyLoginStep').style.display = 'block';
            document.getElementById('createCompanyStep').style.display = 'none';
            document.getElementById('userSelectStep').style.display = 'none';
            
            document.getElementById('companyIdInput').value = '';
            document.getElementById('companyPasswordInput').value = '';
            
            console.log('✅ 회사 탈퇴 완료 - 로그인 화면으로 이동');
            
          }).catch((error) => {
            console.error('❌ 회사 삭제 중 오류:', error);
            showToast('회사 탈퇴 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
          });
          
        }, { onlyOnce: true });
        
      } catch (error) {
        console.error('❌ 회사 탈퇴 처리 중 오류:', error);
        showToast('회사 탈퇴 처리 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
      }
    };

    window.goToToday = function() {
      currentDate = new Date();
      updateDateDisplay();
      renderWorks();
    };
    
    window.changeDate = function(days) {
      currentDate.setDate(currentDate.getDate() + days);
      updateDateDisplay();
      renderWorks();
    };

    function updateDateDisplay() {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      };
      document.getElementById('dateDisplay').textContent = currentDate.toLocaleDateString('ko-KR', options);
    }
    
    window.addWork = function() {
      const site = document.getElementById('siteInput').value.trim();
      const work = document.getElementById('workInput').value.trim();
      if (!site || !work) {
        showToast('현장명과 작업 내용을 입력하세요.', 'warning');
        return;
      }

      // 팀이 있으면 팀 작업으로, 없으면 개인 작업으로 저장
      let worksPath;
      if (currentTeamId) {
        worksPath = `teams/${currentTeamId}/worklists`;
      } else {
        worksPath = `companies/${currentCompanyId}/works`;
      }

      const worksRef = window.dbRef(window.db, worksPath);
      const todayStr = currentDate.toISOString().split('T')[0];
      const newWorkRef = window.dbPush(worksRef);
      const parentWorkId = newWorkRef.key;
      window.dbSet(newWorkRef, {
        date: todayStr,
        site: site,
        work: work,
        displayWork: work,
        assignee: '',  // ✅ 담당자 미지정 (팀 작업으로)
        completed: false,
        createdAt: new Date().toISOString(),
        deadline: work === '시험' ? null : todayStr,
        order: Date.now()
      });
      if (work === '시험') {
        const testDateStr = todayStr;
        const cappingDate = addBusinessDays(testDateStr, 1);
        const cappingRef = window.dbPush(worksRef);
        window.dbSet(cappingRef, {
          date: cappingDate,
          site: site,
          work: '캡핑',
          displayWork: '캡핑',
          assignee: '',  // ✅ 시험 관련 작업도 미지정
          completed: false,
          createdAt: new Date().toISOString(),
          parentWorkId: parentWorkId,
          testDate: testDateStr
        });
        const demoldingDate = addBusinessDays(testDateStr, 2);
        const demoldingRef = window.dbPush(worksRef);
        window.dbSet(demoldingRef, {
          date: demoldingDate,
          site: site,
          work: '탈형',
          displayWork: '탈형',
          assignee: '',  // ✅ 미지정
          completed: false,
          createdAt: new Date().toISOString(),
          parentWorkId: parentWorkId,
          testDate: testDateStr
        });
        const day7Date = addCalendarDays(testDateStr, 7);
        const day7Ref = window.dbPush(worksRef);
        window.dbSet(day7Ref, {
          date: day7Date,
          site: site,
          work: '7일 강도 시험',
          displayWork: '7일 강도 시험',
          assignee: '',  // ✅ 미지정
          completed: false,
          createdAt: new Date().toISOString(),
          parentWorkId: parentWorkId,
          testDate: testDateStr
        });
        const day28Date = addCalendarDays(testDateStr, 28);
        const day28Ref = window.dbPush(worksRef);
        window.dbSet(day28Ref, {
          date: day28Date,
          site: site,
          work: '28일 강도 시험',
          displayWork: '28일 강도 시험',
          assignee: '',  // ✅ 미지정
          completed: false,
          createdAt: new Date().toISOString(),
          parentWorkId: parentWorkId,
          testDate: testDateStr
        });
      }

      // 🚀 통계 캐시 무효화
      if (window.invalidateStatsCache) {
        window.invalidateStatsCache();
      }

      document.getElementById('siteInput').value = '';
      document.getElementById('workInput').value = '';
    };
     
    function loadWorks() {
      console.log('📋 작업 데이터 로드 중...');

      if (!currentCompanyId) {
        console.error('❌ currentCompanyId가 설정되지 않음');
        return;
      }

      // 팀이 있으면 팀 작업만, 없으면 개인 작업만 로드
      let worksPath;
      if (currentTeamId) {
        worksPath = `teams/${currentTeamId}/worklists`;
        console.log('✅ 팀 작업 로드:', currentTeamId);
      } else {
        worksPath = `companies/${currentCompanyId}/works`;
        console.log('✅ 개인 작업 로드');
      }

      const worksRef = window.dbRef(window.db, worksPath);
      window.dbOnValue(worksRef, (snapshot) => {
        works = snapshot.val() || {};
        console.log('✅ 작업 데이터 로드 완료:', Object.keys(works).length, '개');

        // 🚀 통계 캐시 무효화 (데이터 변경 감지)
        if (window.invalidateStatsCache) {
          window.invalidateStatsCache();
        }

        renderWorks();
      });
    }
    
    function loadSites() {
      // 팀이 있으면 팀 현장, 없으면 개인 현장
      let sitesPath;
      if (currentTeamId) {
        sitesPath = `teams/${currentTeamId}/sites`;
      } else {
        sitesPath = `companies/${currentCompanyId}/sites`;
      }

      const sitesRef = window.dbRef(window.db, sitesPath);
      window.dbOnValue(sitesRef, (snapshot) => {
        sites = snapshot.val() || {};
        renderSiteList();
      });
    }

    function renderWorks() {
      if (isDraggingNow) {
        console.log('⚠️ 드래그 중 - 렌더링 건너뜀');
        return;
      }
      const searchDate = currentDate.toISOString().split('T')[0];
      const myWorks = [];
      const teamWorks = [];
      const completedWorks = [];
      
      const otherCompaniesWorkMap = {};
      
      Object.keys(works).forEach(workId => {
        const work = works[workId];
        let shouldShow = false;
        if (work.completed) {
          const deadline = work.deadline || work.date;
          const isOverdue = work.completedDate && deadline < work.completedDate;
          completedWorks.push({
            ...work,
            id: workId,
            displayWork: work.displayWork || work.work,
            isOverdue: isOverdue
          });
          return;
        }
        if (work.work === '시험' || work.parentWorkId) {
          shouldShow = work.date === searchDate;
        } else {
          shouldShow = work.date <= searchDate;
        }
        if (shouldShow) {
          const deadline = work.deadline || work.date;
          const isOverdue = deadline < searchDate;

          // 기한 임박 계산
          const today = new Date(searchDate);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];

          const isDueToday = deadline === searchDate;
          const isDueTomorrow = deadline === tomorrowStr;

          const otherCompanyInfo = [];
          if (work.site) {
            Object.keys(allCompaniesWorks).forEach(teamId => {
              // 현재 팀이면 건너뛰기
              if (currentTeamId && teamId === currentTeamId) return;
              // 팀이 없는 경우(개인 작업) 자신의 회사면 건너뛰기
              if (!currentTeamId && teamId === currentCompanyId) return;

              const companyWorks = allCompaniesWorks[teamId].works || {};
              const companyName = allCompaniesWorks[teamId].name || teamId;
              
              Object.values(companyWorks).forEach(otherWork => {
                if (otherWork.completed) return;
                
                const mySite = Object.values(sites).find(s => s.name === work.site);
                const mySiteAddress = mySite ? mySite.address : '';

                const otherCompanySites = allCompaniesWorks[teamId].sites || {};
                const otherSite = Object.values(otherCompanySites).find(s => s.name === otherWork.site);
                const otherSiteAddress = otherSite ? otherSite.address : '';
                
                if (!areSitesSimilar(work.site, mySiteAddress, otherWork.site, otherSiteAddress)) {
                  return;
                }
                
                let otherShouldShow = false;
                if (otherWork.work === '시험' || otherWork.parentWorkId) {
                  otherShouldShow = otherWork.date === searchDate;
                } else {
                  otherShouldShow = otherWork.date <= searchDate;
                }
                
                if (otherShouldShow) {
                  otherCompanyInfo.push({
                    companyName: companyName,
                    assignee: otherWork.assignee || '미정'
                  });
                  console.log(`🔔 겹치는 현장 발견: ${work.site} | 다른팀: "${companyName}" (${teamId}) | 담당자: ${otherWork.assignee || '미정'}`);
                }
              });
            });
          }
          
          const visibleWork = {
            ...work,
            id: workId,
            displayWork: work.displayWork || work.work,
            isOverdue: isOverdue,
            isDueToday: isDueToday,
            isDueTomorrow: isDueTomorrow,
            otherCompanyInfo: otherCompanyInfo
          };
          if (work.assignee && work.assignee === currentUser) {
            myWorks.push(visibleWork);
          } else {
            teamWorks.push(visibleWork);
          }
        }
      });
      completedWorks.sort((a, b) => {
        const dateA = a.completedDate || a.date;
        const dateB = b.completedDate || b.date;
        return dateB.localeCompare(dateA);
      });
      const container = document.getElementById('taskContainer');
      container.innerHTML = '';
      const myActiveWorks = myWorks.filter(w => !w.completed);
      
      myActiveWorks.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 999;
        const orderB = typeof b.order === 'number' ? b.order : 999;
        if (orderA === orderB) {
          return a.id.localeCompare(b.id);
        }
        return orderA - orderB;
      });
      
      if (myActiveWorks.length > 0) {
        const header = document.createElement('div');
        header.className = 'section-header my-work' + (sectionStates.myActive ? '' : ' collapsed');
        header.innerHTML = '<span class="section-toggle">▼</span> <i data-lucide="user" style="width: 16px; height: 16px; vertical-align: text-bottom;"></i> 내 작업 진행 중 <span style="color: #2a459c; font-weight: 700;">(' + myActiveWorks.length + ')</span>';
        header.onclick = () => toggleSection('myActive');
        container.appendChild(header);
        const grid = document.createElement('div');
        grid.className = 'task-grid' + (sectionStates.myActive ? '' : ' collapsed');
        grid.id = 'myTaskGrid';
        
        myActiveWorks.forEach((work, index) => {
          work.orderNumber = index + 1;
          grid.appendChild(createWorkCard(work, false));
        });
        container.appendChild(grid);
        
        grid.addEventListener('dragover', handleDragOver);
        grid.addEventListener('drop', handleDrop);
      }
      const teamActiveWorks = teamWorks.filter(w => !w.completed);
      if (teamActiveWorks.length > 0) {
        if (myActiveWorks.length > 0) {
          const divider = document.createElement('div');
          divider.className = 'section-divider';
          container.appendChild(divider);
        }
        const header = document.createElement('div');
        header.className = 'section-header' + (sectionStates.teamActive ? '' : ' collapsed');
        header.innerHTML = '<span class="section-toggle">▼</span> <i data-lucide="users" style="width: 16px; height: 16px; vertical-align: text-bottom;"></i> 팀 작업 진행 중 <span style="color: #666; font-weight: 700;">(' + teamActiveWorks.length + ')</span>';
        header.onclick = () => toggleSection('teamActive');
        container.appendChild(header);
        const grid = document.createElement('div');
        grid.className = 'task-grid' + (sectionStates.teamActive ? '' : ' collapsed');
        grid.id = 'teamTaskGrid';
        teamActiveWorks.forEach(work => {
          grid.appendChild(createWorkCard(work, false));
        });
        container.appendChild(grid);
      }
      if (completedWorks.length > 0) {
        if (myWorks.length > 0 || teamWorks.length > 0) {
          const divider = document.createElement('div');
          divider.className = 'section-divider';
          container.appendChild(divider);
        }
        const header = document.createElement('div');
        header.className = 'section-header' + (sectionStates.completed ? '' : ' collapsed');
        header.innerHTML = `<span class="section-toggle">▼</span> <i data-lucide="check-circle" style="width: 16px; height: 16px; vertical-align: text-bottom;"></i> 완료됨 <span style="color: #4caf50; font-weight: 700;">(${completedWorks.length})</span>`;
        header.onclick = () => toggleSection('completed');
        container.appendChild(header);
        const grid = document.createElement('div');
        grid.className = 'task-grid' + (sectionStates.completed ? '' : ' collapsed');
        grid.id = 'completedTaskGrid';
        grid.style.maxHeight = '400px';
        grid.style.overflowY = 'auto';
        completedWorks.forEach(work => {
          grid.appendChild(createWorkCard(work, true));
        });
        container.appendChild(grid);
      }
      if (myWorks.length === 0 && teamWorks.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
          <div class="empty-icon"><i data-lucide="clipboard" style="width: 48px; height: 48px;"></i></div>
          <div>이 날짜에 예정된 작업이 없습니다</div>
        `;
        container.appendChild(emptyState);
        if (window.lucide) lucide.createIcons();
      }

      // 작업 렌더링 후 자동으로 경로 표시
      updateMapAutomatically(myActiveWorks);

      // Lucide 아이콘 초기화
      if (window.lucide) lucide.createIcons();
    }

    function toggleSection(sectionKey) {
      sectionStates[sectionKey] = !sectionStates[sectionKey];
      renderWorks();
    }
    
    function createWorkCard(work, isCompleted) {
      const card = document.createElement('div');
      card.className = 'task-card' + (isCompleted ? ' completed' : '');

      // 기한 상태별 스타일 적용
      if (!isCompleted) {
        if (work.isOverdue) {
          card.classList.add('overdue'); // 빨간색
        } else if (work.isDueToday) {
          card.classList.add('due-today'); // 주황색
        } else if (work.isDueTomorrow) {
          card.classList.add('due-tomorrow'); // 노란색
        }
      }

      // 담당자별 색상 적용 (오른쪽 테두리)
      if (work.assignee) {
        const assigneeColor = getAssigneeColor(work.assignee);
        card.style.borderRight = `6px solid ${assigneeColor}`;
      }

      if (work.assignee === currentUser && !isCompleted) {
        card.draggable = true;
      } else {
        card.draggable = false;
      }
      
      card.dataset.workId = work.id;
      if (work.assignee === currentUser) {
        card.classList.add('my-task');
      }
      
      if (!isCompleted) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchCurrentX = 0;
        let touchCurrentY = 0;
        let isDragging = false;
        let isSwiping = false;
        let dragStarted = false;
        let touchStartOrder = [];
        
        card.addEventListener('touchstart', (e) => {
          if (e.target.closest('.task-checkbox') || 
              e.target.closest('.assignee-select') || 
              e.target.closest('.action-btn') ||
              e.target.closest('.deadline-label-container')) {
            return;
          }
          
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isDragging = false;
          isSwiping = false;
          
          const grid = card.closest('.task-grid');
          if (grid) {
            touchStartOrder = Array.from(grid.querySelectorAll('.task-card')).map(c => c.dataset.workId);
          }
        }, { passive: true });
        
        card.addEventListener('touchmove', (e) => {
          if (e.target.closest('.task-checkbox') || 
              e.target.closest('.assignee-select') || 
              e.target.closest('.action-btn') ||
              e.target.closest('.deadline-label-container')) {
            return;
          }
          
          touchCurrentX = e.touches[0].clientX;
          touchCurrentY = e.touches[0].clientY;
          const deltaX = touchStartX - touchCurrentX;
          const deltaY = Math.abs(touchCurrentY - touchStartY);
          
          if (!isDragging && !isSwiping) {
            if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
              isSwiping = true;
            } else if (deltaY > 10 && deltaY > Math.abs(deltaX)) {
              isDragging = true;
              card.classList.add('dragging');
              document.body.classList.add('dragging-active');
            }
          }
          
          if (isSwiping) {
            e.preventDefault();
            if (deltaX > 0 && deltaX <= 50) {
              card.style.transform = `translateX(-${deltaX}px)`;
            } else if (deltaX > 50) {
              card.style.transform = `translateX(-50px)`;
            }
            return;
          }
          
          if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
            
            const touch = e.touches[0];
            const originalVisibility = card.style.visibility;
            card.style.visibility = 'hidden';
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            card.style.visibility = originalVisibility;
            
            const targetCard = elementBelow?.closest('.task-card');
            document.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
            
            if (targetCard && targetCard !== card && !targetCard.classList.contains('completed')) {
              targetCard.classList.add('drag-over');
              
              const container = card.closest('.task-grid');
              const targetContainer = targetCard.closest('.task-grid');
              
              if (container && targetContainer && container === targetContainer && container.id === 'myTaskGrid') {
                const rect = targetCard.getBoundingClientRect();
                const touchY = touch.clientY;
                const middle = rect.top + rect.height / 2;
                
                if (touchY < middle) {
                  container.insertBefore(card, targetCard);
                } else {
                  const nextCard = targetCard.nextElementSibling;
                  if (nextCard && nextCard !== card) {
                    container.insertBefore(card, nextCard);
                  } else {
                    container.appendChild(card);
                  }
                }
              }
            }
          }
        }, { passive: false });
        
        card.addEventListener('touchend', (e) => {
          document.body.classList.remove('dragging-active');
          
          if (isSwiping) {
            const deltaX = touchStartX - touchCurrentX;
            
            if (deltaX > 25) {
              card.classList.add('swiped-left');
              card.style.transform = '';
            } else {
              card.classList.remove('swiped-left');
              card.style.transform = '';
            }
            
            if (deltaX > 25 && navigator.vibrate) {
              navigator.vibrate(30);
            }
            
            isSwiping = false;
            isDragging = false;
            card.classList.remove('dragging');
            document.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
            return;
          }
          
          if (!isDragging) {
            card.classList.remove('dragging');
            document.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
            return;
          }
          
          const grid = card.closest('.task-grid');
          if (grid && grid.id === 'myTaskGrid') {
            const cards = Array.from(grid.querySelectorAll('.task-card'));
            const currentOrder = cards.map(c => c.dataset.workId);
            
            const hasChanged = !touchStartOrder.every((id, index) => id === currentOrder[index]);
            
            if (!hasChanged) {
              card.classList.remove('dragging');
              document.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
              isDragging = false;
              return;
            }
            
            const updates = {};
            cards.forEach((c, index) => {
              const workId = c.dataset.workId;
              if (workId && works[workId]) {
                // 팀이 있으면 팀 작업, 없으면 개인 작업
                if (currentTeamId) {
                  updates[`teams/${currentTeamId}/worklists/${workId}/order`] = index;
                } else {
                  updates[`companies/${currentCompanyId}/works/${workId}/order`] = index;
                }
                works[workId].order = index;
              }
            });

            window.dbUpdate(window.dbRef(window.db), updates).then(() => {
              renderWorks();
              
              if (isRouteDisplayed && currentPosition) {
                const searchDate = currentDate.toISOString().split('T')[0];
                const myActiveWorks = [];
                Object.keys(works).forEach(workId => {
                  const work = works[workId];
                if (work.completed) return;
                  if (work.assignee !== currentUser) return;
                  let shouldShow = false;
                  if (work.work === '시험' || work.parentWorkId) {
                    shouldShow = work.date === searchDate;
                  } else {
                    shouldShow = work.date <= searchDate;
                  }
                  if (shouldShow) {
                    myActiveWorks.push(work);
                  }
                });
                
                myActiveWorks.sort((a, b) => {
                  const orderA = typeof a.order === 'number' ? a.order : 999;
                  const orderB = typeof b.order === 'number' ? b.order : 999;
                  if (orderA === orderB) {
                    return a.id.localeCompare(b.id);
                  }
                  return orderA - orderB;
                });
                
                if (myActiveWorks.length > 0) {
                  drawRouteFromCurrentLocation(currentPosition, myActiveWorks);
                }
              }
            });
            
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
          }
          
          card.classList.remove('dragging');
          document.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
          isDragging = false;
        }, { passive: false });
        
        card.addEventListener('touchcancel', (e) => {
          document.body.classList.remove('dragging-active');
          card.classList.remove('dragging');
          document.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
          isDragging = false;
          isSwiping = false;
        });
        
        document.addEventListener('touchstart', function resetSwipe(e) {
          if (!e.target.closest('.task-card')) {
            document.querySelectorAll('.task-card.swiped-left').forEach(c => {
              c.classList.remove('swiped-left');
              c.style.transform = '';
            });
          } else if (e.target.closest('.task-card') !== card) {
            card.classList.remove('swiped-left');
            card.style.transform = '';
          }
        });
        
        card.addEventListener('mousedown', (e) => {
          if (e.target.closest('.task-checkbox') || 
              e.target.closest('.assignee-select') || 
              e.target.closest('.action-btn') ||
              e.target.closest('.deadline-label-container')) {
            return;
          }
          touchStartX = e.clientX;
          touchStartY = e.clientY;
          dragStarted = false;
        });
        
        card.addEventListener('mousemove', (e) => {
          if (e.buttons === 1) {
            const deltaX = Math.abs(e.clientX - touchStartX);
            const deltaY = Math.abs(e.clientY - touchStartY);
            if (deltaX > 5 || deltaY > 5) {
              dragStarted = true;
            }
          }
        });
        
        card.addEventListener('click', (e) => {
          if (e.target.closest('.task-checkbox') || 
              e.target.closest('.assignee-select') || 
              e.target.closest('.action-btn') ||
              e.target.closest('.deadline-label-container')) {
            return;
          }
          
          if (dragStarted) {
            dragStarted = false;
            return;
          }
          
          document.querySelectorAll('.task-card.selected').forEach(c => {
            if (c !== card) c.classList.remove('selected');
          });
          
          card.classList.toggle('selected');
        });
        
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);

        const numberCheckContainer = document.createElement('div');
        numberCheckContainer.className = 'number-check-container';

        if (work.orderNumber) {
          const orderNum = document.createElement('div');
          orderNum.className = 'order-number';
          orderNum.textContent = work.orderNumber;
          numberCheckContainer.appendChild(orderNum);
        }

        const checkbox = document.createElement('div');
        checkbox.className = 'task-checkbox';
        checkbox.onclick = (e) => {
          e.stopPropagation();
          toggleComplete(work.id);
        };
        numberCheckContainer.appendChild(checkbox);

        card.appendChild(numberCheckContainer);
      } else {
        const completedCheckContainer = document.createElement('div');
        completedCheckContainer.className = 'number-check-container';

        const checkbox = document.createElement('div');
        checkbox.className = 'task-checkbox';
        checkbox.style.cursor = 'pointer';
        checkbox.onclick = (e) => {
          e.stopPropagation();
          toggleComplete(work.id);
        };
        completedCheckContainer.appendChild(checkbox);

        card.appendChild(completedCheckContainer);
      }

      const cardBody = document.createElement('div');
      cardBody.className = 'task-card-body';
      
      const title = document.createElement('div');
      title.className = 'task-title';
      title.textContent = `${work.site} - ${work.displayWork}`;

      if (!isCompleted && work.isOverdue) {
        const warningBadge = document.createElement('span');
        warningBadge.className = 'overdue-warning';
        warningBadge.innerHTML = '<i data-lucide="alert-triangle" style="width: 12px; height: 12px; vertical-align: text-bottom;"></i> 기한초과';
        title.appendChild(document.createTextNode(' '));
        title.appendChild(warningBadge);
      }

      // 메모가 있으면 아이콘 표시
      if (work.memo && work.memo.trim()) {
        const memoIcon = document.createElement('span');
        memoIcon.className = 'memo-icon';
        memoIcon.innerHTML = ' <i data-lucide="sticky-note" style="width: 14px; height: 14px; vertical-align: text-bottom;"></i>';
        memoIcon.title = '메모 있음';
        title.appendChild(memoIcon);
      }

      cardBody.appendChild(title);
      
      if (work.work !== '시험' && !work.parentWorkId) {
        const deadlineContainer = document.createElement('div');
        deadlineContainer.className = 'deadline-label-container';
        deadlineContainer.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('📅 [완료기한] 클릭됨:', work.id, isCompleted);
          if (!isCompleted) {
            console.log('📅 [완료기한] 모달 열기:', work.deadline || work.date);
            openDeadlineModal(work.id, work.deadline || work.date);
          } else {
            console.log('⚠️ [완료기한] 완료된 작업은 수정 불가');
          }
        };
        const deadlineLabel = document.createElement('span');
        deadlineLabel.className = 'deadline-label-text';
        deadlineLabel.textContent = '완료 기한:';
        const deadlineDate = document.createElement('span');
        deadlineDate.className = 'deadline-date-tag';
        if (!isCompleted && work.isOverdue) {
          deadlineDate.classList.add('overdue');
        }
        deadlineDate.textContent = work.deadline || work.date;
        deadlineContainer.appendChild(deadlineLabel);
        deadlineContainer.appendChild(deadlineDate);
        cardBody.appendChild(deadlineContainer);
      }
      
      if (work.testDate) {
        const dateContainer = document.createElement('div');
        dateContainer.className = 'deadline-label-container';
        dateContainer.onclick = (e) => {
          e.stopPropagation();
          showTimeline(work);
        };

        const dateLabel = document.createElement('span');
        dateLabel.className = 'deadline-label-text';
        dateLabel.textContent = '작업등록일자:';

        const testDateTag = document.createElement('span');
        testDateTag.className = 'test-date-label';
        testDateTag.textContent = work.testDate;

        dateContainer.appendChild(dateLabel);
        dateContainer.appendChild(testDateTag);
        cardBody.appendChild(dateContainer);
      }
      
      if (isCompleted && work.completedDate) {
        const completedInfo = document.createElement('div');
        completedInfo.style.cssText = 'margin-top: 6px; font-size: 11px; color: #4caf50;';
        const completedLabel = document.createElement('span');
        completedLabel.innerHTML = '<i data-lucide="check-circle" style="width: 12px; height: 12px; vertical-align: text-bottom;"></i> 완료: ';
        completedLabel.style.fontWeight = '600';
        const completedDate = document.createElement('span');
        completedDate.textContent = work.completedDate;
        const completedBy = document.createElement('span');
        completedBy.textContent = ` (담당: ${work.assignee || '미정'})`;
        completedBy.style.color = '#666';
        completedInfo.appendChild(completedLabel);
        completedInfo.appendChild(completedDate);
        completedInfo.appendChild(completedBy);
        cardBody.appendChild(completedInfo);
      }

      // 작업 상세 모달 열기 (클릭 이벤트)
      cardBody.style.cursor = 'pointer';
      cardBody.onclick = (e) => {
        // 완료기한 컨테이너나 시험일자 컨테이너를 클릭한 경우는 제외
        if (e.target.closest('.deadline-label-container')) {
          return;
        }
        openWorkDetailModal(work);
      };

      card.appendChild(cardBody);

      const personContainer = document.createElement('div');
      personContainer.className = 'person-select-container';

      // 다른 팀 정보를 담당자 왼쪽에 표시
      if (work.otherCompanyInfo && work.otherCompanyInfo.length > 0) {
        const otherCompaniesSection = document.createElement('div');
        otherCompaniesSection.className = 'other-companies-section';

        work.otherCompanyInfo.forEach(info => {
          const badge = document.createElement('div');
          badge.className = 'other-company-badge';
          badge.innerHTML = `
            <div class="other-company-name">${info.companyName}</div>
            <div class="other-company-assignee">${info.assignee}</div>
          `;
          otherCompaniesSection.appendChild(badge);
        });

        personContainer.appendChild(otherCompaniesSection);
      }

      const assigneeWrapper = document.createElement('div');
      assigneeWrapper.className = 'select-wrapper';
      const assigneeLabel = document.createElement('label');
      assigneeLabel.className = 'select-label';

      // 담당자 색상 인디케이터 추가
      if (work.assignee) {
        const colorDot = document.createElement('span');
        colorDot.className = 'assignee-color-dot';
        colorDot.style.backgroundColor = getAssigneeColor(work.assignee);
        assigneeLabel.appendChild(colorDot);
      }

      const labelText = document.createTextNode('담당자');
      assigneeLabel.appendChild(labelText);

      const assigneeSelect = document.createElement('select');
      assigneeSelect.className = 'assignee-select';
      assigneeSelect.onclick = (e) => e.stopPropagation();
      if (isCompleted) assigneeSelect.disabled = true;
      const assigneeDefaultOption = document.createElement('option');
      assigneeDefaultOption.value = '';
      assigneeDefaultOption.textContent = '선택';
      assigneeSelect.appendChild(assigneeDefaultOption);
      assignees.forEach(assignee => {
        const option = document.createElement('option');
        option.value = assignee.name;
        option.textContent = assignee.name;
        if (work.assignee === assignee.name) {
          option.selected = true;
        }
        assigneeSelect.appendChild(option);
      });
      if (!isCompleted) {
        assigneeSelect.onchange = () => saveAssignee(work.id, assigneeSelect.value);
      }
      assigneeWrapper.appendChild(assigneeLabel);
      assigneeWrapper.appendChild(assigneeSelect);
      personContainer.appendChild(assigneeWrapper);
      card.appendChild(personContainer);
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn';
      deleteBtn.innerHTML = '<i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteWork(work.id);
      };
      card.appendChild(deleteBtn);
      
      return card;
    }
    
    function handleDragStart(e) {
      draggedElement = this;
      draggedWorkId = this.dataset.workId;
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.innerHTML);
      
      isDraggingNow = true;
      const grid = this.closest('.task-grid');
      if (grid) {
        originalOrder = Array.from(grid.querySelectorAll('.task-card')).map(card => card.dataset.workId);
      }
      console.log('🟢 드래그 시작 - 원래 순서:', originalOrder);
    }

    function handleDragEnd(e) {
      this.classList.remove('dragging');
      const grid = this.closest('.task-grid');
      if (grid && grid.id === 'myTaskGrid') {
        const cards = Array.from(grid.querySelectorAll('.task-card'));
        const currentOrder = cards.map(card => card.dataset.workId);
        
        const hasChanged = !originalOrder.every((id, index) => id === currentOrder[index]);
        console.log('🔴 드래그 종료');
        console.log('   원래 순서:', originalOrder);
        console.log('   현재 순서:', currentOrder);
        console.log('   변경됨?', hasChanged);
        
        if (!hasChanged) {
          console.log('❌ 순서 변경 없음 - 저장 안 함');
          isDraggingNow = false;
          return;
        }
        
        const updates = {};
        cards.forEach((card, index) => {
          const workId = card.dataset.workId;
          if (workId && works[workId]) {
            updates[`works/${workId}/order`] = index;
            works[workId].order = index;
          }
        });
        
        window.dbUpdate(window.dbRef(window.db), updates).then(() => {
          console.log('✅ 순서 저장 완료!');
          isDraggingNow = false;
          renderWorks();
          
          if (isRouteDisplayed && currentPosition) {
            console.log('🔄 경로 자동 업데이트');
            const searchDate = currentDate.toISOString().split('T')[0];
            const myActiveWorks = [];
            Object.keys(works).forEach(workId => {
              const work = works[workId];
              if (work.completed) return;
              if (work.assignee !== currentUser) return;
              let shouldShow = false;
              if (work.work === '시험' || work.parentWorkId) {
                shouldShow = work.date === searchDate;
              } else {
                shouldShow = work.date <= searchDate;
              }
              if (shouldShow) {
                myActiveWorks.push(work);
              }
            });
            
            myActiveWorks.sort((a, b) => {
              const orderA = typeof a.order === 'number' ? a.order : 999;
              const orderB = typeof b.order === 'number' ? b.order : 999;
              if (orderA === orderB) {
                return a.id.localeCompare(b.id);
              }
              return orderA - orderB;
            });
            
            if (myActiveWorks.length > 0) {
              drawRouteFromCurrentLocation(currentPosition, myActiveWorks);
            }
          }
        }).catch(() => {
          isDraggingNow = false;
        });
      } else {
        isDraggingNow = false;
      }
    }

    function handleDragOver(e) {
      e.preventDefault();
      const draggedCard = document.querySelector('.dragging');
      if (!draggedCard) return;
      
      const targetCard = e.target.closest('.task-card');
      if (!targetCard || targetCard === draggedCard) return;
      if (targetCard.classList.contains('completed')) return;
      
      const container = draggedCard.closest('.task-grid');
      const targetContainer = targetCard.closest('.task-grid');
      if (!container || !targetContainer || container !== targetContainer) return;
      if (container.id !== 'myTaskGrid') return;
      
      const rect = targetCard.getBoundingClientRect();
      const mouseY = e.clientY;
      const middle = rect.top + rect.height / 2;
      
      if (mouseY < middle) {
        container.insertBefore(draggedCard, targetCard);
      } else {
        const nextCard = targetCard.nextElementSibling;
        if (nextCard && nextCard !== draggedCard) {
          container.insertBefore(draggedCard, nextCard);
        } else {
          container.appendChild(draggedCard);
        }
      }
    }

    function handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    function showTimeline(work) {
      const modal = document.getElementById('timelineModal');
      const title = document.getElementById('timelineTitle');
      const content = document.getElementById('timelineContent');
      title.textContent = `${work.site} - 시험 타임라인`;
      content.innerHTML = '';
      const parentId = work.parentWorkId || work.id;
      const parentWork = works[parentId];
      if (!parentWork) return;
      const timeline = [{
        work: '시험',
        date: parentWork.date,
        id: parentId,
        completed: parentWork.completed
      }];
      Object.keys(works).forEach(id => {
        if (works[id].parentWorkId === parentId) {
          timeline.push({
            work: works[id].work,
            date: works[id].date,
            id: id,
            completed: works[id].completed
          });
        }
      });
      timeline.sort((a, b) => a.date.localeCompare(b.date));
      timeline.forEach(item => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        if (item.id === work.id) {
          timelineItem.classList.add('active');
        }
        const workDiv = document.createElement('div');
        workDiv.className = 'timeline-work';
        workDiv.textContent = `${item.completed ? '✓ ' : ''}${item.work}`;
        if (item.completed) {
          workDiv.style.textDecoration = 'line-through';
          workDiv.style.color = '#999';
        }
        const dateDiv = document.createElement('div');
        dateDiv.className = 'timeline-date';
        dateDiv.textContent = item.date;
        timelineItem.appendChild(workDiv);
        timelineItem.appendChild(dateDiv);
        content.appendChild(timelineItem);
      });
      modal.classList.add('active');
    }
    
    window.closeTimelineModal = function() {
      document.getElementById('timelineModal').classList.remove('active');
    };
    
    function toggleComplete(workId) {
      const work = works[workId];
      if (!work) return;

      // 팀이 있으면 팀 작업, 없으면 개인 작업
      let worksPath;
      if (currentTeamId) {
        worksPath = `teams/${currentTeamId}/worklists/${workId}`;
      } else {
        worksPath = `companies/${currentCompanyId}/works/${workId}`;
      }

      const workRef = window.dbRef(window.db, worksPath);
      const isCompleting = !work.completed;

      const updateData = {
        completed: isCompleting
      };

      if (isCompleting) {
        updateData.completedDate = new Date().toISOString().split('T')[0];

        // 축하 메시지
        const congratsMessages = [
          '수고하셨습니다! 👏',
          '잘 하셨습니다! 💪',
          '완료! 다음 작업도 화이팅! 🎉',
          '멋지네요! ⭐',
          '오늘도 고생하셨어요! 😊'
        ];
        const randomMessage = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
        showToast(randomMessage, 'success', 2000);

        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      } else {
        updateData.completedDate = null;

        if (navigator.vibrate) {
          navigator.vibrate([30, 50, 30]);
        }

        updateData.order = Date.now();
      }

      window.dbUpdate(workRef, updateData);

      // 🚀 통계 캐시 무효화
      if (window.invalidateStatsCache) {
        window.invalidateStatsCache();
      }
    }

    function saveAssignee(workId, assignee) {
      console.log('👤 담당자 변경:', workId, '→', assignee);

      // 팀이 있으면 팀 작업, 없으면 개인 작업
      let worksPath;
      if (currentTeamId) {
        worksPath = `teams/${currentTeamId}/worklists/${workId}`;
      } else {
        worksPath = `companies/${currentCompanyId}/works/${workId}`;
      }

      const workRef = window.dbRef(window.db, worksPath);
      window.dbUpdate(workRef, {
        assignee: assignee
      }).then(() => {
        console.log('✅ 담당자 변경 완료 - Firebase 리스너가 자동으로 업데이트합니다');

        // 🚀 통계 캐시 무효화
        if (window.invalidateStatsCache) {
          window.invalidateStatsCache();
        }
      });

      // Firebase 리스너(loadWorks의 dbOnValue)가 자동으로 renderWorks()를 호출함
      // 로컬 데이터는 Firebase 업데이트 후 자동으로 동기화됨
    }
    
    function deleteWork(workId) {
      const work = works[workId];
      if (!work) return;

      // 팀이 있으면 팀 작업, 없으면 개인 작업
      let worksPath;
      if (currentTeamId) {
        worksPath = `teams/${currentTeamId}/worklists`;
      } else {
        worksPath = `companies/${currentCompanyId}/works`;
      }

      if (work.work === '시험') {
        if (!confirm('이 시험 작업과 관련된 모든 작업(캡핑, 탈형, 7일강도, 28일강도)을 삭제하시겠습니까?')) return;
        Object.keys(works).forEach(id => {
          if (works[id].parentWorkId === workId) {
            const childWorkRef = window.dbRef(window.db, `${worksPath}/${id}`);
            window.dbRemove(childWorkRef);
          }
        });
      } else {
        if (!confirm('이 작업을 삭제하시겠습니까?')) return;
      }
      const workRef = window.dbRef(window.db, `${worksPath}/${workId}`);
      window.dbRemove(workRef).then(() => {
        // 🚀 통계 캐시 무효화
        if (window.invalidateStatsCache) {
          window.invalidateStatsCache();
        }
      });
    }
    
    window.toggleSiteModal = function() {
      const modal = document.getElementById('siteModal');
      
      if (modal.classList.contains('active')) {
        cancelEditSite();
      }
      
      modal.classList.toggle('active');
      if (modal.classList.contains('active')) {
        renderSiteList();
      }
    };
    
    window.toggleSiteSelectModal = function() {
      const modal = document.getElementById('siteSelectModal');
      modal.classList.toggle('active');
      if (modal.classList.contains('active')) {
        renderSiteSelectList();
      }
    };

    // 작업 상세 모달 관련 변수
    let currentWorkDetailId = null;

    window.toggleWorkDetailModal = function() {
      const modal = document.getElementById('workDetailModal');
      modal.classList.toggle('active');
      if (!modal.classList.contains('active')) {
        currentWorkDetailId = null;
      }
    };

    window.openWorkDetailModal = function(work) {
      console.log('📝 작업 메모 모달 열기:', work);

      currentWorkDetailId = work.id;

      // 현장 특이사항 표시
      const siteNotes = getSiteNotes(work.site);
      const siteNotesSection = document.getElementById('siteNotesSection');
      const siteNotesContent = document.getElementById('workDetailSiteNotes');

      if (siteNotes && siteNotes.trim()) {
        siteNotesContent.textContent = siteNotes;
        siteNotesSection.style.display = 'block';
      } else {
        siteNotesSection.style.display = 'none';
      }

      // 작업 메모 불러오기
      document.getElementById('workMemo').value = work.memo || '';

      // 모달 열기
      document.getElementById('workDetailModal').classList.add('active');
    };

    function getSiteNotes(siteName) {
      if (!siteName) return null;
      const site = Object.values(sites).find(s => s.name === siteName);
      return site ? site.notes : null;
    }

    window.saveWorkMemo = function() {
      if (!currentWorkDetailId) {
        showToast('작업 정보를 찾을 수 없습니다.', 'error');
        return;
      }

      const memo = document.getElementById('workMemo').value.trim();

      // 팀이 있으면 팀 작업, 없으면 개인 작업
      let workPath;
      if (currentTeamId) {
        workPath = `teams/${currentTeamId}/worklists/${currentWorkDetailId}`;
      } else {
        workPath = `companies/${currentCompanyId}/works/${currentWorkDetailId}`;
      }

      const workRef = window.dbRef(window.db, workPath);
      window.dbUpdate(workRef, {
        memo: memo,
        updatedAt: new Date().toISOString()
      }).then(() => {
        showToast('메모가 저장되었습니다.', 'success');
        // 로컬 데이터도 업데이트
        if (works[currentWorkDetailId]) {
          works[currentWorkDetailId].memo = memo;
        }
        // 모달 닫기
        toggleWorkDetailModal();
        // 작업 목록 다시 렌더링 (메모 아이콘 표시를 위해)
        renderWorks();
      }).catch((error) => {
        showToast('메모 저장 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
      });
    };

    function renderSiteList() {
      const list = document.getElementById('siteList');
      list.innerHTML = '';
      Object.keys(sites).forEach(id => {
        const site = sites[id];
        const li = document.createElement('li');
        li.className = 'site-item';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'site-item-info';
        
        const name = document.createElement('div');
        name.className = 'site-item-name';
        name.textContent = site.name;

        // 특이사항이 있으면 아이콘 표시
        if (site.notes && site.notes.trim()) {
          const noteIcon = document.createElement('span');
          noteIcon.innerHTML = ' <i data-lucide="sticky-note" style="width: 14px; height: 14px; vertical-align: text-bottom;"></i>';
          noteIcon.title = '특이사항 있음';
          name.appendChild(noteIcon);
        }

        const address = document.createElement('div');
        address.className = 'site-item-address';
        address.textContent = site.address || '주소 없음';

        infoDiv.appendChild(name);
        infoDiv.appendChild(address);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'site-item-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'site-item-edit';
        editBtn.textContent = '수정';
        editBtn.onclick = () => editSite(id, site.name, site.address, site.notes || '');
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'site-item-delete';
        deleteBtn.textContent = '삭제';
        deleteBtn.onclick = () => deleteSite(id);
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        li.appendChild(infoDiv);
        li.appendChild(actionsDiv);
        list.appendChild(li);
      });
    }

    function renderSiteSelectList() {
      const list = document.getElementById('siteSelectList');
      list.innerHTML = '';
      Object.keys(sites).forEach(id => {
        const site = sites[id];
        const li = document.createElement('li');
        li.className = 'site-item';
        li.onclick = () => selectSite(site.name);
        const name = document.createElement('span');
        name.className = 'site-item-name';
        name.textContent = site.name;
        li.appendChild(name);
        list.appendChild(li);
      });
    }

    function selectSite(siteName) {
      document.getElementById('siteInput').value = siteName;
      toggleSiteSelectModal();
    }
    
    window.saveSite = function() {
      const nameInput = document.getElementById('newSiteName');
      const addressInput = document.getElementById('newSiteAddress');
      const notesInput = document.getElementById('newSiteNotes');
      const name = nameInput.value.trim();
      const address = addressInput.value.trim();
      const notes = notesInput.value.trim();

      if (!name) {
        showToast('현장명을 입력하세요.', 'warning');
        return;
      }
      if (!address) {
        showToast('주소를 입력하세요.', 'warning');
        return;
      }
      
      if (currentEditingSiteId) {
        console.log('✅ 현장 수정:', currentEditingSiteId);

        const oldSite = sites[currentEditingSiteId];
        const oldSiteName = oldSite ? oldSite.name : '';

        console.log(`🔄 현장명 변경: "${oldSiteName}" → "${name}"`);

        // 팀이 있으면 팀 현장, 없으면 개인 현장
        let sitePath;
        if (currentTeamId) {
          sitePath = `teams/${currentTeamId}/sites/${currentEditingSiteId}`;
        } else {
          sitePath = `companies/${currentCompanyId}/sites/${currentEditingSiteId}`;
        }

        const siteRef = window.dbRef(window.db, sitePath);
        window.dbUpdate(siteRef, {
          name: name,
          address: address,
          notes: notes,
          updatedAt: new Date().toISOString()
        }).then(() => {
          
          if (oldSiteName !== name) {
            console.log('📋 현장명이 변경되어 관련 작업들을 업데이트합니다...');
            
            const updates = {};
            let updatedCount = 0;
            
            Object.keys(works).forEach(workId => {
              const work = works[workId];
              
              const oldSiteObj = Object.values(sites).find(s => s.name === oldSiteName);
              const oldSiteAddress = oldSiteObj ? oldSiteObj.address : '';
              
              const workSiteObj = Object.values(sites).find(s => s.name === work.site);
              const workSiteAddress = workSiteObj ? workSiteObj.address : '';
              
              if (areSitesSimilar(oldSiteName, oldSiteAddress, work.site, workSiteAddress)) {
                // 팀이 있으면 팀 작업, 없으면 개인 작업
                if (currentTeamId) {
                  updates[`teams/${currentTeamId}/worklists/${workId}/site`] = name;
                } else {
                  updates[`companies/${currentCompanyId}/works/${workId}/site`] = name;
                }
                works[workId].site = name;
                updatedCount++;
                console.log(`  ✅ 작업 업데이트: ${workId} - "${work.work}"`);
              }
            });
            
            if (updatedCount > 0) {
              window.dbUpdate(window.dbRef(window.db), updates).then(() => {
                showToast(`현장이 수정되었습니다. (관련 작업 ${updatedCount}개 업데이트됨)`, 'success', 4000);
                cancelEditSite();
                renderWorks();
              }).catch((error) => {
                showToast('작업 업데이트 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
              });
            } else {
              showToast('현장이 수정되었습니다.', 'success');
              cancelEditSite();
            }
            
          } else {
            showToast('현장 정보가 수정되었습니다.', 'success');
            cancelEditSite();
          }
          
        }).catch((error) => {
          showToast('현장 수정 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
        });
        
      } else {
        console.log('✅ 현장 추가');

        // 팀이 있으면 팀 현장, 없으면 개인 현장
        let sitesPath;
        if (currentTeamId) {
          sitesPath = `teams/${currentTeamId}/sites`;
        } else {
          sitesPath = `companies/${currentCompanyId}/sites`;
        }
        const sitesRef = window.dbRef(window.db, sitesPath);
        const newSiteRef = window.dbPush(sitesRef);
        window.dbSet(newSiteRef, {
          name: name,
          address: address,
          notes: notes,
          createdAt: new Date().toISOString()
        }).then(() => {
          nameInput.value = '';
          addressInput.value = '';
          notesInput.value = '';
          showToast('현장이 추가되었습니다.', 'success');
        }).catch((error) => {
          showToast('현장 추가 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
        });
      }
    };

    function deleteSite(id) {
      if (!confirm('이 현장을 삭제하시겠습니까?')) return;

      // 팀이 있으면 팀 현장, 없으면 개인 현장
      let sitePath;
      if (currentTeamId) {
        sitePath = `teams/${currentTeamId}/sites/${id}`;
      } else {
        sitePath = `companies/${currentCompanyId}/sites/${id}`;
      }
      const siteRef = window.dbRef(window.db, sitePath);
      window.dbRemove(siteRef);
    }

    window.editSite = function(siteId, siteName, siteAddress, siteNotes) {
      console.log('✏️ 현장 수정 시작:', siteId);

      currentEditingSiteId = siteId;

      document.getElementById('newSiteName').value = siteName;
      document.getElementById('newSiteAddress').value = siteAddress;
      document.getElementById('newSiteNotes').value = siteNotes || '';

      document.getElementById('siteModalTitle').textContent = '현장 수정';

      document.getElementById('saveSiteBtn').textContent = '수정 완료';

      document.getElementById('cancelEditBtn').style.display = 'block';

      document.getElementById('newSiteName').focus();
    };

    window.cancelEditSite = function() {
      console.log('❌ 현장 수정 취소');

      currentEditingSiteId = null;

      document.getElementById('newSiteName').value = '';
      document.getElementById('newSiteAddress').value = '';
      document.getElementById('newSiteNotes').value = '';

      document.getElementById('siteModalTitle').textContent = '현장 추가';

      document.getElementById('saveSiteBtn').textContent = '저장';

      document.getElementById('cancelEditBtn').style.display = 'none';
    };
    
    function calculateBusinessDays(startDate, endDate) {
      if (startDate > endDate) return -1;
      let count = 0;
      let curDate = new Date(startDate.getTime());
      while (curDate < endDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek != 0 && dayOfWeek != 6) count++;
        curDate.setDate(curDate.getDate() + 1);
      }
      return count;
    }

    function calculateAbsoluteDays(startDate, endDate) {
      const oneDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.round((endDate - startDate) / oneDay);
      return diffDays;
    }

    function addBusinessDays(startDate, businessDays) {
      const date = new Date(startDate);
      let count = 0;
      while (count < businessDays) {
        date.setDate(date.getDate() + 1);
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          count++;
        }
      }
      return date.toISOString().split('T')[0];
    }

    function addCalendarDays(startDate, days) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    }
    
    document.getElementById('timelineModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('timelineModal')) {
        closeTimelineModal();
      }
    });
    document.getElementById('siteModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('siteModal')) {
        toggleSiteModal();
      }
    });
    document.getElementById('siteSelectModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('siteSelectModal')) {
        toggleSiteSelectModal();
      }
    });

    document.getElementById('companyIdInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('companyPasswordInput').focus();
      }
    });
    
    document.getElementById('companyPasswordInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loginCompany();
      }
    });
    
    document.getElementById('newCompanyIdInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('newCompanyPasswordInput').focus();
      }
    });
    
    document.getElementById('newCompanyPasswordInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('confirmPasswordInput').focus();
      }
    });
    
    document.getElementById('confirmPasswordInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        createCompany();
      }
    });
        
    document.getElementById('siteInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('workInput').focus();
      }
    });
    document.getElementById('workInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addWork();
    });

    const newUserInput = document.getElementById('newUserInput');
    if (newUserInput) {
      newUserInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewUser();
      });
    }

    document.getElementById('newSiteName').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') saveSite();
    });
    
    let currentEditingWorkId = null;

    function openDeadlineModal(workId, currentDeadline) {
      console.log('📅 [모달] openDeadlineModal 호출됨:', workId, currentDeadline);
      currentEditingWorkId = workId;
      const modal = document.getElementById('deadlineModal');
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const friday = new Date(today);
      const day = today.getDay();
      const diff = (5 - day + 7) % 7;
      friday.setDate(friday.getDate() + (diff === 0 ? 7 : diff));
      document.getElementById('todayDate').textContent = today.toISOString().split('T')[0];
      document.getElementById('tomorrowDate').textContent = tomorrow.toISOString().split('T')[0];
      document.getElementById('thisWeekDate').textContent = friday.toISOString().split('T')[0];
      document.getElementById('customDeadlineInput').value = currentDeadline;
      modal.classList.add('active');
      console.log('📅 [모달] 모달 활성화됨');
    }

    window.openDeadlineModal = openDeadlineModal;
    
    window.selectDeadline = function(option) {
      if (!currentEditingWorkId) return;
      let selectedDate;
      const today = new Date();
      switch (option) {
        case 'today':
          selectedDate = today.toISOString().split('T')[0];
          break;
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          selectedDate = tomorrow.toISOString().split('T')[0];
          break;
        case 'thisWeek':
          const friday = new Date(today);
          const day = today.getDay();
          const diff = (5 - day + 7) % 7;
          friday.setDate(friday.getDate() + (diff === 0 ? 7 : diff));
          selectedDate = friday.toISOString().split('T')[0];
          break;
        case 'custom':
          selectedDate = document.getElementById('customDeadlineInput').value;
          if (!selectedDate) {
            showToast('날짜를 선택하세요.', 'warning');
            return;
          }
          break;
      }

      // 팀이 있으면 팀 작업, 없으면 개인 작업
      let worksPath;
      if (currentTeamId) {
        worksPath = `teams/${currentTeamId}/worklists/${currentEditingWorkId}`;
      } else {
        worksPath = `companies/${currentCompanyId}/works/${currentEditingWorkId}`;
      }

      const workRef = window.dbRef(window.db, worksPath);
      window.dbUpdate(workRef, {
        deadline: selectedDate
      });
      document.getElementById('deadlineModal').classList.remove('active');
      currentEditingWorkId = null;
    };
    
    document.getElementById('deadlineModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('deadlineModal')) {
        document.getElementById('deadlineModal').classList.remove('active');
        currentEditingWorkId = null;
      }
    });
    
    function renderMenu() {
      const adminSection = document.getElementById('adminMenuSection');
      
      if (adminSection) {
        if (isAdmin) {
          adminSection.style.display = 'block';
          console.log('✅ 관리자 메뉴 표시');
        } else {
          adminSection.style.display = 'none';
          console.log('ℹ️ 일반 사용자 - 관리자 메뉴 숨김');
        }
      }
    }
    
    // ✅ toggleMenu 함수 - renderMenu() 함수 바로 다음에 위치
    
    
    // 외부 클릭 감지 (DOMContentLoaded 후에 실행되도록 수정)
    function initMenuEventListeners() {
      console.log('🚀 메뉴 이벤트 리스너 초기화 시작...');
      
      let isMenuButtonClick = false;
      
      // 전역 클릭 이벤트
      document.addEventListener('click', function(e) {
        if (isMenuButtonClick) {
          isMenuButtonClick = false;
          return;
        }
        
        const menu = document.getElementById('menuDropdown');
        const menuBtn = document.querySelector('.menu-btn');
        
        if (!menu || !menuBtn) return;
        
        // 메뉴 버튼 클릭
        if (menuBtn.contains(e.target)) {
          isMenuButtonClick = true;
          return;
        }
        
        // 메뉴 내부 클릭
        if (menu.contains(e.target)) {
          return;
        }
        
        // 외부 클릭 - 메뉴 닫기
        if (menu.classList.contains('active')) {
          menu.classList.remove('active');
          menuBtn.classList.remove('active');
          const overlay = document.getElementById('menuOverlay');
          if (overlay) overlay.classList.remove('active');
          console.log('🔒 외부 클릭으로 메뉴 닫힘');
        }
      });
      
      // 오버레이 클릭 이벤트
      const overlay = document.getElementById('menuOverlay');
      if (overlay) {
        overlay.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const menu = document.getElementById('menuDropdown');
          const menuBtn = document.querySelector('.menu-btn');
          
          if (menu) menu.classList.remove('active');
          if (menuBtn) menuBtn.classList.remove('active');
          if (overlay) overlay.classList.remove('active');
          
          console.log('🔒 오버레이 클릭으로 메뉴 닫힘');
        });
      }
      
      console.log('✅ 메뉴 이벤트 리스너 초기화 완료');
    }

    window.copyCompanyCode = function() {
      if (!companyInfo || !companyInfo.companyCode) {
        showToast('팀코드를 불러올 수 없습니다.', 'error');
        return;
      }

      const code = companyInfo.companyCode;
      const btn = document.getElementById('copyBtn');

      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          // 버튼 텍스트 변경
          if (btn) {
            btn.innerHTML = '✓ 복사완료!';
            btn.style.background = '#4caf50';

            // 2초 후 원래대로
            setTimeout(() => {
              btn.innerHTML = '📋 복사하기';
              btn.style.background = '';
            }, 2000);
          }

          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }).catch(err => {
          fallbackCopy(code);
        });
      } else {
        fallbackCopy(code);
      }
    };

    function renderStaffList() {
      const list = document.getElementById('staffList');
      const countSpan = document.getElementById('staffCount');
      
      if (!list) return;
      
      list.innerHTML = '';
      
      // ✅ 관리자 포함한 전체 직원 수
      countSpan.textContent = assignees.length;
      
      assignees.forEach(user => {
        const li = document.createElement('li');
        li.className = 'site-item';
        
        // 관리자는 노란색 배경
        if (user.isAdmin) {
          li.style.background = 'linear-gradient(135deg, #fff8e1 0%, #ffe082 100%)';
          li.style.borderLeft = '4px solid #FFD700';
        }
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'site-item-info';
        
        const name = document.createElement('div');
        name.className = 'site-item-name';
        name.textContent = user.name;
        
        if (user.isAdmin) {
          const badge = document.createElement('span');
          badge.style.cssText = 'margin-left: 8px; font-size: 12px; color: #F57C00; font-weight: 600;';
          badge.textContent = '👑 관리자';
          name.appendChild(badge);
        }
        
        const role = document.createElement('div');
        role.className = 'site-item-address';
        role.textContent = user.isAdmin ? '모든 권한 보유' : '일반 직원';
        
        infoDiv.appendChild(name);
        infoDiv.appendChild(role);
        
        // ✅ 관리자가 아닐 때만 퇴출 버튼 표시
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'site-item-actions';
        
        if (!user.isAdmin) {
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'site-item-delete';
          deleteBtn.textContent = '퇴출';
          deleteBtn.onclick = () => removeStaff(user.id, user.name);
          actionsDiv.appendChild(deleteBtn);
        }
        
        li.appendChild(infoDiv);
        li.appendChild(actionsDiv);  // ✅ 항상 추가 (빈 div라도)
        
        list.appendChild(li);
      });
      
      if (assignees.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">등록된 직원이 없습니다.</p>';
      }
    }
    
    window.removeStaff = function(userId, userName) {
      if (!isAdmin) {
        showToast('관리자만 사용할 수 있습니다.', 'warning');
        return;
      }
      
      const confirmMsg = 
        `⚠️ 직원 퇴출 확인 ⚠️\n\n` +
        `직원: ${userName}\n\n` +
        `이 직원을 퇴출하면:\n` +
        `• 더 이상 로그인할 수 없습니다\n` +
        `• 담당했던 작업은 유지됩니다\n\n` +
        `정말로 퇴출하시겠습니까?`;
      
      if (!confirm(confirmMsg)) {
        return;
      }
      
      const assigneeRef = window.dbRef(window.db, `companies/${currentCompanyId}/assignees/${userId}`);
      window.dbRemove(assigneeRef).then(() => {
        showToast(`${userName}님이 퇴출되었습니다.`, 'success');
        console.log('✅ 직원 퇴출 완료:', userName);
      }).catch((error) => {
        showToast('직원 퇴출 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
        console.error('❌ 직원 퇴출 실패:', error);
      });
    };

    window.saveCompanyInfo = function() {
      if (!isAdmin) {
        showToast('관리자만 사용할 수 있습니다.', 'warning');
        return;
      }
      
      const newCompanyName = document.getElementById('editCompanyName').value.trim();
      const currentPassword = document.getElementById('currentPasswordForEdit').value;
      const newPassword = document.getElementById('newPasswordForEdit').value;
      const confirmPassword = document.getElementById('confirmNewPassword').value;
      
      if (!newCompanyName) {
        showToast('회사명을 입력하세요.', 'warning');
        return;
      }
      
      if (!currentPassword) {
        showToast('현재 비밀번호를 입력하세요.', 'warning');
        return;
      }
      
      if (!companyInfo || companyInfo.password !== currentPassword) {
        showToast('현재 비밀번호가 일치하지 않습니다.', 'error');
        return;
      }
      
      if (newPassword) {
        if (newPassword.length < 4) {
          showToast('새 비밀번호는 최소 4자 이상이어야 합니다.', 'warning');
          return;
        }
        
        if (newPassword !== confirmPassword) {
          showToast('새 비밀번호가 일치하지 않습니다.', 'warning');
          return;
        }
      }
      
      const updates = {
        name: newCompanyName,
        updatedAt: new Date().toISOString()
      };
      
      if (newPassword) {
        updates.password = newPassword;
      }
      
      const companyInfoRef = window.dbRef(window.db, `companies/${currentCompanyId}/info`);
      window.dbUpdate(companyInfoRef, updates).then(() => {
        let message = '회사 정보가 수정되었습니다.';
        
        if (newPassword) {
          message += '\n\n비밀번호도 변경되었습니다.';
          
          if (localStorage.getItem('autoLogin') === 'true') {
            localStorage.setItem('savedPassword', newPassword);
          }
        }

        showToast(message, 'success', 4000);

        toggleCompanyInfoModal();
        
        console.log('✅ 회사 정보 수정 완료');
      }).catch((error) => {
        showToast('회사 정보 수정 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
        console.error('❌ 회사 정보 수정 실패:', error);
      });
    };

    function renderTransferAdminList() {
      const select = document.getElementById('newAdminSelect');
      
      if (!select) return;
      
      select.innerHTML = '<option value="">선택하세요</option>';
      
      assignees.forEach(user => {
        if (user.id !== currentUserId && !user.isAdmin) {
          const option = document.createElement('option');
          option.value = user.id;
          option.textContent = user.name;
          select.appendChild(option);
        }
      });
      
      if (assignees.length <= 1) {
        select.innerHTML = '<option value="">권한을 이전할 직원이 없습니다</option>';
        select.disabled = true;
      } else {
        select.disabled = false;
      }
    }
    
    window.transferAdmin = function() {
      if (!isAdmin) {
        showToast('관리자만 사용할 수 있습니다.', 'warning');
        return;
      }
      
      const newAdminId = document.getElementById('newAdminSelect').value;
      const password = document.getElementById('passwordForTransfer').value;
      
      if (!newAdminId) {
        showToast('새 관리자를 선택하세요.', 'warning');
        return;
      }
      
      if (!password) {
        showToast('비밀번호를 입력하세요.', 'warning');
        return;
      }
      
      if (!companyInfo || companyInfo.password !== password) {
        showToast('비밀번호가 일치하지 않습니다.', 'error');
        return;
      }
      
      const newAdmin = assignees.find(a => a.id === newAdminId);
      
      if (!newAdmin) {
        showToast('선택한 직원을 찾을 수 없습니다.', 'error');
        return;
      }
      
      const finalConfirm = confirm(
        `⚠️ 최종 확인 ⚠️\n\n` +
        `새 관리자: ${newAdmin.name}\n\n` +
        `권한을 이전하면:\n` +
        `• ${newAdmin.name}님이 새 관리자가 됩니다\n` +
        `• 본인(${currentUser})은 일반 직원이 됩니다\n` +
        `• 이 작업은 되돌릴 수 없습니다\n\n` +
        `정말로 진행하시겠습니까?`
      );
      
      if (!finalConfirm) {
        return;
      }
      
      const updates = {};
      
      updates[`companies/${currentCompanyId}/info/adminId`] = newAdminId;
      
      updates[`companies/${currentCompanyId}/assignees/${newAdminId}/isAdmin`] = true;
      
      updates[`companies/${currentCompanyId}/assignees/${currentUserId}/isAdmin`] = false;
      
      window.dbUpdate(window.dbRef(window.db), updates).then(() => {
        showToast(`권한 이전이 완료되었습니다! 새 관리자: ${newAdmin.name}`, 'success', 4000);

        logout();
        
        console.log('✅ 관리자 권한 이전 완료:', newAdmin.name);
      }).catch((error) => {
        showToast('권한 이전 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
        console.error('❌ 권한 이전 실패:', error);
      });
    };

    function fallbackCopy(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();

      const btn = document.getElementById('copyBtn');

      try {
        document.execCommand('copy');

        // 버튼 텍스트 변경
        if (btn) {
          btn.innerHTML = '✓ 복사완료!';
          btn.style.background = '#4caf50';

          // 2초 후 원래대로
          setTimeout(() => {
            btn.innerHTML = '📋 복사하기';
            btn.style.background = '';
          }, 2000);
        }
      } catch (err) {
        showToast(`코드를 복사할 수 없습니다. 수동으로 복사하세요: ${text}`, 'error', 5000);
      }

      document.body.removeChild(textArea);
    }
    
    window.regenerateCompanyCode = function() {
      if (!isAdmin) {
        showToast('관리자만 사용할 수 있습니다.', 'warning');
        return;
      }
      
      const confirmMsg = 
        '⚠️ 회사 코드 재발급 경고 ⚠️\n\n' +
        '코드를 재발급하면:\n' +
        '• 기존 코드는 사용할 수 없습니다\n' +
        '• 새로운 직원은 새 코드로만 가입 가능합니다\n' +
        '• 기존 직원에게는 영향이 없습니다\n\n' +
        '정말로 재발급하시겠습니까?';
      
      if (!confirm(confirmMsg)) {
        return;
      }
      
      const password = prompt('비밀번호를 입력하여 확인하세요:');
      
      if (!password) {
        showToast('재발급이 취소되었습니다.', 'info');
        return;
      }
      
      if (!companyInfo || companyInfo.password !== password) {
        showToast('비밀번호가 일치하지 않습니다.', 'error');
        return;
      }
      
      const newCode = generateCompanyCode();
      
      const companyInfoRef = window.dbRef(window.db, `companies/${currentCompanyId}/info`);
      window.dbUpdate(companyInfoRef, {
        companyCode: newCode,
        codeUpdatedAt: new Date().toISOString()
      }).then(() => {
        showToast(`회사 코드가 재발급되었습니다! (새 코드: ${newCode})`, 'success', 5000);

        document.getElementById('displayCompanyCode').textContent = newCode;
        
        console.log('✅ 회사 코드 재발급 완료:', newCode);
      }).catch((error) => {
        showToast('코드 재발급 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
        console.error('❌ 코드 재발급 실패:', error);
      });
    };
           
    document.getElementById('guideModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('guideModal')) {
        toggleGuideModal();
      }
    });

    window.onload = function() {
      waitForFirebase();
    };

    // 모달 외부 클릭 이벤트 추가
    document.getElementById('companyCodeModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('companyCodeModal')) {
        toggleCompanyCodeModal();
      }
    });
    
    document.getElementById('staffManageModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('staffManageModal')) {
        toggleStaffManageModal();
      }
    });
    
    document.getElementById('companyInfoModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('companyInfoModal')) {
        toggleCompanyInfoModal();
      }
    });
    
    document.getElementById('transferAdminModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('transferAdminModal')) {
        toggleTransferAdminModal();
      }
    });
    
    // 닫기 버튼 이벤트도 추가로 확인
    console.log('✅ 모든 모달 이벤트 리스너 등록 완료');

    // ========================================
    // 모달 이벤트 리스너 초기화
    // ========================================
    function initModalEventListeners() {
      console.log('🎯 모달 이벤트 리스너 초기화 시작...');
      
      const modals = [
        { id: 'companyCodeModal', toggle: window.toggleCompanyCodeModal },
        { id: 'staffManageModal', toggle: window.toggleStaffManageModal },
        { id: 'companyInfoModal', toggle: window.toggleCompanyInfoModal },
        { id: 'transferAdminModal', toggle: window.toggleTransferAdminModal },
        { id: 'guideModal', toggle: window.toggleGuideModal }
      ];
      
      modals.forEach(({ id, toggle }) => {
        const modal = document.getElementById(id);
        if (modal) {
          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              toggle();
            }
          });
          console.log(`✅ ${id} 이벤트 등록 완료`);
        } else {
          console.error(`❌ ${id}를 찾을 수 없습니다`);
        }
      });
      
      console.log('✅ 모든 모달 이벤트 리스너 등록 완료');
    }

    // 네비게이션 실행 (카카오맵)
    window.launchNavigation = function() {
      console.log('🧭 [네비] 카카오맵 네비 실행 시작');

      try {
        const searchDate = currentDate.toISOString().split('T')[0];
        const myActiveWorks = [];

        // 내 작업 리스트 가져오기
        Object.keys(works).forEach(workId => {
          const work = works[workId];
          if (work.completed) return;
          if (work.assignee !== currentUser) return;
          let shouldShow = false;
          if (work.work === '시험' || work.parentWorkId) {
            shouldShow = work.date === searchDate;
          } else {
            shouldShow = work.date <= searchDate;
          }
          if (shouldShow) {
            myActiveWorks.push(work);
          }
        });

        // 순서대로 정렬
        myActiveWorks.sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : 999;
          const orderB = typeof b.order === 'number' ? b.order : 999;
          if (orderA === orderB) {
            return a.id.localeCompare(b.id);
          }
          return orderA - orderB;
        });

        console.log('📋 [네비] 내 작업:', myActiveWorks.length, '개');

        if (myActiveWorks.length === 0) {
          showToast('실행할 작업이 없습니다.', 'info');
          return;
        }

        // 로딩 표시
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
          loadingOverlay.classList.add('active');
          const loadingText = loadingOverlay.querySelector('.loading-text');
          if (loadingText) {
            loadingText.textContent = '네비게이션 준비 중...';
          }
        }

        console.log('📍 [네비] 위치 정보 요청 중...');

        // 현재 위치 가져오기
        if (!navigator.geolocation) {
          if (loadingOverlay) loadingOverlay.classList.remove('active');
          showToast('이 브라우저는 위치 서비스를 지원하지 않습니다.', 'error');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async function(position) {
            try {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              console.log('✅ [네비] 현재 위치:', lat, lng);

              // 출발지 (현재 위치)
              const sp = `${lat},${lng}`;

              // 카카오 Geocoder로 각 현장의 주소를 좌표로 변환
              const geocoder = new kakao.maps.services.Geocoder();
              const workCoords = [];

              console.log('🔍 [네비] 주소를 좌표로 변환 중...');
              console.log('🔍 [네비] sites 객체:', sites);

              for (const work of myActiveWorks) {
                console.log(`🔍 [네비] 처리 중인 작업: ${work.site}`);

                // 현장 이름으로 sites에서 현장 정보 찾기
                let siteInfo = null;
                for (const siteId in sites) {
                  if (sites[siteId].name === work.site) {
                    siteInfo = sites[siteId];
                    break;
                  }
                }

                console.log(`🔍 [네비] 현장 정보:`, siteInfo);

                if (!siteInfo || !siteInfo.address) {
                  if (loadingOverlay) loadingOverlay.classList.remove('active');
                  console.warn(`⚠️ [네비] 현장 "${work.site}"의 주소를 찾을 수 없습니다`);
                  showToast(`현장 "${work.site}"의 주소 정보가 없습니다. 현장 관리에서 주소를 등록해주세요.`, 'warning', 4000);
                  return;
                }

                // 주소를 좌표로 변환
                const coord = await new Promise((resolve, reject) => {
                  geocoder.addressSearch(siteInfo.address, function(result, status) {
                    if (status === kakao.maps.services.Status.OK) {
                      console.log(`✅ [네비] ${work.site}: ${result[0].y}, ${result[0].x}`);
                      resolve({ y: result[0].y, x: result[0].x });
                    } else {
                      console.error(`❌ [네비] 주소 변환 실패: ${siteInfo.address}, 상태:`, status);
                      reject(new Error(`주소 변환 실패: ${siteInfo.address}`));
                    }
                  });
                });

                workCoords.push({
                  siteName: work.site,
                  lat: coord.y,
                  lng: coord.x
                });
              }

              console.log('✅ [네비] 모든 좌표 변환 완료:', workCoords);

              // 목적지 (마지막 작업지)
              const lastCoord = workCoords[workCoords.length - 1];
              const ep = `${lastCoord.lat},${lastCoord.lng}`;

              // 경유지 (중간 작업지들) - 최대 5개까지 지원 (vp, vp2, vp3, vp4, vp5)
              let waypointParams = '';
              if (workCoords.length > 1) {
                const waypoints = workCoords.slice(0, -1); // 마지막 제외한 모든 작업지
                waypoints.slice(0, 5).forEach((coord, index) => {
                  if (index === 0) {
                    waypointParams += `&vp=${coord.lat},${coord.lng}`;
                  } else {
                    waypointParams += `&vp${index + 1}=${coord.lat},${coord.lng}`;
                  }
                });
              }

              const url = `kakaomap://route?sp=${sp}&ep=${ep}&by=CAR${waypointParams}`;
              console.log('🗺️ [네비] 경유지 개수:', workCoords.length - 1);
              console.log('🗺️ [네비] 경유지 파라미터:', waypointParams);
              console.log('🗺️ [네비] 카카오맵 URL:', url);

              if (loadingOverlay) loadingOverlay.classList.remove('active');

              // 앱 실행 성공 여부 체크
              let appLaunched = false;

              const checkAppLaunched = () => {
                appLaunched = true;
              };

              // 페이지가 백그라운드로 가면 앱이 실행된 것으로 간주
              window.addEventListener('blur', checkAppLaunched, { once: true });
              document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                  appLaunched = true;
                }
              }, { once: true });

              window.location.href = url;

              // 2초 후에도 앱이 실행되지 않았으면 설치 확인
              setTimeout(() => {
                window.removeEventListener('blur', checkAppLaunched);

                if (!appLaunched) {
                  if (confirm('카카오맵 앱이 설치되어 있지 않습니다.\n앱 스토어로 이동하시겠습니까?')) {
                    window.location.href = 'https://play.google.com/store/apps/details?id=net.daum.android.map';
                  }
                }
              }, 2000);

            } catch (error) {
              if (loadingOverlay) loadingOverlay.classList.remove('active');
              console.error('❌ [네비] 좌표 변환 오류:', error);
              showToast('주소를 좌표로 변환하는 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
            }
          },
          function(error) {
            if (loadingOverlay) loadingOverlay.classList.remove('active');
            console.error('❌ [네비] 위치 정보 에러:', error);

            let errorMsg = '위치 정보를 가져올 수 없습니다.\n\n';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMsg += '위치 권한이 거부되었습니다.\n브라우저 설정에서 위치 권한을 허용해주세요.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMsg += '위치 정보를 사용할 수 없습니다.';
                break;
              case error.TIMEOUT:
                errorMsg += '위치 정보 요청 시간이 초과되었습니다.';
                break;
              default:
                errorMsg += '알 수 없는 오류가 발생했습니다.';
            }
            showToast(errorMsg, 'error', 4000);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } catch (error) {
        console.error('❌ [네비] 전체 오류:', error);
        showToast('네비게이션 실행 중 오류가 발생했습니다: ' + error.message, 'error', 4000);
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.classList.remove('active');
      }
    };

    window.onload = function() {
      waitForFirebase();
    };

    // 기존의 모달 외부 클릭 이벤트는 삭제해도 됩니다 (중복이므로)
    console.log('✅ 모든 모달 이벤트 리스너 등록 완료');

    // ===== 이미지 관련 함수들 =====

    /**
     * 이미지를 500KB 이하로 압축
     * @param {File} file - 원본 이미지 파일
     * @param {number} maxSizeKB - 최대 크기 (KB), 기본 500KB
     * @returns {Promise<Blob>} - 압축된 이미지 Blob
     */
    window.compressImage = async function(file, maxSizeKB = 500) {
      return new Promise((resolve, reject) => {
        const maxSize = maxSizeKB * 1024; // KB to bytes
        const reader = new FileReader();

        reader.onload = function(e) {
          const img = new Image();
          img.onload = function() {
            let width = img.width;
            let height = img.height;
            let quality = 0.9;

            // 이미지가 이미 작으면 그대로 반환
            if (file.size <= maxSize) {
              resolve(file);
              return;
            }

            // 최대 해상도 제한 (긴 쪽 기준 2048px)
            const maxDimension = 2048;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = (height / width) * maxDimension;
                width = maxDimension;
              } else {
                width = (width / height) * maxDimension;
                height = maxDimension;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // 압축 시도 (최대 5번)
            let attempt = 0;
            const tryCompress = () => {
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error('이미지 압축 실패'));
                    return;
                  }

                  console.log(`압축 시도 ${attempt + 1}: ${(blob.size / 1024).toFixed(1)}KB (목표: ${maxSizeKB}KB)`);

                  if (blob.size <= maxSize || attempt >= 5 || quality <= 0.1) {
                    console.log(`✅ 최종 이미지 크기: ${(blob.size / 1024).toFixed(1)}KB`);
                    resolve(blob);
                  } else {
                    // 크기가 너무 크면 품질 낮추고 재시도
                    quality -= 0.15;
                    attempt++;
                    tryCompress();
                  }
                },
                'image/jpeg',
                quality
              );
            };

            tryCompress();
          };

          img.onerror = () => reject(new Error('이미지 로드 실패'));
          img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        reader.readAsDataURL(file);
      });
    };

    /**
     * 이미지를 Firebase Storage에 업로드
     * @param {Blob} imageBlob - 압축된 이미지 Blob
     * @param {string} folderPath - Storage 경로 (예: 'workImages/teamId/workId')
     * @returns {Promise<string>} - 업로드된 이미지 URL
     */
    window.uploadImageToStorage = async function(imageBlob, folderPath) {
      try {
        if (!window.storage) {
          throw new Error('Firebase Storage가 초기화되지 않았습니다');
        }

        const timestamp = Date.now();
        const fileName = `image_${timestamp}.jpg`;
        const fullPath = `${folderPath}/${fileName}`;

        const imageRef = window.storageRef(window.storage, fullPath);

        console.log(`📤 이미지 업로드 시작: ${fullPath}`);
        const snapshot = await window.storageUploadBytes(imageRef, imageBlob);

        const downloadURL = await window.storageGetDownloadURL(snapshot.ref);
        console.log(`✅ 이미지 업로드 완료: ${downloadURL}`);

        return downloadURL;
      } catch (error) {
        console.error('❌ 이미지 업로드 실패:', error);
        throw error;
      }
    };

    /**
     * Firebase Storage에서 이미지 삭제
     * @param {string} imageUrl - 삭제할 이미지 URL
     */
    window.deleteImageFromStorage = async function(imageUrl) {
      try {
        if (!window.storage) {
          throw new Error('Firebase Storage가 초기화되지 않았습니다');
        }

        // URL에서 경로 추출
        const url = new URL(imageUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);
        if (!pathMatch) {
          throw new Error('잘못된 이미지 URL입니다');
        }

        const path = decodeURIComponent(pathMatch[1]);
        const imageRef = window.storageRef(window.storage, path);

        await window.storageDeleteObject(imageRef);
        console.log(`🗑️ 이미지 삭제 완료: ${path}`);
      } catch (error) {
        console.error('❌ 이미지 삭제 실패:', error);
        // 삭제 실패는 치명적이지 않으므로 에러를 throw하지 않음
      }
    };

    // ========================================
    // ⭐ PWA 설치 프롬프트
    // ========================================

    let deferredPrompt = null;

    // PWA 설치 가능 이벤트 감지
    window.addEventListener('beforeinstallprompt', (e) => {
      // 기본 미니 인포바 방지
      e.preventDefault();

      // 나중에 사용하기 위해 이벤트 저장
      deferredPrompt = e;

      // 설치 버튼 표시
      const installBtn = document.getElementById('installBtn');
      if (installBtn) {
        installBtn.style.display = 'flex';
        console.log('📱 PWA 설치 가능 - 버튼 표시됨');
      }
    });

    // 설치 버튼 클릭 핸들러
    window.showInstallPrompt = async function() {
      if (!deferredPrompt) {
        // iOS Safari인지 확인
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (isIOS || isSafari) {
          showToast('Safari: 공유 버튼(⬆️) → "홈 화면에 추가" 를 눌러주세요', 'info', UI_CONSTANTS.TOAST_DURATION_LONG);
        } else if (window.matchMedia('(display-mode: standalone)').matches) {
          showToast('이미 홈 화면에 추가되었습니다', 'info');
        } else {
          showToast('Chrome/Edge 브라우저에서 설치할 수 있습니다', 'info');
        }
        return;
      }

      // 설치 프롬프트 표시
      deferredPrompt.prompt();

      // 사용자 선택 결과 대기
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ PWA 설치 수락됨');
        showToast('홈 화면에 추가되었습니다! 🎉', 'success');
      } else {
        console.log('❌ PWA 설치 거부됨');
      }

      // 프롬프트는 한 번만 사용 가능
      deferredPrompt = null;
    };

    // PWA 설치 완료 이벤트
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA 설치 완료');
      deferredPrompt = null;

      const installBtn = document.getElementById('installBtn');
      if (installBtn) {
        installBtn.style.display = 'none';
      }
    });

    // ========================================
    // ⭐ Service Worker 등록 (PWA 필수)
    // ========================================

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker 등록 성공:', registration.scope);
          })
          .catch((error) => {
            console.error('❌ Service Worker 등록 실패:', error);
          });
      });
    }


<script>

<!-- Firebase SDK -->
  <script type="module">
    import {
      initializeApp
    } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import {
      getDatabase,
      ref,
      set,
      push,
      onValue,
      update,
      remove
    } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
    const firebaseConfig = {
      apiKey: "AIzaSyAMv0BmH24fyd0F8CUTkSYSXMlvbcnUXU4",
      authDomain: "work-todo-6ab7f.firebaseapp.com",
      databaseURL: "https://work-todo-6ab7f-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "work-todo-6ab7f",
      storageBucket: "work-todo-6ab7f.firebasestorage.app",
      messagingSenderId: "263893669261",
      appId: "1:263893669261:web:bdce10bec177ff1f67d9c4"
    };
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    window.db = database;
    window.dbRef = ref;
    window.dbSet = set;
    window.dbPush = push;
    window.dbOnValue = onValue;
    window.dbUpdate = update;
    window.dbRemove = remove;
    window.firebaseReady = true;
    console.log('✅ Firebase initialized');

    // ========================================
    // ⭐ 모달 토글 함수들 - 가장 먼저 정의!
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
    
    window.toggleCompanyCodeModal = function() {
      console.log('🔑 회사 코드 모달 토글');
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
      const autoLogin = localStorage.getItem('autoLogin') === 'true';
      const savedCompanyId = localStorage.getItem('savedCompanyId');
      const savedPassword = localStorage.getItem('savedPassword');
      
      if (autoLogin && savedCompanyId && savedPassword) {
        console.log('🔐 자동 로그인 시도...');
        
        try {
          // 1. 회사 정보 확인
          const companyRef = window.dbRef(window.db, `companies/${savedCompanyId}/info`);
          const companyData = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => reject(new Error('Timeout')), 5000);
            window.dbOnValue(companyRef, (snapshot) => {
              clearTimeout(timeoutId);
              resolve(snapshot.val());
            }, { onlyOnce: true });
          });
          
          if (!companyData || companyData.password !== savedPassword) {
            console.log('❌ 자동 로그인 실패 - 로그인 화면 표시');
            clearAutoLogin();
            showLoginScreen();
            return;
          }
          
          // 2. 관리자 정보 로드
          const assigneesRef = window.dbRef(window.db, `companies/${savedCompanyId}/assignees`);
          const assigneesData = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => reject(new Error('Timeout')), 5000);
            window.dbOnValue(assigneesRef, (snapshot) => {
              clearTimeout(timeoutId);
              resolve(snapshot.val());
            }, { onlyOnce: true });
          });
          
          if (!assigneesData) {
            clearAutoLogin();
            showLoginScreen();
            return;
          }
          
          // 3. 관리자 찾기
          let adminUser = null;
          Object.keys(assigneesData).forEach(key => {
            if (assigneesData[key].isAdmin) {
              adminUser = {
                id: key,
                name: assigneesData[key].name,
                isAdmin: true
              };
            }
          });
          
          if (!adminUser) {
            clearAutoLogin();
            showLoginScreen();
            return;
          }
          
          // 4. 전역 변수 설정
          currentCompanyId = savedCompanyId;
          currentUser = adminUser.name;
          currentUserId = adminUser.id;
          isAdmin = true;
          companyInfo = companyData;
          
          console.log('✅ 자동 로그인 성공!');
          
          // 5. 바로 메인 앱 표시
          showMainApp();
          
        } catch (error) {
          console.error('❌ 자동 로그인 오류:', error);
          clearAutoLogin();
          showLoginScreen();
        }
      } else {
        showLoginScreen();
      }
    }

    function showLoginScreen() {
      document.getElementById('companyLoginStep').style.display = 'block';
      
      const savedCompanyId = localStorage.getItem('savedCompanyId');
      if (savedCompanyId) {
        document.getElementById('companyIdInput').value = savedCompanyId;
      }
    }

    function clearAutoLogin() {
      localStorage.removeItem('autoLogin');
      localStorage.removeItem('savedCompanyId');
      localStorage.removeItem('savedPassword');
    }
    
    async function checkCompanyIdAvailability(companyId) {
      return new Promise((resolve) => {
        const companiesRef = window.dbRef(window.db, 'companies');
        window.dbOnValue(companiesRef, (snapshot) => {
          const companies = snapshot.val();
          
          if (!companies) {
            resolve(true);
            return;
          }
          
          const exists = Object.keys(companies).some(id => id === companyId);
          resolve(!exists);
        }, { onlyOnce: true });
      });
    }
    
    // ✅ 팀 생성 (로그인 후)
    window.createTeam = async function() {
      const teamName = document.getElementById('newTeamName').value.trim();
      
      if (!teamName) {
        alert('팀 이름을 입력하세요.');
        return;
      }
      
      const teamsRef = window.dbRef(window.db, 'teams');
      const newTeamRef = window.dbPush(teamsRef);
      const teamId = newTeamRef.key;
      const teamCode = generateTeamCode();  // 6자리 랜덤 코드
      
      // 팀 정보 생성
      await window.dbSet(newTeamRef, {
        info: {
          name: teamName,
          teamCode: teamCode,
          createdAt: new Date().toISOString(),
          createdBy: currentUserId
        },
        members: {
          [currentUserId]: {
            displayName: currentUser.displayName,
            joinedAt: new Date().toISOString(),
            role: 'main'  // 메인 팀
          }
        },
        works: {},
        sites: {}
      });
      
      // 사용자의 팀 목록에 추가
      const userTeamRef = window.dbRef(window.db, `users/${currentUserId}/teams/${teamId}`);
      await window.dbSet(userTeamRef, {
        role: 'main',
        joinedAt: new Date().toISOString()
      });
      
      alert(`팀이 생성되었습니다!\n\n팀 이름: ${teamName}\n팀 코드: ${teamCode}\n\n이 코드를 팀원들에게 공유하세요.`);
      
      loadUserTeams();  // 팀 목록 새로고침
    }
    
    // ✅ 팀 코드로 참여
    window.joinTeamByCode = async function() {
      const teamCode = document.getElementById('teamCodeInput').value.trim();
      const isSubTeam = document.getElementById('isSubTeam').checked;
      const expireDate = document.getElementById('subTeamExpire').value;
      
      if (!teamCode) {
        alert('팀 코드를 입력하세요.');
        return;
      }
      
      if (isSubTeam && !expireDate) {
        alert('보조 팀은 참여 기한을 설정해야 합니다.');
        return;
      }
      
      // 팀 코드로 팀 찾기
      const teamsRef = window.dbRef(window.db, 'teams');
      const snapshot = await new Promise(resolve => {
        window.dbOnValue(teamsRef, resolve, { onlyOnce: true });
      });
      
      const teams = snapshot.val() || {};
      let foundTeamId = null;
      
      Object.keys(teams).forEach(teamId => {
        if (teams[teamId].info?.teamCode === teamCode) {
          foundTeamId = teamId;
        }
      });
      
      if (!foundTeamId) {
        alert('존재하지 않는 팀 코드입니다.');
        return;
      }
      
      // ✅ 이미 참여 중인지 확인
      const userTeamsRef = window.dbRef(window.db, `users/${currentUserId}/teams`);
      const userTeamsSnapshot = await new Promise(resolve => {
        window.dbOnValue(userTeamsRef, resolve, { onlyOnce: true });
      });
      
      const userTeams = userTeamsSnapshot.val() || {};
      if (userTeams[foundTeamId]) {
        alert('이미 참여 중인 팀입니다.');
        return;
      }
      
      // ✅ 메인 팀이 이미 있는지 확인
      const hasMainTeam = Object.values(userTeams).some(t => t.role === 'main');
      
      if (hasMainTeam && !isSubTeam) {
        alert('메인 팀은 1개만 가입할 수 있습니다.\n보조 팀으로 참여하시겠습니까?');
        return;
      }
      
      // 팀 멤버에 추가
      const memberRef = window.dbRef(window.db, `teams/${foundTeamId}/members/${currentUserId}`);
      await window.dbSet(memberRef, {
        displayName: currentUser.displayName,
        joinedAt: new Date().toISOString(),
        role: isSubTeam ? 'sub' : 'main',
        ...(isSubTeam && { expireDate: expireDate })
      });
      
      // 사용자의 팀 목록에 추가
      const userTeamRef = window.dbRef(window.db, `users/${currentUserId}/teams/${foundTeamId}`);
      await window.dbSet(userTeamRef, {
        role: isSubTeam ? 'sub' : 'main',
        joinedAt: new Date().toISOString(),
        ...(isSubTeam && { expireDate: expireDate })
      });
      
      const teamName = teams[foundTeamId].info?.name;
      alert(`팀 참여 완료!\n\n팀: ${teamName}\n역할: ${isSubTeam ? '보조 팀' : '메인 팀'}${isSubTeam ? `\n기한: ${expireDate}` : ''}`);
      
      loadUserTeams();
    }
    
    // ✅ 아이디로 초대
    window.inviteByUsername = async function(teamId) {
      const username = prompt('초대할 팀원의 아이디를 입력하세요:');
      
      if (!username) return;
      
      // 사용자 찾기
      const usersRef = window.dbRef(window.db, 'users');
      const snapshot = await new Promise(resolve => {
        window.dbOnValue(usersRef, resolve, { onlyOnce: true });
      });
      
      const users = snapshot.val() || {};
      let foundUserId = null;
      let foundUser = null;
      
      Object.keys(users).forEach(userId => {
        if (users[userId].profile?.username === username) {
          foundUserId = userId;
          foundUser = users[userId];
        }
      });
      
      if (!foundUserId) {
        alert('존재하지 않는 아이디입니다.');
        return;
      }
      
      // 이미 팀원인지 확인
      const teamMembersRef = window.dbRef(window.db, `teams/${teamId}/members`);
      const membersSnapshot = await new Promise(resolve => {
        window.dbOnValue(teamMembersRef, resolve, { onlyOnce: true });
      });
      
      const members = membersSnapshot.val() || {};
      if (members[foundUserId]) {
        alert('이미 팀에 참여 중인 사용자입니다.');
        return;
      }
      
      // 초대 (실제로는 알림 시스템 구축 권장)
      const inviteRef = window.dbRef(window.db, `users/${foundUserId}/invites/${teamId}`);
      await window.dbSet(inviteRef, {
        teamId: teamId,
        invitedBy: currentUserId,
        invitedAt: new Date().toISOString(),
        status: 'pending'
      });
      
      alert(`${foundUser.profile.displayName}님에게 초대를 보냈습니다.`);
    }
    
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

    // 개인 계정 생성 (관리자 개념 없음)
    window.signUp = async function() {
      const username = document.getElementById('signupUsername').value.trim();
      const password = document.getElementById('signupPassword').value;
      const displayName = document.getElementById('signupDisplayName').value.trim();
      
      if (!username || !password || !displayName) {
        alert('모든 항목을 입력하세요.');
        return;
      }
      
      // ✅ 아이디 중복 확인
      const usersRef = window.dbRef(window.db, 'users');
      const snapshot = await new Promise(resolve => {
        window.dbOnValue(usersRef, resolve, { onlyOnce: true });
      });
      
      const users = snapshot.val() || {};
      const exists = Object.values(users).some(u => u.profile?.username === username);
      
      if (exists) {
        alert('이미 사용 중인 아이디입니다.');
        return;
      }
      
      // ✅ 새 사용자 생성
      const newUserRef = window.dbPush(usersRef);
      const userId = newUserRef.key;
      
      await window.dbSet(newUserRef, {
        profile: {
          username: username,
          password: password,  // 실제로는 해시 처리 권장
          displayName: displayName,
          createdAt: new Date().toISOString()
        },
        teams: {}  // 빈 팀 목록으로 시작
      });
      
      alert(`회원가입 완료!\n\n아이디: ${username}\n이름: ${displayName}\n\n로그인해주세요.`);
      showLoginScreen();
    }
    
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
        }, 1000);
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
      } catch (error) {
        console.error('❌ 지도 초기화 실패:', error);
        document.getElementById('map').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;text-align:center;padding:20px;">지도를 불러올 수 없습니다.<br>페이지를 새로고침 해주세요.</div>';
      }
    }
    
    window.showRouteFromCurrentLocation = function() {
      console.log('🚀 경로 표시 시작');
      if (!map) {
        alert('지도가 초기화되지 않았습니다.');
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
        alert('표시할 작업이 없습니다.');
        return;
      }
      
      if (navigator.geolocation) {
        document.getElementById('loadingOverlay').classList.add('active');
        document.getElementById('routeBtn').disabled = true;
        console.log('📍 현재 위치 요청 중...');
        
        const timeout = setTimeout(() => {
          document.getElementById('loadingOverlay').classList.remove('active');
          document.getElementById('routeBtn').disabled = false;
          alert('위치 정보를 가져오는데 시간이 너무 오래 걸립니다. 다시 시도해주세요.');
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
            document.getElementById('routeBtn').disabled = false;
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
            alert(errorMsg);
            console.error('❌ 위치 정보 에러:', error);
          }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      }
    };
    
    function drawRouteFromCurrentLocation(currentPos, myActiveWorks) {
      console.log('🗺️ 경로 그리기 시작');
      
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
          alert('경로를 표시할 현장의 주소를 찾을 수 없습니다.\n현장 관리에서 주소를 확인해주세요.');
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
            
          routeLine = [];
            
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
          });

          const bounds = new kakao.maps.LatLngBounds();
          routeData.allPoints.forEach(point => bounds.extend(point));
          map.setBounds(bounds);

          document.getElementById('loadingOverlay').classList.remove('active');
          document.getElementById('routeBtn').disabled = false;
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
        document.getElementById('routeBtn').disabled = false;
        isRouteDisplayed = false;
        alert('경로를 표시하는 중 오류가 발생했습니다.');
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
      console.log('⚠️ 백업: 직선 경로로 표시');

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

      const linePath = positions.map(pos => pos.coords);
      routeLine = new kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: '#2a459c',
        strokeOpacity: 0.9,
        strokeStyle: 'solid'
      });
      routeLine.setMap(map);

      const bounds = new kakao.maps.LatLngBounds();
      positions.forEach(pos => bounds.extend(pos.coords));
      map.setBounds(bounds);

      document.getElementById('loadingOverlay').classList.remove('active');
      document.getElementById('routeBtn').disabled = false;
      isRouteDisplayed = true;

      console.log(`✅ 직선 경로 표시 완료`);
    }

    function loadAllCompaniesWorks() {
      const companiesRef = window.dbRef(window.db, 'companies');
      window.dbOnValue(companiesRef, (snapshot) => {
        const companies = snapshot.val() || {};
        allCompaniesWorks = {};
        
        Object.keys(companies).forEach(companyId => {
          allCompaniesWorks[companyId] = {
            name: companies[companyId].info?.name || companyId,
            works: companies[companyId].works || {},
            sites: companies[companyId].sites || {}
          };
        });
        
        if (currentUser) {
          renderWorks();
        }
      });
    }
    
    function loadAssignees() {
      console.log('👥 사용자 목록 로드 중...');
      
      if (!currentCompanyId) {
        console.error('❌ currentCompanyId가 없습니다!');
        return;
      }
      
      const assigneesRef = window.dbRef(window.db, `companies/${currentCompanyId}/assignees`);
      
      window.dbOnValue(assigneesRef, (snapshot) => {
        assignees = [];
        const data = snapshot.val();
        
        console.log('📊 사용자 데이터:', data);
        
        if (data) {
          Object.keys(data).forEach(key => {
            assignees.push({
              id: key,
              name: data[key].name,
              isAdmin: data[key].isAdmin || false
            });
          });
        }
        
        assignees.sort((a, b) => {
          if (a.isAdmin && !b.isAdmin) return -1;
          if (!a.isAdmin && b.isAdmin) return 1;
          return a.name.localeCompare(b.name);
        });
        
        console.log('✅ 사용자 목록 로드 완료:', assignees.length, '명');
  
      }, (error) => {
        console.error('❌ 사용자 목록 로드 실패:', error);
        alert('사용자 목록을 불러오는데 실패했습니다.');
      });
    }
    
    
    window.addNewUser = function() {
      const input = document.getElementById('newUserInput');
      const name = input.value.trim();
      if (!name) {
        alert('사용자 이름을 입력하세요.');
        return;
      }
      if (assignees.some(a => a.name === name)) {
        alert('이미 존재하는 사용자입니다.');
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
      
      if (isAdmin) {
        document.getElementById('headerUserName').innerHTML = 
          `${currentUser} <span style="color: #FFD700; font-size: 11px;">👑 관리자</span>`;
      }
      
      // ✅ 메뉴 버튼 이벤트 직접 연결
      const menuBtn = document.getElementById('mainMenuBtn');
      if (menuBtn) {
        menuBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          toggleMenuFunction();
        });
        console.log('✅ 메뉴 버튼 이벤트 연결 완료');
      } else {
        console.error('❌ 메뉴 버튼을 찾을 수 없습니다');
      }
  
      updateDateDisplay();
      loadAssignees();
      checkExpiredSubTeams();
      loadWorks();
      loadSites();
      loadAllCompaniesWorks();
      renderMenu();
      
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
        alert('회사 탈퇴는 관리자만 할 수 있습니다.');
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
        alert('탈퇴가 취소되었습니다.');
        console.log('❌ 비밀번호 입력 취소됨');
        return;
      }
      
      try {
        const companyRef = window.dbRef(window.db, `companies/${currentCompanyId}/info`);
        
        window.dbOnValue(companyRef, async (snapshot) => {
          const companyInfo = snapshot.val();
          
          if (!companyInfo) {
            alert('회사 정보를 찾을 수 없습니다.');
            return;
          }
          
          if (companyInfo.password !== password) {
            alert('비밀번호가 일치하지 않습니다.');
            console.log('❌ 비밀번호 불일치');
            return;
          }
          
          const finalConfirm = confirm(
            '⚠️ 최종 확인 ⚠️\n\n' +
            '지금 확인을 누르면 회사가 영구적으로 삭제됩니다.\n' +
            '정말로 진행하시겠습니까?'
          );
          
          if (!finalConfirm) {
            alert('탈퇴가 취소되었습니다.');
            console.log('❌ 최종 확인 취소됨');
            return;
          }
          
          const companyDataRef = window.dbRef(window.db, `companies/${currentCompanyId}`);
          
          window.dbRemove(companyDataRef).then(() => {
            console.log('✅ 회사 데이터 삭제 완료');
            
            clearAutoLogin();
            
            alert(
              '회사 탈퇴가 완료되었습니다.\n\n' +
              '모든 데이터가 삭제되었습니다.\n' +
              '이용해 주셔서 감사합니다.'
            );
            
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
            alert('회사 탈퇴 중 오류가 발생했습니다: ' + error.message);
          });
          
        }, { onlyOnce: true });
        
      } catch (error) {
        console.error('❌ 회사 탈퇴 처리 중 오류:', error);
        alert('회사 탈퇴 처리 중 오류가 발생했습니다: ' + error.message);
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
        alert('현장명과 작업 내용을 입력하세요.');
        return;
      }
      const worksRef = window.dbRef(window.db, `companies/${currentCompanyId}/works`);
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
      document.getElementById('siteInput').value = '';
      document.getElementById('workInput').value = '';
    };
     
    function loadWorks() {
      console.log('📋 작업 데이터 로드 중...');
      
      if (!currentCompanyId) {
        console.error('❌ currentCompanyId가 설정되지 않음');
        return;
      }
      
      const worksRef = window.dbRef(window.db, `companies/${currentCompanyId}/works`);
      window.dbOnValue(worksRef, (snapshot) => {
        works = snapshot.val() || {};
        console.log('✅ 작업 데이터 로드 완료:', Object.keys(works).length, '개');
        renderWorks();
      });
    }
    
    function loadSites() {
      const sitesRef = window.dbRef(window.db, `companies/${currentCompanyId}/sites`);
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
          
          const otherCompanyInfo = [];
          if (work.site) {
            Object.keys(allCompaniesWorks).forEach(companyId => {
              if (companyId === currentCompanyId) return;
              
              const companyWorks = allCompaniesWorks[companyId].works || {};
              const companyName = allCompaniesWorks[companyId].name || companyId;
              
              Object.values(companyWorks).forEach(otherWork => {
                if (otherWork.completed) return;
                
                const mySite = Object.values(sites).find(s => s.name === work.site);
                const mySiteAddress = mySite ? mySite.address : '';
                
                const otherCompanySites = allCompaniesWorks[companyId].sites || {};
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
                }
              });
            });
          }
          
          const visibleWork = {
            ...work,
            id: workId,
            displayWork: work.displayWork || work.work,
            isOverdue: isOverdue,
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
        header.innerHTML = '<span class="section-toggle">▼</span> 📌 내 작업 진행 중 <span style="color: #2a459c; font-weight: 700;">(' + myActiveWorks.length + ')</span>';
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
        header.innerHTML = '<span class="section-toggle">▼</span> 👥 팀 작업 진행 중 <span style="color: #666; font-weight: 700;">(' + teamActiveWorks.length + ')</span>';
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
        header.innerHTML = `<span class="section-toggle">▼</span> ✅ 완료됨 <span style="color: #4caf50; font-weight: 700;">(${completedWorks.length})</span>`;
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
          <div class="empty-icon">📋</div>
          <div>이 날짜에 예정된 작업이 없습니다</div>
        `;
        container.appendChild(emptyState);
      }
    }
    
    function toggleSection(sectionKey) {
      sectionStates[sectionKey] = !sectionStates[sectionKey];
      renderWorks();
    }
    
    function createWorkCard(work, isCompleted) {
      const card = document.createElement('div');
      card.className = 'task-card' + (isCompleted ? ' completed' : '');
      if (!isCompleted && work.isOverdue) {
        card.classList.add('overdue');
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
                updates[`works/${workId}/order`] = index;
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
          if (confirm('이 작업을 다시 진행중으로 되돌리시겠습니까?')) {
            toggleComplete(work.id);
          }
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
        warningBadge.textContent = '⚠️ 기한초과';
        title.appendChild(document.createTextNode(' '));
        title.appendChild(warningBadge);
      }
      cardBody.appendChild(title);
      
      if (work.work !== '시험' && !work.parentWorkId) {
        const deadlineContainer = document.createElement('div');
        deadlineContainer.className = 'deadline-label-container';
        deadlineContainer.onclick = (e) => {
          e.stopPropagation();
          if (!isCompleted) {
            openDeadlineModal(work.id, work.deadline || work.date);
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
        dateContainer.style.cursor = 'pointer';
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
        completedLabel.textContent = '✓ 완료: ';
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
      
      card.appendChild(cardBody);

      if (work.otherCompanyInfo && work.otherCompanyInfo.length > 0) {
        const otherCompaniesSection = document.createElement('div');
        otherCompaniesSection.className = 'other-companies-section';
        
        work.otherCompanyInfo.forEach(info => {
          const badge = document.createElement('div');
          badge.className = 'other-company-badge';
          
          const nameLine = document.createElement('div');
          nameLine.className = 'other-company-name-line';
          nameLine.innerHTML = `
            <span class="other-company-name">${info.companyName}</span>
          `;
          
          const assigneeLine = document.createElement('div');
          assigneeLine.className = 'other-company-assignee-line';
          assigneeLine.innerHTML = `
            <span class="other-company-assignee">${info.assignee}</span>
          `;
          
          badge.appendChild(nameLine);
          badge.appendChild(assigneeLine);
          otherCompaniesSection.appendChild(badge);
        });
        
        card.appendChild(otherCompaniesSection);
      }
      
      const personContainer = document.createElement('div');
      personContainer.className = 'person-select-container';
      const assigneeWrapper = document.createElement('div');
      assigneeWrapper.className = 'select-wrapper';
      const assigneeLabel = document.createElement('label');
      assigneeLabel.className = 'select-label';
      assigneeLabel.textContent = '담당자';
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
      deleteBtn.textContent = '🗑️';
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
      
      const workRef = window.dbRef(window.db, `companies/${currentCompanyId}/works/${workId}`);
      const isCompleting = !work.completed;
      
      const updateData = {
        completed: isCompleting
      };
      
      if (isCompleting) {
        updateData.completedDate = new Date().toISOString().split('T')[0];
        
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
    }
    
    function saveAssignee(workId, assignee) {
      const workRef = window.dbRef(window.db, `teams/${currentTeamId}/works/${workId}`);
      window.dbUpdate(workRef, {
        assignee: assignee,
        assignedAt: new Date().toISOString()
      });
    }
    
    function deleteWork(workId) {
      // 권한 체크 제거 - 모든 팀원이 삭제 가능
      const work = works[workId];
      if (!work) return;
      
      if (work.work === '시험') {
        if (!confirm('이 시험 작업과 관련된 모든 작업을 삭제하시겠습니까?')) return;
        // 관련 작업도 삭제
        Object.keys(works).forEach(id => {
          if (works[id].parentWorkId === workId) {
            const childWorkRef = window.dbRef(window.db, `teams/${currentTeamId}/works/${id}`);
            window.dbRemove(childWorkRef);
          }
        });
      } else {
        if (!confirm('이 작업을 삭제하시겠습니까?')) return;
      }
      
      const workRef = window.dbRef(window.db, `teams/${currentTeamId}/works/${workId}`);
      window.dbRemove(workRef);
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
        editBtn.onclick = () => editSite(id, site.name, site.address);
        
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
      const name = nameInput.value.trim();
      const address = addressInput.value.trim();
      
      if (!name) {
        alert('현장명을 입력하세요.');
        return;
      }
      if (!address) {
        alert('주소를 입력하세요.');
        return;
      }
      
      if (currentEditingSiteId) {
        console.log('✅ 현장 수정:', currentEditingSiteId);
        
        const oldSite = sites[currentEditingSiteId];
        const oldSiteName = oldSite ? oldSite.name : '';
        
        console.log(`🔄 현장명 변경: "${oldSiteName}" → "${name}"`);
        
        const siteRef = window.dbRef(window.db, `companies/${currentCompanyId}/sites/${currentEditingSiteId}`);
        window.dbUpdate(siteRef, {
          name: name,
          address: address,
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
                updates[`companies/${currentCompanyId}/works/${workId}/site`] = name;
                works[workId].site = name;
                updatedCount++;
                console.log(`  ✅ 작업 업데이트: ${workId} - "${work.work}"`);
              }
            });
            
            if (updatedCount > 0) {
              window.dbUpdate(window.dbRef(window.db), updates).then(() => {
                alert(`현장이 수정되었습니다.\n관련 작업 ${updatedCount}개도 함께 업데이트되었습니다.`);
                cancelEditSite();
                renderWorks();
              }).catch((error) => {
                alert('작업 업데이트 중 오류가 발생했습니다: ' + error.message);
              });
            } else {
              alert('현장이 수정되었습니다.');
              cancelEditSite();
            }
            
          } else {
            alert('현장 정보가 수정되었습니다.');
            cancelEditSite();
          }
          
        }).catch((error) => {
          alert('현장 수정 중 오류가 발생했습니다: ' + error.message);
        });
        
      } else {
        console.log('✅ 현장 추가');
        
        const sitesRef = window.dbRef(window.db, `companies/${currentCompanyId}/sites`);
        const newSiteRef = window.dbPush(sitesRef);
        window.dbSet(newSiteRef, {
          name: name,
          address: address,
          createdAt: new Date().toISOString()
        }).then(() => {
          nameInput.value = '';
          addressInput.value = '';
          alert('현장이 추가되었습니다.');
        }).catch((error) => {
          alert('현장 추가 중 오류가 발생했습니다: ' + error.message);
        });
      }
    };

    function deleteSite(id) {
      if (!confirm('이 현장을 삭제하시겠습니까?')) return;
      const siteRef = window.dbRef(window.db, `companies/${currentCompanyId}/sites/${id}`);
      window.dbRemove(siteRef);
    }

    window.editSite = function(siteId, siteName, siteAddress) {
      console.log('✏️ 현장 수정 시작:', siteId);
      
      currentEditingSiteId = siteId;
      
      document.getElementById('newSiteName').value = siteName;
      document.getElementById('newSiteAddress').value = siteAddress;
      
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
    document.getElementById('newUserInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addNewUser();
    });
    document.getElementById('newSiteName').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') saveSite();
    });
    
    let currentEditingWorkId = null;

    function openDeadlineModal(workId, currentDeadline) {
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
    }
    
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
            alert('날짜를 선택하세요.');
            return;
          }
          break;
      }
      const workRef = window.dbRef(window.db, `companies/${currentCompanyId}/works/${currentEditingWorkId}`);
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
        alert('회사 코드를 불러올 수 없습니다.');
        return;
      }
      
      const code = companyInfo.companyCode;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          alert(`회사 코드가 복사되었습니다!\n\n코드: ${code}\n\n이 코드를 직원들에게 공유하세요.`);
          
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
        alert('관리자만 사용할 수 있습니다.');
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
        alert(`${userName}님이 퇴출되었습니다.`);
        console.log('✅ 직원 퇴출 완료:', userName);
      }).catch((error) => {
        alert('직원 퇴출 중 오류가 발생했습니다: ' + error.message);
        console.error('❌ 직원 퇴출 실패:', error);
      });
    };

    window.saveCompanyInfo = function() {
      if (!isAdmin) {
        alert('관리자만 사용할 수 있습니다.');
        return;
      }
      
      const newCompanyName = document.getElementById('editCompanyName').value.trim();
      const currentPassword = document.getElementById('currentPasswordForEdit').value;
      const newPassword = document.getElementById('newPasswordForEdit').value;
      const confirmPassword = document.getElementById('confirmNewPassword').value;
      
      if (!newCompanyName) {
        alert('회사명을 입력하세요.');
        return;
      }
      
      if (!currentPassword) {
        alert('현재 비밀번호를 입력하세요.');
        return;
      }
      
      if (!companyInfo || companyInfo.password !== currentPassword) {
        alert('현재 비밀번호가 일치하지 않습니다.');
        return;
      }
      
      if (newPassword) {
        if (newPassword.length < 4) {
          alert('새 비밀번호는 최소 4자 이상이어야 합니다.');
          return;
        }
        
        if (newPassword !== confirmPassword) {
          alert('새 비밀번호가 일치하지 않습니다.');
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
        
        alert(message);
        
        toggleCompanyInfoModal();
        
        console.log('✅ 회사 정보 수정 완료');
      }).catch((error) => {
        alert('회사 정보 수정 중 오류가 발생했습니다: ' + error.message);
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
        alert('관리자만 사용할 수 있습니다.');
        return;
      }
      
      const newAdminId = document.getElementById('newAdminSelect').value;
      const password = document.getElementById('passwordForTransfer').value;
      
      if (!newAdminId) {
        alert('새 관리자를 선택하세요.');
        return;
      }
      
      if (!password) {
        alert('비밀번호를 입력하세요.');
        return;
      }
      
      if (!companyInfo || companyInfo.password !== password) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      const newAdmin = assignees.find(a => a.id === newAdminId);
      
      if (!newAdmin) {
        alert('선택한 직원을 찾을 수 없습니다.');
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
        alert(
          `권한 이전이 완료되었습니다!\n\n` +
          `새 관리자: ${newAdmin.name}\n\n` +
          `앱을 다시 시작합니다.`
        );
        
        logout();
        
        console.log('✅ 관리자 권한 이전 완료:', newAdmin.name);
      }).catch((error) => {
        alert('권한 이전 중 오류가 발생했습니다: ' + error.message);
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
      
      try {
        document.execCommand('copy');
        alert(`회사 코드가 복사되었습니다!\n\n코드: ${text}\n\n이 코드를 직원들에게 공유하세요.`);
      } catch (err) {
        alert(`코드를 복사할 수 없습니다.\n\n수동으로 복사하세요: ${text}`);
      }
      
      document.body.removeChild(textArea);
    }
    
    window.regenerateCompanyCode = function() {
      if (!isAdmin) {
        alert('관리자만 사용할 수 있습니다.');
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
        alert('재발급이 취소되었습니다.');
        return;
      }
      
      if (!companyInfo || companyInfo.password !== password) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      const newCode = generateCompanyCode();
      
      const companyInfoRef = window.dbRef(window.db, `companies/${currentCompanyId}/info`);
      window.dbUpdate(companyInfoRef, {
        companyCode: newCode,
        codeUpdatedAt: new Date().toISOString()
      }).then(() => {
        alert(`회사 코드가 재발급되었습니다!\n\n새 코드: ${newCode}\n\n새로운 코드를 직원들에게 공유하세요.`);
        
        document.getElementById('displayCompanyCode').textContent = newCode;
        
        console.log('✅ 회사 코드 재발급 완료:', newCode);
      }).catch((error) => {
        alert('코드 재발급 중 오류가 발생했습니다: ' + error.message);
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

    window.onload = function() {
      waitForFirebase();
    };

    // 기존의 모달 외부 클릭 이벤트는 삭제해도 됩니다 (중복이므로)
    console.log('✅ 모든 모달 이벤트 리스너 등록 완료');

  </script>

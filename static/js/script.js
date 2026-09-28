// FitBuddy Client Scripts

document.addEventListener('DOMContentLoaded', () => {
  // Bind form submission if on index page
  const fitnessForm = document.getElementById('fitness-form');
  if (fitnessForm) {
    fitnessForm.addEventListener('submit', handleFormSubmit);
  }

  // Bind feedback form if on result page
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', handleFeedbackSubmit);
  }

  // Check if we have plan data in sessionStorage or URL
  initResultPage();
  initDashboardPage();
  initAdminPage();
});

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = document.getElementById('submit-btn');
  const spinner = document.getElementById('loading-spinner');

  const formData = {
    name: form.name.value.trim(),
    user_id: form.user_id.value.trim(),
    age: parseInt(form.age.value, 10),
    weight: parseInt(form.weight.value, 10),
    goal: form.goal.value,
    experience: form.experience.value,
    intensity: form.intensity.value,
    workout_days: parseInt(form.workout_days.value, 10),
    workout_duration: form.workout_duration.value,
    equipment: form.equipment.value
  };

  try {
    if (submitBtn) submitBtn.classList.add('hidden');
    if (spinner) spinner.classList.remove('hidden');

    const res = await fetch('/api/generate-workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (res.ok && data.status === 'success') {
      sessionStorage.setItem('fitbuddy_current_user', JSON.stringify(data));
      window.location.href = `/result.html?user_id=${encodeURIComponent(formData.user_id)}`;
    } else {
      alert(data.detail || data.error || 'Failed to generate plan. Please try again.');
    }
  } catch (err) {
    console.error('Error submitting form:', err);
    alert('Network error. Please verify the server is running.');
  } finally {
    if (submitBtn) submitBtn.classList.remove('hidden');
    if (spinner) spinner.classList.add('hidden');
  }
}

function initResultPage() {
  const cardsGrid = document.getElementById('workout-cards-grid');
  if (!cardsGrid) return;

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user_id');

  const cached = sessionStorage.getItem('fitbuddy_current_user');
  if (cached) {
    const parsed = JSON.parse(cached);
    renderWorkoutResult(parsed);
  } else if (userId) {
    fetchUserData(userId);
  }
}

async function fetchUserData(userId) {
  try {
    const res = await fetch(`/api/user/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      renderWorkoutResult({
        user_id: data.user.userId,
        user: data.user,
        plan: data.plan?.updatedPlan || data.plan?.originalPlan,
        nutrition_tip: data.nutritionTip
      });
    }
  } catch (e) {
    console.error('Error loading user data:', e);
  }
}

function renderWorkoutResult(data) {
  const plan = data.plan;
  const user = data.user || {};
  const tip = data.nutrition_tip;

  const nameEl = document.getElementById('user-display-name');
  if (nameEl) nameEl.textContent = plan?.planTitle || `${user.name || 'Your'} 7-Day Plan`;

  const summaryEl = document.getElementById('plan-summary-text');
  if (summaryEl) summaryEl.textContent = plan?.summary || '';

  const feedbackUid = document.getElementById('feedback-user-id');
  if (feedbackUid) feedbackUid.value = data.user_id || user.userId || '';

  // Render cards
  const grid = document.getElementById('workout-cards-grid');
  if (grid && plan?.days) {
    grid.innerHTML = plan.days.map(day => `
      <div class="day-card ${day.isRestDay ? 'rest-day' : ''}">
        <div class="day-header">
          <div>
            <span class="day-chip">DAY ${day.dayNumber}</span>
            <div class="day-title">${day.focus}</div>
          </div>
          ${day.isRestDay ? '<span class="rest-tag">RECOVERY DAY</span>' : `<span class="status-pill">${day.estimatedDurationMinutes} MIN</span>`}
        </div>

        <div class="warmup-box">
          <small class="text-muted">Warm-up (${day.warmup?.duration || '5m'}):</small>
          <div style="font-size: 0.85rem; color: #cbd5e1;">${day.warmup?.description || 'Dynamic joint movement'}</div>
        </div>

        <div class="exercises-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${(day.exercises || []).map(ex => `
            <div class="exercise-item">
              <div class="exercise-title">
                <span>${ex.name}</span>
                <span style="color: var(--emerald-400);">${ex.sets} sets × ${ex.repsOrDuration}</span>
              </div>
              <div class="exercise-cues">${ex.instructions}</div>
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">Rest: ${ex.rest}</div>
            </div>
          `).join('')}
        </div>

        <div class="cooldown-box" style="margin-top: auto; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05);">
          <small class="text-muted">Cool-down (${day.cooldown?.duration || '5m'}):</small>
          <div style="font-size: 0.82rem; color: #94a3b8;">${day.cooldown?.description || 'Gentle stretching and deep breathing'}</div>
        </div>
      </div>
    `).join('');
  }

  // Nutrition Tip
  if (tip) {
    const tipTitle = document.getElementById('tip-title');
    if (tipTitle) tipTitle.textContent = tip.title;
    const tipContent = document.getElementById('tip-content');
    if (tipContent) tipContent.textContent = tip.content;
    const tipBullets = document.getElementById('tip-bullets');
    if (tipBullets && tip.practicalTips) {
      tipBullets.innerHTML = tip.practicalTips.map(t => `<li>${t}</li>`).join('');
    }
  }
}

function setFeedbackText(text) {
  const input = document.getElementById('feedback-input');
  if (input) {
    input.value = text;
    input.focus();
  }
}

async function handleFeedbackSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const userId = form.user_id.value;
  const feedback = form.feedback.value.trim();
  const submitBtn = document.getElementById('feedback-submit-btn');
  const statusBox = document.getElementById('feedback-status');

  if (!feedback) return;

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Updating Plan with Gemini...';
    }

    const res = await fetch('/api/submit-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, feedback })
    });

    const data = await res.json();
    if (res.ok && data.status === 'success') {
      if (statusBox) {
        statusBox.classList.remove('hidden');
        statusBox.style.cssText = 'background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; padding: 1rem; border-radius: 8px; margin-top: 1rem;';
        statusBox.textContent = 'Your fitness plan has been updated successfully with Gemini!';
      }
      renderWorkoutResult({
        user_id: userId,
        plan: data.updated_plan,
        nutrition_tip: null
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert(data.detail || 'Could not update plan.');
    }
  } catch (err) {
    console.error('Error updating plan:', err);
    alert('Failed to submit feedback.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Plan with Feedback →';
    }
  }
}

async function initAdminPage() {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin');
    if (res.ok) {
      const data = await res.json();
      window.allAdminUsers = data.users || [];
      renderAdminTable(window.allAdminUsers);
    }
  } catch (err) {
    console.error('Error loading admin users:', err);
  }
}

function renderAdminTable(users) {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #64748b;">No registered users found.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td><strong>${u.user_id}</strong></td>
      <td>${u.name}</td>
      <td>${u.age} yrs / ${u.weight} kg</td>
      <td><span class="status-pill">${u.goal}</span></td>
      <td>${u.experience}</td>
      <td>${u.workout_days} d/wk (${u.equipment})</td>
      <td>
        ${u.has_updated_plan ? '<span style="color: #34d399;">● Updated</span>' : '<span style="color: #38bdf8;">● Original</span>'}
      </td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="viewUserPlan('${u.user_id}')">View</button>
        <button class="btn btn-outline btn-sm" style="color: #f87171; border-color: rgba(239,68,68,0.3);" onclick="deleteUser('${u.user_id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function filterAdminTable() {
  const q = document.getElementById('admin-search')?.value.toLowerCase() || '';
  const goal = document.getElementById('filter-goal')?.value || '';

  const filtered = (window.allAdminUsers || []).filter(u => {
    const matchesQuery = u.name.toLowerCase().includes(q) || u.user_id.toLowerCase().includes(q);
    const matchesGoal = !goal || u.goal === goal;
    return matchesQuery && matchesGoal;
  });

  renderAdminTable(filtered);
}

function viewUserPlan(userId) {
  window.location.href = `/result.html?user_id=${encodeURIComponent(userId)}`;
}

async function deleteUser(userId) {
  if (!confirm(`Are you sure you want to delete user ${userId}?`)) return;

  try {
    const res = await fetch(`/api/user/${encodeURIComponent(userId)}`, { method: 'DELETE' });
    if (res.ok) {
      window.allAdminUsers = (window.allAdminUsers || []).filter(u => u.user_id !== userId);
      renderAdminTable(window.allAdminUsers);
    }
  } catch (e) {
    alert('Failed to delete user.');
  }
}

function initDashboardPage() {
  // dashboard initialization if needed
}

/**
 * Team Registration Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');
  const errorAlert = document.getElementById('errorAlert');
  const submitBtn = document.getElementById('submitBtn');

  const successModal = document.getElementById('successModal');
  const modalCodeDisplay = document.getElementById('modalCodeDisplay');
  const modalTeamName = document.getElementById('modalTeamName');
  const modalStudents = document.getElementById('modalStudents');
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const proceedToArenaBtn = document.getElementById('proceedToArenaBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorAlert.classList.add('hidden');
    errorAlert.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering Team...';

    const payload = {
      name: document.getElementById('teamName').value.trim(),
      student1_name: document.getElementById('s1Name').value.trim(),
      student1_college: document.getElementById('s1College').value.trim(),
      student2_name: document.getElementById('s2Name').value.trim(),
      student2_college: document.getElementById('s2College').value.trim(),
      contact_email: document.getElementById('contactEmail').value.trim(),
      contact_phone: document.getElementById('contactPhone').value.trim()
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        errorAlert.textContent = data.error || 'Failed to complete registration.';
        errorAlert.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Generate Team Code & Register 🚀';
        return;
      }

      // Show success modal
      modalCodeDisplay.textContent = data.code;
      modalTeamName.textContent = data.team.name;
      modalStudents.textContent = `${data.team.student1_name} (${data.team.student1_college}) & ${data.team.student2_name} (${data.team.student2_college})`;

      proceedToArenaBtn.href = `login.html?code=${encodeURIComponent(data.code)}`;
      successModal.classList.remove('hidden');

      // Pre-fill local storage for convenience
      sessionStorage.setItem('cyber_team_code', data.code);
    } catch (err) {
      console.error('Registration network error:', err);
      errorAlert.textContent = 'Network or server connection error. Please try again.';
      errorAlert.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Generate Team Code & Register 🚀';
    }
  });

  // Copy Code
  copyCodeBtn.addEventListener('click', () => {
    const code = modalCodeDisplay.textContent;
    navigator.clipboard.writeText(code).then(() => {
      copyCodeBtn.textContent = '✅ Copied to Clipboard!';
      setTimeout(() => {
        copyCodeBtn.textContent = '📋 Copy Code to Clipboard';
      }, 2500);
    }).catch(err => {
      console.warn('Clipboard failed:', err);
    });
  });
});

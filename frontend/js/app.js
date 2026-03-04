/**
 * SmartKnowledge Frontend Application
 */

// Global state
let currentUser = null;
let entretiens = [];
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let recordingTimer = null;

// DOM Elements
const loginPage = document.getElementById('login-page');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const toastContainer = document.getElementById('toast-container');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        showDashboard();
    } else {
        showLogin();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;
            switchTab(tab);
        });
    });

    // Sub-tabs (new interview)
    document.querySelectorAll('#tab-new .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const subtab = tab.dataset.subtab;
            switchSubtab(tab, subtab);
        });
    });

    // Recording controls
    document.getElementById('start-record').addEventListener('click', startRecording);
    document.getElementById('stop-record').addEventListener('click', stopRecording);
    document.getElementById('record-form').addEventListener('submit', handleRecordSave);

    // Upload audio form
    document.getElementById('upload-audio-form').addEventListener('submit', handleAudioUpload);
    setupUploadArea();

    // Upload text form
    document.getElementById('upload-text-form').addEventListener('submit', handleTextUpload);

    // Filters
    document.getElementById('filter-domaine').addEventListener('change', filterEntretiens);
    document.getElementById('filter-sensibilite').addEventListener('change', filterEntretiens);

    // Chat
    document.getElementById('chat-send').addEventListener('click', sendChatMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
}

// Auth handlers
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const data = await api.login(username, password);
        if (data) {
            currentUser = data.user;
            showToast('Connexion réussie', 'success');
            showDashboard();
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function handleLogout() {
    api.logout();
    currentUser = null;
    showLogin();
    showToast('Déconnexion réussie', 'success');
}

// UI functions
function showLogin() {
    loginPage.style.display = 'flex';
    dashboard.classList.remove('active');
}

function showDashboard() {
    loginPage.style.display = 'none';
    dashboard.classList.add('active');
    userName.textContent = currentUser.username;
    loadEntretiens();
    
    // Show admin nav if admin
    if (currentUser.role === 'admin') {
        document.getElementById('admin-nav').style.display = 'block';
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Tab navigation
function switchTab(tabId) {
    // Update sidebar
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.toggle('active', link.dataset.tab === tabId);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
    });

    // Load data if needed
    if (tabId === 'manage') {
        loadEntretiens();
    } else if (tabId === 'admin') {
        loadUsers();
    }
}

function switchSubtab(tabElement, subtabId) {
    // Update tabs
    document.querySelectorAll('#tab-new .tab').forEach(t => t.classList.remove('active'));
    tabElement.classList.add('active');

    // Update content
    document.querySelectorAll('.subtab-content').forEach(content => {
        content.classList.toggle('active', content.id === `subtab-${subtabId}`);
    });
}

// Recording functions
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Use mimeType with support check
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/mp4';
            }
        }
        
        const options = { mimeType };
        mediaRecorder = new MediaRecorder(stream, options);
        audioChunks = [];

        // Collect data every 30 seconds to prevent memory issues
        mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                audioChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            // Create blob from all chunks
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            const url = URL.createObjectURL(audioBlob);
            document.getElementById('record-filename').value = url;
            document.getElementById('record-form-card').style.display = 'block';
            stream.getTracks().forEach(track => track.stop());
            
            // Log size for debugging
            console.log(`Recording saved: ${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`);
        };

        mediaRecorder.onerror = (e) => {
            console.error('MediaRecorder error:', e);
            showToast('Erreur lors de l\'enregistrement', 'error');
        };

        // Start recording with timeslice of 30 seconds to flush chunks regularly
        mediaRecorder.start(30000);
        recordingStartTime = Date.now();

        // Update UI
        document.getElementById('start-record').disabled = true;
        document.getElementById('stop-record').disabled = false;
        document.getElementById('recorder-display').classList.add('recording');
        document.getElementById('recorder-display').textContent = '⏺️';

        // Start timer
        recordingTimer = setInterval(updateRecordingTimer, 1000);

        showToast('Enregistrement démarré', 'success');
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        clearInterval(recordingTimer);

        document.getElementById('start-record').disabled = false;
        document.getElementById('stop-record').disabled = true;
        document.getElementById('recorder-display').classList.remove('recording');
        document.getElementById('recorder-display').textContent = '🎤';

        showToast('Enregistrement arrêté', 'success');
    }
}

function updateRecordingTimer() {
    const elapsed = Date.now() - recordingStartTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById('recorder-timer').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function handleRecordSave(e) {
    e.preventDefault();

    const audioUrl = document.getElementById('record-filename').value;
    if (!audioUrl) {
        showToast('Aucun enregistrement disponible', 'error');
        return;
    }

    try {
        // Convert URL to blob and create form data
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob();

        const formData = new FormData();
        formData.append('fichier', audioBlob, 'recording.webm');
        formData.append('expert_nom', document.getElementById('expert-nom').value);
        formData.append('expert_fonction', document.getElementById('expert-fonction').value);
        formData.append('domaine', document.getElementById('domaine').value);
        formData.append('sensibilite', document.getElementById('sensibilite').value);

        const data = await api.uploadEntretien(formData);
        if (data) {
            showToast('Entretien enregistré avec succès', 'success');
            // Reset form
            e.target.reset();
            document.getElementById('record-form-card').style.display = 'none';
            document.getElementById('recorder-timer').textContent = '00:00:00';
            switchTab('manage');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Upload audio functions
function setupUploadArea() {
    const dropzone = document.getElementById('audio-dropzone');
    const input = document.getElementById('audio-file');

    dropzone.addEventListener('click', () => input.click());

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            input.files = e.dataTransfer.files;
            showAudioFilename(input.files[0].name);
        }
    });

    input.addEventListener('change', () => {
        if (input.files.length) {
            showAudioFilename(input.files[0].name);
        }
    });
}

function showAudioFilename(name) {
    document.getElementById('audio-filename').textContent = `Fichier sélectionné: ${name}`;
}

async function handleAudioUpload(e) {
    e.preventDefault();
    const input = document.getElementById('audio-file');
    
    if (!input.files.length) {
        showToast('Veuillez sélectionner un fichier', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('fichier', input.files[0]);
    formData.append('expert_nom', document.getElementById('audio-expert-nom').value);
    formData.append('expert_fonction', document.getElementById('audio-expert-fonction').value);
    formData.append('domaine', document.getElementById('audio-domaine').value);
    formData.append('sensibilite', document.getElementById('audio-sensibilite').value);

    try {
        const data = await api.uploadEntretien(formData);
        if (data) {
            showToast('Fichier audio uploadé avec succès', 'success');
            e.target.reset();
            document.getElementById('audio-filename').textContent = '';
            switchTab('manage');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleTextUpload(e) {
    e.preventDefault();

    const transcription = document.getElementById('text-transcription').value;
    if (!transcription.trim()) {
        showToast('Veuillez entrer une transcription', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('transcription', transcription);
    formData.append('expert_nom', document.getElementById('text-expert-nom').value);
    formData.append('expert_fonction', document.getElementById('text-expert-fonction').value);
    formData.append('domaine', document.getElementById('text-domaine').value);
    formData.append('sensibilite', document.getElementById('text-sensibilite').value);

    try {
        const data = await api.createEntretien(formData);
        if (data) {
            showToast('Transcription enregistrée avec succès', 'success');
            e.target.reset();
            switchTab('manage');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Entretien management
async function loadEntretiens() {
    try {
        const data = await api.getEntretiens();
        if (data) {
            entretiens = data.entretiens;
            renderEntretiens();
        }
    } catch (error) {
        showToast('Erreur lors du chargement des entretiens', 'error');
    }
}

function renderEntretiens() {
    const container = document.getElementById('entretien-list');
    const domaineFilter = document.getElementById('filter-domaine').value;
    const sensibiliteFilter = document.getElementById('filter-sensibilite').value;

    let filtered = entretiens;

    if (domaineFilter) {
        filtered = filtered.filter(e => e.domaine === domaineFilter);
    }
    if (sensibiliteFilter) {
        filtered = filtered.filter(e => e.sensibilite === sensibiliteFilter);
    }

    if (!filtered.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Aucun entretien</h3>
                <p>Commencez par créer un nouvel entretien</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(e => `
        <div class="entretien-item" data-id="${e.id}">
            <div class="entretien-info">
                <h4>${escapeHtml(e.expert_nom)}</h4>
                <p>${escapeHtml(e.expert_fonction || '')} • ${e.domaine || 'N/A'} • ${formatDate(e.date_entretien)}</p>
            </div>
            <div class="entretien-meta">
                <span class="badge badge-${e.sensibilite}">${e.sensibilite}</span>
                <div class="status-icons" title="Audio | Transcription | Vectorisé">
                    <span class="status-icon ${e.statut_audio ? 'status-yes' : 'status-no'}">🎙️</span>
                    <span class="status-icon ${e.statut_transcription ? 'status-yes' : 'status-no'}">📝</span>
                    <span class="status-icon ${e.statut_vectorisation ? 'status-yes' : 'status-no'}">🔍</span>
                </div>
                <div class="entretien-actions">
                    ${!e.statut_transcription ? `<button onclick="transcrireEntretien(${e.id})" title="Transcrire">🎙️</button>` : ''}
                    ${e.statut_transcription && !e.statut_vectorisation ? `<button onclick="vectoriserEntretien(${e.id})" title="Vectoriser">🔍</button>` : ''}
                    <button onclick="deleteEntretien(${e.id})" class="delete" title="Supprimer">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterEntretiens() {
    renderEntretiens();
}

async function deleteEntretien(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet entretien?')) return;

    try {
        await api.deleteEntretien(id);
        showToast('Entretien supprimé', 'success');
        loadEntretiens();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function transcrireEntretien(id) {
    try {
        const data = await api.transcrireEntretien(id);
        if (data.error) {
            showToast(data.error, 'warning');
        } else {
            showToast('Transcription en cours... ⏳', 'info');
            // Show processing state
            document.getElementById('entretiens-list').querySelector(`[data-id="${id}"]`)?.classList.add('processing');
            // Poll for completion
            pollStatus(id, 'transcription', 2000);
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function vectoriserEntretien(id) {
    try {
        const data = await api.vectoriserEntretien(id);
        if (data.error) {
            showToast(data.error, 'warning');
        } else {
            showToast('Vectorisation en cours... ⏳', 'info');
            // Show processing state
            document.getElementById('entretiens-list').querySelector(`[data-id="${id}"]`)?.classList.add('processing');
            // Poll for completion
            pollStatus(id, 'vectorisation', 2000);
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function pollStatus(id, type, interval) {
    let attempts = 0;
    const maxAttempts = 30; // Max 60 seconds
    
    const check = async () => {
        attempts++;
        try {
            await loadEntretiens();
            const entretien = window.entretiens?.find(e => e.id === id);
            if (entretien) {
                if (type === 'transcription' && entretien.statut_transcription) {
                    showToast('Transcription terminée ! ✅', 'success');
                    return;
                }
                if (type === 'vectorisation' && entretien.statut_vectorisation) {
                    showToast('Vectorisation terminée ! ✅', 'success');
                    return;
                }
            }
            if (attempts < maxAttempts) {
                setTimeout(check, interval);
            } else {
                showToast('Délai dépassé', 'warning');
            }
        } catch (e) {
            console.error(e);
        }
    };
    
    setTimeout(check, interval);
}

// Chat functions
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    addChatMessage(message, 'user');
    input.value = '';

    // Show loading
    const loadingId = addChatMessage('Recherche en cours...', 'assistant');

    try {
        const data = await api.queryKnowledge(message);
        
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            if (data.error) {
                loadingEl.innerHTML = `<p style="color: red;">Erreur: ${data.error}</p>`;
            } else {
                let html = `<p>${escapeHtml(data.answer)}</p>`;
                
                // Add sources if available
                if (data.sources && data.sources.length > 0) {
                    html += `<div class="sources"><strong>Sources:</strong><br>`;
                    data.sources.forEach((s, i) => {
                        html += `<em>${i + 1}. ${escapeHtml(s.expert)} (${escapeHtml(s.domaine)})</em><br>`;
                    });
                    html += `</div>`;
                }
                
                loadingEl.innerHTML = html;
            }
        }
    } catch (error) {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            loadingEl.textContent = 'Erreur: ' + error.message;
        }
    }
}

function addChatMessage(text, sender) {
    const container = document.getElementById('chat-messages');
    const id = 'msg-' + Date.now();
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.id = id;
    div.innerHTML = `<p>${escapeHtml(text)}</p>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
}

// User management (admin)
async function loadUsers() {
    try {
        const data = await api.getUsers();
        if (data) {
            renderUsers(data.users);
        }
    } catch (error) {
        showToast('Erreur lors du chargement des utilisateurs', 'error');
    }
}

function renderUsers(users) {
    const container = document.getElementById('user-list');
    
    if (!users || !users.length) {
        container.innerHTML = '<div class="empty-state"><h3>Aucun utilisateur</h3></div>';
        return;
    }

    container.innerHTML = users.map(u => `
        <div class="entretien-item" data-id="${u.id}">
            <div class="entretien-info">
                <h4>${escapeHtml(u.username)}</h4>
                <p>Rôle: ${u.role} • Créé le: ${formatDate(u.created_at)}</p>
            </div>
            <div class="entretien-meta">
                <span class="badge badge-${u.role === 'admin' ? 'tres_secret' : 'public'}">${u.role}</span>
                <div class="entretien-actions">
                    ${u.id !== currentUser.id ? `<button onclick="deleteUser(${u.id})" class="delete" title="Supprimer">🗑️</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

async function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) return;
    
    try {
        await api.deleteUser(userId);
        showToast('Utilisateur supprimé', 'success');
        loadUsers();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Setup add user button
document.addEventListener('DOMContentLoaded', () => {
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', async () => {
            const username = prompt('Nom d\'utilisateur:');
            if (!username) return;
            
            const password = prompt('Mot de passe:');
            if (!password) return;
            
            const role = prompt('Rôle (user/admin):', 'user');
            
            try {
                await api.createUser(username, password, role);
                showToast('Utilisateur créé', 'success');
                loadUsers();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
});

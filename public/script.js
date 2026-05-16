/* ============================================
   MediFlow AI - JavaScript (Updated for AI & Auto-fill)
   ============================================ */

// ============================================
// Navigation
// ============================================
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo(0, 0);
}

// ============================================
// Symptom Triage AI
// ============================================
async function analyzeSymptoms() {
    const input = document.getElementById('symptomInput').value;
    const resultBox = document.getElementById('triageResult');
    const title = document.getElementById('urgencyTitle');
    const desc = document.getElementById('urgencyDesc');
    const doctorDiv = document.getElementById('doctorRecommendation');

    if (!input.trim()) {
        showToast('Please describe your symptoms first', 'error');
        return;
    }

    // Show loading state
    resultBox.className = 'result-box show result-normal';
    title.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    desc.textContent = 'Gemini is evaluating your symptoms...';
    doctorDiv.innerHTML = '';

    try {
        const response = await fetch('/api/triage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: input })
        });
        
        const data = await response.json();

        // Update UI based on Gemini AI response
        resultBox.className = 'result-box show result-' + data.urgency;

        if (data.urgency === 'urgent') {
            title.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i> Urgent Attention Required';
        } else if (data.urgency === 'moderate') {
            title.innerHTML = '<i class="fas fa-info-circle" style="color: var(--warning);"></i> Moderate Priority';
        } else {
            title.innerHTML = '<i class="fas fa-check-circle" style="color: var(--secondary);"></i> Routine Care Recommended';
        }

        desc.textContent = data.recommendation;

        // Auto-fill trigger added to Book Now button
        doctorDiv.innerHTML = `
            <div class="doctor-card">
                <div class="doctor-avatar">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="doctor-info">
                    <h4>${data.doctor}</h4>
                    <p>${data.doctorTitle} | ${data.department.charAt(0).toUpperCase() + data.department.slice(1)}</p>
                    <span class="badge ${data.urgency === 'urgent' ? 'badge-urgent' : 'badge-normal'}">
                        ${data.urgency === 'urgent' ? 'Available Now' : 'Next Available: Today'}
                    </span>
                </div>
                <button class="cta-btn" style="margin-left: auto; padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="goToBooking('${data.department}', '${data.doctor}')">
                    Book Now
                </button>
            </div>
        `;

        showToast('Analysis complete! See recommendation below.');
    } catch (error) {
        showToast('Error analyzing symptoms.', 'error');
        title.innerHTML = '<i class="fas fa-exclamation-circle" style="color: var(--danger);"></i> Error';
        desc.textContent = 'Could not connect to the AI service. Please ensure the Node.js server is running.';
    }
}

// Function to transition and auto-fill the booking section
function goToBooking(department, doctor) {
    showSection('booking');
    
    const deptSelect = document.getElementById('department');
    deptSelect.value = department.toLowerCase();
    
    updateDoctors(); // Populate doctor dropdown
    
    const docSelect = document.getElementById('doctor');
    docSelect.value = doctor;
    
    showToast('Details auto-filled from triage!');
}

// ============================================
// Booking System
// ============================================
const doctors = {
    cardiology: ['Dr. Sarah Johnson', 'Dr. Ahmed Hassan'],
    dermatology: ['Dr. Lisa Park', 'Dr. David Brown'],
    neurology: ['Dr. James Wilson', 'Dr. Maria Garcia'],
    orthopedics: ['Dr. Robert Kim', 'Dr. Jennifer Lee'],
    pediatrics: ['Dr. Amanda White', 'Dr. Kevin Moore'],
    general: ['Dr. Michael Chen', 'Dr. Jessica Taylor']
};

function updateDoctors() {
    const dept = document.getElementById('department').value;
    const doctorSelect = document.getElementById('doctor');
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>';

    if (doctors[dept]) {
        doctors[dept].forEach(doc => {
            doctorSelect.innerHTML += `<option value="${doc}">${doc}</option>`;
        });
    }
}

let selectedTime = null;

function selectTime(element) {
    if (element.classList.contains('booked')) return;
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    selectedTime = element.textContent;
}

function bookAppointment() {
    const name = document.getElementById('patientName').value;
    const dept = document.getElementById('department').value;
    const doctor = document.getElementById('doctor').value;
    const date = document.getElementById('appointmentDate').value;

    if (!name || !dept || !doctor || !date || !selectedTime) {
        showToast('Please fill in all fields including time slot', 'error');
        return;
    }

    // Update My Appointments list
    const list = document.getElementById('appointmentsList');
    const newAppt = document.createElement('div');
    newAppt.className = 'appointment-item';
    newAppt.innerHTML = `
        <div class="appointment-info">
            <h4>${doctor}</h4>
            <p><i class="fas fa-stethoscope"></i> ${dept.charAt(0).toUpperCase() + dept.slice(1)} | ${date} at ${selectedTime}</p>
        </div>
        <span class="status-badge status-confirmed">Confirmed</span>
    `;
    list.insertBefore(newAppt, list.firstChild);

    // Overwrite and remove the placeholder Queue Status
    const queueContainer = document.querySelector('.queue-container');
    queueContainer.innerHTML = `
        <div class="queue-card">
            <div class="queue-header">
                <div>
                    <h3>Upcoming Appointment</h3>
                    <p class="text-light">${doctor} - ${dept.charAt(0).toUpperCase() + dept.slice(1)}</p>
                    <p class="text-small" style="margin-top: 5px;">Patient: ${name}</p>
                </div>
                <div class="wait-time">
                    <div class="wait-time-number">Confirmed</div>
                    <div class="text-small">${date} @ ${selectedTime}</div>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill pulse" style="width: 100%; background: var(--secondary);"></div>
            </div>
            <div class="queue-meta" style="margin-top: 1rem;">
                <span class="text-small"><i class="fas fa-info-circle"></i> Please arrive 10 minutes early.</span>
            </div>
        </div>
    `;

    showToast('Appointment booked successfully!');

    // Reset form
    document.getElementById('patientName').value = '';
    document.getElementById('department').value = '';
    document.getElementById('doctor').innerHTML = '<option value="">Select Doctor</option>';
    document.getElementById('appointmentDate').valueAsDate = new Date();
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    selectedTime = null;
    
    // Auto-redirect to the queue page to see updates
    setTimeout(() => {
        showSection('queue');
    }, 1200);
}

// ============================================
// Chatbot
// ============================================
function toggleChat() {
    const chatbot = document.getElementById('chatbot');
    const toggle = document.getElementById('chatToggle');
    chatbot.classList.toggle('hidden');
    toggle.classList.toggle('hidden');
}

function sendQuickMessage(text) {
    addMessage(text, 'user');
    processBotResponse(text);
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';
    processBotResponse(text);
}

function handleChatKeypress(e) {
    if (e.key === 'Enter') sendMessage();
}

function addMessage(text, sender) {
    const messages = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
    const messages = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.className = 'message bot typing-indicator';
    typing.id = 'typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
    const typing = document.getElementById('typing');
    if (typing) typing.remove();
}

async function processBotResponse(userText) {
    showTyping();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });
        
        const data = await response.json();
        removeTyping();

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        
        let actions = '';
        if (data.response.toLowerCase().includes('book') || data.response.toLowerCase().includes('appointment')) {
             actions = `<div class="quick-actions">
                <button class="quick-action-btn" onclick="showSection('booking'); toggleChat();">Book Now</button>
            </div>`;
        }

        msgDiv.innerHTML = data.response + actions;
        document.getElementById('chatMessages').appendChild(msgDiv);
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
        
    } catch (error) {
        removeTyping();
        addMessage("Sorry, I'm having trouble connecting to the AI server. Please ensure the Node server is running.", 'bot');
    }
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    msg.textContent = message;
    toast.className = 'toast show ' + (type === 'error' ? 'error' : '');
    toast.querySelector('i').className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Set default appointment date to today
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
});
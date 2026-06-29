// Fetch and Render CV Data
async function loadCVData() {
    try {
        const [profile, education, experience, projects] = await Promise.all([
            fetch('data/profile.json').then(res => res.json()),
            fetch('data/education.json').then(res => res.json()),
            fetch('data/experience.json').then(res => res.json()),
            fetch('data/projects.json').then(res => res.json())
        ]);

        renderHeader(profile);
        renderAbout(profile);
        renderContact(profile);
        renderSkills(profile);
        renderEducation(education);
        renderExperience(experience);
        renderProjects(projects);
    } catch (error) {
        console.error('Error loading CV data:', error);
        alert('Failed to load CV data. Please ensure you are viewing this via a local server (http://...) rather than directly double-clicking the HTML file (file://...).');
    }
}

// Render Header Info (Name, Title, Photo)
function renderHeader(profile) {
    const nameEl = document.getElementById('cv-name');
    const titleEl = document.getElementById('cv-title');
    const photoEl = document.getElementById('cv-photo');

    // Split name and title if "-" exists
    if (profile.name.includes('-')) {
        const parts = profile.name.split('-');
        nameEl.textContent = parts[0].trim();
        titleEl.textContent = parts.slice(1).join('-').trim();
    } else {
        nameEl.textContent = profile.name;
        titleEl.textContent = "Undergraduate Student";
    }

    if (profile.profileImage) {
        photoEl.src = profile.profileImage;
        photoEl.alt = nameEl.textContent;
    } else {
        photoEl.style.display = 'none';
    }
}

// Render Profile/About section
function renderAbout(profile) {
    const summaryEl = document.getElementById('cv-summary');
    summaryEl.textContent = profile.description;
}

// Render Contact Info (Sidebar)
function renderContact(profile) {
    const contactList = document.getElementById('cv-contacts');
    contactList.innerHTML = '';

    // Add email
    if (profile.email) {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-envelope"></i> <a href="mailto:${profile.email}">${profile.email}</a>`;
        contactList.appendChild(li);
    }

    // Add phone
    if (profile.phone) {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-phone"></i> <span>${profile.phone}</span>`;
        contactList.appendChild(li);
    }

    // Add social media
    if (profile.socialMedia && profile.socialMedia.length > 0) {
        profile.socialMedia.forEach(social => {
            const li = document.createElement('li');
            let iconClass = 'fas fa-link';
            
            // Map platform name to font awesome icon
            const platformLower = social.platform.toLowerCase();
            if (platformLower.includes('linkedin')) {
                iconClass = 'fab fa-linkedin';
            } else if (platformLower.includes('github')) {
                iconClass = 'fab fa-github';
            } else if (platformLower.includes('twitter') || platformLower.includes('x.com')) {
                iconClass = 'fab fa-twitter';
            } else if (platformLower.includes('facebook')) {
                iconClass = 'fab fa-facebook';
            } else if (platformLower.includes('instagram')) {
                iconClass = 'fab fa-instagram';
            }

            // Extract display handle from URL for cleaner look
            let displayUrl = social.url.replace(/https?:\/\/(www\.)?/, '');
            if (displayUrl.length > 25) {
                displayUrl = displayUrl.substring(0, 22) + '...';
            }

            li.innerHTML = `<i class="${iconClass}"></i> <a href="${social.url}" target="_blank" rel="noopener noreferrer">${displayUrl}</a>`;
            contactList.appendChild(li);
        });
    }
}

// Render Skills (Sidebar)
function renderSkills(profile) {
    const skillsList = document.getElementById('cv-skills');
    skillsList.innerHTML = '';

    if (profile.skills && profile.skills.length > 0) {
        profile.skills.forEach(skill => {
            const div = document.createElement('div');
            div.className = 'skill-pill';
            div.innerHTML = `<i class="${skill.icon || 'fas fa-check'}"></i> <span>${skill.name}</span>`;
            skillsList.appendChild(div);
        });
    }
}

// Render Education (Main Area)
function renderEducation(educationData) {
    const eduList = document.getElementById('cv-education-list');
    eduList.innerHTML = '';

    educationData.forEach(edu => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="item-header">
                <h3>${edu.university}</h3>
                <span class="date">${edu.year}</span>
            </div>
            <div class="item-subheader">${edu.major}</div>
            <div class="item-desc">${edu.description}</div>
        `;
        eduList.appendChild(item);
    });
}

// Render Experience (Main Area)
function renderExperience(experienceData) {
    const expList = document.getElementById('cv-experience-list');
    expList.innerHTML = '';

    experienceData.forEach(exp => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="item-header">
                <h3>${exp.company}</h3>
                <span class="date">${exp.year}</span>
            </div>
            <div class="item-subheader">${exp.position}</div>
            <div class="item-desc">${exp.description}</div>
        `;
        expList.appendChild(item);
    });
}

// Render Projects (Main Area)
function renderProjects(projectsData) {
    const projectsList = document.getElementById('cv-projects-list');
    projectsList.innerHTML = '';

    // To prevent the CV from growing too large, we present projects in a clean, compact list.
    // If there are many projects, we show the key ones.
    projectsData.forEach(project => {
        const item = document.createElement('div');
        item.className = 'cv-project-item';
        
        let metaHtml = `<span>Role: ${project.role || 'Developer'}</span>`;
        if (project.fund) {
            metaHtml += ` <span>Budget: ${project.fund}</span>`;
        }
        if (project.partner) {
            metaHtml += ` <span>Partner: ${project.partner}</span>`;
        }

        item.innerHTML = `
            <div class="item-header">
                <h3>${project.title}</h3>
                <span class="date">${project.year}</span>
            </div>
            <div class="project-meta-info">
                ${metaHtml}
            </div>
            <div class="item-desc">${project.description}</div>
        `;
        projectsList.appendChild(item);
    });
}

// Handle Print actions
document.addEventListener('DOMContentLoaded', () => {
    loadCVData();

    const btnPrint = document.getElementById('btn-print');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            window.print();
        });
    }
});

// Initialize Lenis Smooth Scroll
let lenis;
if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothHold: true,
        syncTouch: true,
        autoRaf: true
    });

    // Fallback raf loop in case the version of Lenis doesn't support autoRaf
    if (!lenis.options || !lenis.options.autoRaf) {
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
}

// Load data from JSON files
async function loadData() {
    try {
        const [profileData, educationData, experienceData, projectsData] = await Promise.all([
            fetch('data/profile.json').then(res => res.json()),
            fetch('data/education.json').then(res => res.json()),
            fetch('data/experience.json').then(res => res.json()),
            fetch('data/projects.json').then(res => res.json())
        ]);
        
        renderProfile(profileData);
        renderEducation(educationData);
        renderExperience(experienceData);
        renderProjects(projectsData);
        
        // Set current year in footer
        document.getElementById('current-year').textContent = new Date().getFullYear();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Render Profile Section
function renderProfile(data) {
    const profileNameEl = document.getElementById('profile-name');
    
    // Cek jika nama mengandung tanda hubung '-' untuk memisahkan nama & title
    if (data.name.includes('-')) {
        const parts = data.name.split('-');
        const namePart = parts[0].trim();
        const titlePart = parts.slice(1).join('-').trim();
        
        profileNameEl.innerHTML = `${namePart} <span class="profile-title">${titlePart}</span>`;
    } else {
        profileNameEl.textContent = data.name;
    }
    
    document.getElementById('profile-description').textContent = data.description;
    document.getElementById('profile-email').textContent = data.email;
    document.getElementById('profile-phone').textContent = data.phone;
    
    const profilePic = document.getElementById('profile-pic');
    profilePic.src = data.profileImage;
    profilePic.alt = `${data.name}'s profile picture`;
    
    const socialLinks = document.getElementById('social-links');
    data.socialMedia.forEach(social => {
        const link = document.createElement('a');
        link.href = social.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = `<i class="fab fa-${social.platform.toLowerCase()}"></i>`;
        socialLinks.appendChild(link);
    });
	
	    // Render skills
    if (data.skills) {
        const skillsGrid = document.getElementById('skills-grid');
        data.skills.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            skillItem.innerHTML = `
                <div class="skill-icon"><i class="${skill.icon}"></i></div>
                <div>
                    <div class="skill-name">${skill.name}</div>
                    ${skill.level ? `<div class="skill-level"><div class="skill-level-bar" style="width: ${skill.level}%"></div></div>` : ''}
                </div>
            `;
            skillsGrid.appendChild(skillItem);
        });
    }	
	
    if (data.cv) {
        const cvLink = document.getElementById('cv-download');
        cvLink.href = data.cv.file;
        cvLink.querySelector('i').className = data.cv.icon;
        
        if (data.cv.file.endsWith('.pdf')) {
            cvLink.setAttribute('download', '');
            cvLink.removeAttribute('target');
        } else {
            cvLink.removeAttribute('download');
            cvLink.setAttribute('target', '_blank');
        }
        
        // Insert CV button inside social links container
        document.getElementById('social-links').appendChild(cvLink);
    }
}

// Render Education Section
function renderEducation(data) {
    const educationList = document.getElementById('education-list');
    
    data.forEach(edu => {
        const eduItem = document.createElement('div');
        eduItem.className = 'education-item';
        eduItem.innerHTML = `
            <div class="edu-header">
                ${edu.logo ? `<img src="${edu.logo}" alt="${edu.university} logo" class="edu-logo">` : ''}
                <div>
                    <h3>${edu.university}</h3>
                    <p class="degree">${edu.major}</p>
                </div>
            </div>
            <p class="year">${edu.year}</p>
            <p>${edu.description}</p>
        `;
        educationList.appendChild(eduItem);
    });
}

// Render Experience Section
function renderExperience(data) {
    const experienceList = document.getElementById('experience-list');
    
    data.forEach(exp => {
        const expItem = document.createElement('div');
        expItem.className = 'experience-item';
        expItem.innerHTML = `
            <div class="exp-header">
                ${exp.logo ? `<img src="${exp.logo}" alt="${exp.company} logo" class="exp-logo">` : ''}
                <div>
                    <h3>${exp.company}</h3>
                    <p class="position">${exp.position}</p>
                </div>
            </div>
            <p class="duration">${exp.year}</p>
            <p>${exp.description}</p>
        `;
        experienceList.appendChild(expItem);
    });
}

// Render Projects Section
function renderProjects(data) {
    const projectsGrid = document.getElementById('projects-grid');
    
    data.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <div class="project-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${project.year}</span>
                    ${project.fund ? `<span><i class="fas fa-money-bill-wave"></i> ${project.fund}</span>` : ''}
                    ${project.partner ? `<span><i class="fas fa-users"></i> ${project.partner}</span>` : ''}
                    ${project.role ? `<span><i class="fas fa-user-tie"></i> ${project.role}</span>` : ''}
                </div>
                <p>${project.description}</p>
                ${project.link ? `<a href="${project.link}" class="project-link" target="_blank">View Project <i class="fas fa-external-link-alt"></i></a>` : ''}
            </div>
        `;
        projectsGrid.appendChild(projectCard);
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', loadData);

document.addEventListener('DOMContentLoaded', function() {
    // Highlight active section
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.top-nav a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
    
    // Smooth scrolling using Lenis if available
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (lenis) {
                lenis.scrollTo(targetSection);
            } else {
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const topNav = document.getElementById('top-nav');

    if (navToggle && topNav) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            topNav.classList.toggle('open');
        });

        // Close menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                topNav.classList.remove('open');
            });
        });
    }
    
    // Animate sections on scroll
    const observerOptions = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s ease-out';
    });
});
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const docsDir = path.join(rootDir, 'docs');

// Helper to load JSON
function loadJson(filename) {
    return JSON.parse(fs.readFileSync(path.join(dataDir, filename), 'utf8'));
}

async function generate() {
    try {
        console.log('Reading data files...');
        const profile = loadJson('profile.json');
        const education = loadJson('education.json');
        const experience = loadJson('experience.json');
        const projects = loadJson('projects.json');

        console.log('Reading template cv.html...');
        let html = fs.readFileSync(path.join(rootDir, 'cv.html'), 'utf8');

        // Remove the action bar from the print version entirely to keep it clean
        html = html.replace(/<div class="cv-action-bar">[\s\S]*?<\/div>\s*<\/div>/, ''); 
        // Wait, the action bar is:
        // <div class="cv-action-bar">
        //     <h1>Curriculum Vitae Preview</h1>
        //     <div class="btn-container">
        //         ...
        //     </div>
        // </div>
        // Let's use a cleaner replacement to avoid removing other divs.
        html = html.replace(/<div class="cv-action-bar">[\s\S]*?<\/div>/, '');

        // Render Name and Title
        let name = profile.name;
        let title = 'Undergraduate Student';
        if (profile.name.includes('-')) {
            const parts = profile.name.split('-');
            name = parts[0].trim();
            title = parts.slice(1).join('-').trim();
        }
        html = html.replace('<h1 id="cv-name">Loading Name...</h1>', `<h1 id="cv-name">${name}</h1>`);
        html = html.replace('<div id="cv-title" class="title">Loading Title...</div>', `<div id="cv-title" class="title">${title}</div>`);

        // Render Photo
        if (profile.profileImage) {
            html = html.replace('id="cv-photo" src=""', `id="cv-photo" src="${profile.profileImage}"`);
        } else {
            // Hide photo container if no image
            html = html.replace('<div class="header-photo">[\s\S]*?<\/div>', '');
        }

        // Render Summary
        html = html.replace('<p id="cv-summary" class="profile-summary">Loading summary...</p>', `<p id="cv-summary" class="profile-summary">${profile.description}</p>`);

        // Render Contact
        let contactHtml = '';
        if (profile.email) {
            contactHtml += `<li><i class="fas fa-envelope"></i> <a href="mailto:${profile.email}">${profile.email}</a></li>\n`;
        }
        if (profile.phone) {
            contactHtml += `<li><i class="fas fa-phone"></i> <span>${profile.phone}</span></li>\n`;
        }
        if (profile.socialMedia && profile.socialMedia.length > 0) {
            profile.socialMedia.forEach(social => {
                let iconClass = 'fas fa-link';
                const platformLower = social.platform.toLowerCase();
                if (platformLower.includes('linkedin')) {
                    iconClass = 'fab fa-linkedin';
                } else if (platformLower.includes('github')) {
                    iconClass = 'fab fa-github';
                } else if (platformLower.includes('twitter') || platformLower.includes('x.com')) {
                    iconClass = 'fab fa-twitter';
                }

                let displayUrl = social.url.replace(/https?:\/\/(www\.)?/, '');
                if (displayUrl.length > 25) {
                    displayUrl = displayUrl.substring(0, 22) + '...';
                }
                contactHtml += `<li><i class="${iconClass}"></i> <a href="${social.url}" target="_blank">${displayUrl}</a></li>\n`;
            });
        }
        html = html.replace('<ul id="cv-contacts" class="contact-list">\n                        <!-- Contact details will be rendered dynamically -->\n                    </ul>', `<ul id="cv-contacts" class="contact-list">\n${contactHtml}</ul>`);

        // Render Skills
        let skillsHtml = '';
        if (profile.skills && profile.skills.length > 0) {
            profile.skills.forEach(skill => {
                skillsHtml += `<div class="skill-pill"><i class="${skill.icon || 'fas fa-check'}"></i> <span>${skill.name}</span></div>\n`;
            });
        }
        html = html.replace('<div id="cv-skills" class="skills-list">\n                        <!-- Skills will be rendered dynamically -->\n                    </div>', `<div id="cv-skills" class="skills-list">\n${skillsHtml}</div>`);

        // Render Education
        let educationHtml = '';
        education.forEach(edu => {
            educationHtml += `
            <div class="timeline-item">
                <div class="item-header">
                    <h3>${edu.university}</h3>
                    <span class="date">${edu.year}</span>
                </div>
                <div class="item-subheader">${edu.major}</div>
                <div class="item-desc">${edu.description}</div>
            </div>`;
        });
        html = html.replace('<div id="cv-education-list">\n                        <!-- Education timeline items will be rendered dynamically -->\n                    </div>', `<div id="cv-education-list">${educationHtml}</div>`);

        // Render Experience
        let experienceHtml = '';
        experience.forEach(exp => {
            experienceHtml += `
            <div class="timeline-item">
                <div class="item-header">
                    <h3>${exp.company}</h3>
                    <span class="date">${exp.year}</span>
                </div>
                <div class="item-subheader">${exp.position}</div>
                <div class="item-desc">${exp.description}</div>
            </div>`;
        });
        html = html.replace('<div id="cv-experience-list">\n                        <!-- Experience timeline items will be rendered dynamically -->\n                    </div>', `<div id="cv-experience-list">${experienceHtml}</div>`);

        // Render Projects
        let projectsHtml = '';
        projects.forEach(project => {
            let metaHtml = `<span>Role: ${project.role || 'Developer'}</span>`;
            if (project.fund) {
                metaHtml += ` <span>Budget: ${project.fund}</span>`;
            }
            if (project.partner) {
                metaHtml += ` <span>Partner: ${project.partner}</span>`;
            }
            projectsHtml += `
            <div class="cv-project-item">
                <div class="item-header">
                    <h3>${project.title}</h3>
                    <span class="date">${project.year}</span>
                </div>
                <div class="project-meta-info">
                    ${metaHtml}
                </div>
                <div class="item-desc">${project.description}</div>
            </div>`;
        });
        html = html.replace('<div id="cv-projects-list">\n                        <!-- Project items will be rendered dynamically -->\n                    </div>', `<div id="cv-projects-list">${projectsHtml}</div>`);

        // Write temporary HTML
        const tempHtmlPath = path.join(rootDir, 'cv-print-temp.html');
        console.log('Writing temporary static CV html...');
        fs.writeFileSync(tempHtmlPath, html, 'utf8');

        // Check if docs directory exists, if not create it
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir);
        }

        const pdfPath = path.join(docsDir, 'cv.pdf');
        const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

        console.log('Running Microsoft Edge to print PDF...');
        
        const args = [
            '--headless',
            '--disable-gpu',
            '--no-pdf-header-footer',
            `--print-to-pdf=${pdfPath}`,
            tempHtmlPath
        ];

        execFile(edgePath, args, (error, stdout, stderr) => {
            // Clean up temporary HTML file
            try {
                fs.unlinkSync(tempHtmlPath);
            } catch (cleanupError) {
                console.error('Error deleting temporary file:', cleanupError);
            }

            if (error) {
                console.error('Edge execution failed:', error);
                process.exit(1);
            }

            console.log(`Success! PDF CV successfully generated and saved to: ${pdfPath}`);
        });
    } catch (err) {
        console.error('Generation process failed:', err);
        process.exit(1);
    }
}

generate();

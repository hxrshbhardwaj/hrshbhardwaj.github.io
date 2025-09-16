// Enhanced Harsh's DSA Roadmap - JavaScript

class DSARoadmap {
    constructor() {
        this.modules = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12", "m13", "m14", "m15", "m16"];
        this.phases = [1, 2, 3, 4];
        this.init();
    }

    // Utility functions for localStorage
    getProgress(moduleId) {
        try {
            const value = localStorage.getItem(`progress_${moduleId}`);
            return value === null ? 0 : Math.max(0, Math.min(100, Number(value)));
        } catch (e) {
            console.warn('localStorage not available:', e);
            return 0;
        }
    }

    setProgress(moduleId, percentage) {
        try {
            const pct = Math.round(Math.max(0, Math.min(100, Number(percentage))));
            localStorage.setItem(`progress_${moduleId}`, pct.toString());
            return pct;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return percentage;
        }
    }

    getDate(moduleId) {
        try {
            return localStorage.getItem(`date_${moduleId}`) || '';
        } catch (e) {
            console.warn('localStorage not available:', e);
            return '';
        }
    }

    setDate(moduleId, date) {
        try {
            if (date && date.trim()) {
                localStorage.setItem(`date_${moduleId}`, date);
            } else {
                localStorage.removeItem(`date_${moduleId}`);
            }
        } catch (e) {
            console.warn('localStorage not available:', e);
        }
    }

    // UI Update functions
    updateModuleUI(moduleId, percentage) {
        const progressBar = document.getElementById(`bar-${moduleId}`);
        const percentPill = document.getElementById(`pct-${moduleId}`);
        const checkbox = document.querySelector(`.done-checkbox[data-target="${moduleId}"]`);
        const module = document.querySelector(`[data-module="${moduleId}"]`);

        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        if (percentPill) {
            percentPill.textContent = `${percentage}%`;
        }

        if (checkbox) {
            checkbox.checked = percentage >= 100;
        }

        if (module) {
            module.classList.toggle('completed', percentage >= 100);
        }

        this.updateDeadlineWarnings(moduleId);
    }

    updateModuleDate(moduleId, date) {
        const datePicker = document.getElementById(`date-${moduleId}`);
        if (datePicker) {
            datePicker.value = date;
        }
        this.updateDeadlineWarnings(moduleId);
    }

    updateDeadlineWarnings(moduleId) {
        const module = document.querySelector(`[data-module="${moduleId}"]`);
        const date = this.getDate(moduleId);
        const progress = this.getProgress(moduleId);

        if (!module || !date || progress >= 100) {
            if (module) {
                module.classList.remove('deadline-warning', 'deadline-danger');
            }
            return;
        }

        const today = new Date();
        const targetDate = new Date(date);
        const daysUntilDeadline = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));

        module.classList.remove('deadline-warning', 'deadline-danger');

        if (daysUntilDeadline < 0) {
            // Past deadline
            module.classList.add('deadline-danger');
        } else if (daysUntilDeadline <= 7) {
            // Within a week
            module.classList.add('deadline-warning');
        }
    }

    calculatePhaseProgress(phaseNumber) {
        const startIndex = (phaseNumber - 1) * 4;
        const endIndex = startIndex + 4;
        let totalProgress = 0;

        for (let i = startIndex; i < endIndex; i++) {
            if (i < this.modules.length) {
                totalProgress += this.getProgress(this.modules[i]);
            }
        }

        return Math.round(totalProgress / 4);
    }

    updatePhaseProgress() {
        this.phases.forEach(phaseNumber => {
            const progress = this.calculatePhaseProgress(phaseNumber);
            const phaseElement = document.getElementById(`phasePercent-${phaseNumber}`);
            if (phaseElement) {
                phaseElement.textContent = `${progress}%`;
            }
        });
    }

    calculateOverallProgress() {
        let totalProgress = 0;
        this.modules.forEach(moduleId => {
            totalProgress += this.getProgress(moduleId);
        });
        return Math.round(totalProgress / this.modules.length);
    }

    updateOverallProgress() {
        const progress = this.calculateOverallProgress();
        const statsElement = document.getElementById('overallStats');
        const fillElement = document.getElementById('overallFill');

        if (statsElement) {
            statsElement.textContent = `${progress}%`;
        }

        if (fillElement) {
            fillElement.style.width = `${progress}%`;
        }
    }

    // Event handlers
    handleProgressBarClick(event) {
        const target = event.currentTarget;
        const moduleId = target.getAttribute('data-target');
        const rect = target.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = Math.round((clickX / rect.width) * 100);

        this.setProgress(moduleId, percentage);
        this.updateModuleUI(moduleId, percentage);
        this.updatePhaseProgress();
        this.updateOverallProgress();
    }

    handleProgressBarRightClick(event) {
        event.preventDefault();
        const target = event.currentTarget;
        const moduleId = target.getAttribute('data-target');

        this.setProgress(moduleId, 0);
        this.updateModuleUI(moduleId, 0);
        this.updatePhaseProgress();
        this.updateOverallProgress();
    }

    handleCheckboxChange(event) {
        const checkbox = event.target;
        const moduleId = checkbox.getAttribute('data-target');
        const percentage = checkbox.checked ? 100 : 0;

        this.setProgress(moduleId, percentage);
        this.updateModuleUI(moduleId, percentage);
        this.updatePhaseProgress();
        this.updateOverallProgress();
    }

    handleDateChange(event) {
        const datePicker = event.target;
        const moduleId = datePicker.getAttribute('data-target');
        const date = datePicker.value;

        this.setDate(moduleId, date);
        this.updateDeadlineWarnings(moduleId);
    }

    // Initialization
    loadSavedData() {
        this.modules.forEach(moduleId => {
            const progress = this.getProgress(moduleId);
            const date = this.getDate(moduleId);

            this.updateModuleUI(moduleId, progress);
            this.updateModuleDate(moduleId, date);
        });

        this.updatePhaseProgress();
        this.updateOverallProgress();
    }

    attachEventListeners() {
        // Progress bar click handlers
        document.querySelectorAll('.progress-bar').forEach(bar => {
            bar.addEventListener('click', this.handleProgressBarClick.bind(this));
            bar.addEventListener('contextmenu', this.handleProgressBarRightClick.bind(this));
        });

        // Checkbox handlers
        document.querySelectorAll('.done-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', this.handleCheckboxChange.bind(this));
        });

        // Date picker handlers
        document.querySelectorAll('.date-picker').forEach(datePicker => {
            datePicker.addEventListener('change', this.handleDateChange.bind(this));
        });
    }

    initCursorTrail() {
        const trailContainer = document.getElementById('cursor-trail');
        if (!trailContainer) return;

        let trails = [];
        const maxTrails = 15;

        document.addEventListener('mousemove', (e) => {
            // Create new trail dot
            const dot = document.createElement('div');
            dot.className = 'trail-dot';
            dot.style.left = e.clientX + 'px';
            dot.style.top = e.clientY + 'px';

            trailContainer.appendChild(dot);
            trails.push(dot);

            // Remove old trails
            if (trails.length > maxTrails) {
                const oldDot = trails.shift();
                if (oldDot && oldDot.parentNode) {
                    oldDot.parentNode.removeChild(oldDot);
                }
            }

            // Clean up after animation
            setTimeout(() => {
                if (dot && dot.parentNode) {
                    dot.parentNode.removeChild(dot);
                }
                const index = trails.indexOf(dot);
                if (index > -1) {
                    trails.splice(index, 1);
                }
            }, 800);
        });
    }

    // Public methods
    resetAllProgress() {
        this.modules.forEach(moduleId => {
            this.setProgress(moduleId, 0);
            this.setDate(moduleId, '');
            this.updateModuleUI(moduleId, 0);
            this.updateModuleDate(moduleId, '');
        });

        this.updatePhaseProgress();
        this.updateOverallProgress();
    }

    exportData() {
        const data = {
            progress: {},
            dates: {},
            exportDate: new Date().toISOString()
        };

        this.modules.forEach(moduleId => {
            data.progress[moduleId] = this.getProgress(moduleId);
            const date = this.getDate(moduleId);
            if (date) {
                data.dates[moduleId] = date;
            }
        });

        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            if (data.progress) {
                Object.entries(data.progress).forEach(([moduleId, progress]) => {
                    if (this.modules.includes(moduleId)) {
                        this.setProgress(moduleId, progress);
                        this.updateModuleUI(moduleId, progress);
                    }
                });
            }

            if (data.dates) {
                Object.entries(data.dates).forEach(([moduleId, date]) => {
                    if (this.modules.includes(moduleId)) {
                        this.setDate(moduleId, date);
                        this.updateModuleDate(moduleId, date);
                    }
                });
            }

            this.updatePhaseProgress();
            this.updateOverallProgress();

            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadSavedData();
                this.attachEventListeners();
                this.initCursorTrail();
            });
        } else {
            this.loadSavedData();
            this.attachEventListeners();
            this.initCursorTrail();
        }

        // Expose methods globally for console access
        window.roadmapReset = () => this.resetAllProgress();
        window.roadmapExport = () => {
            const data = this.exportData();
            console.log('Roadmap Data:', data);

            // Create download link
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dsa-roadmap-backup.json';
            a.click();
            URL.revokeObjectURL(url);

            return data;
        };
        window.roadmapImport = (jsonData) => this.importData(jsonData);
    }
}

// Initialize the roadmap
const dsaRoadmap = new DSARoadmap();

// Additional utility functions
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R to reset (with confirmation)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && e.shiftKey) {
        e.preventDefault();
        if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
            dsaRoadmap.resetAllProgress();
        }
    }

    // Ctrl/Cmd + S to export data
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        window.roadmapExport();
    }
});

// Console welcome message
console.log(`
🚀 Harsh's DSA Roadmap Tracker

Available commands:
- roadmapReset() - Reset all progress (with confirmation)
- roadmapExport() - Export progress data as JSON file
- roadmapImport(jsonData) - Import progress data from JSON

Keyboard shortcuts:
- Ctrl/Cmd + Shift + R - Reset all progress
- Ctrl/Cmd + S - Export data
`);
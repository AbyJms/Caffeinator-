document.addEventListener('DOMContentLoaded', () => {
    // Helper function to navigate to a specific page
    const navigateTo = (path) => {
        window.location.href = path;
    };

    // Auth State Handling
    const loginBtn = document.getElementById('nav-btn-login');
    const token = localStorage.getItem('token');

    if (token && loginBtn) {
        loginBtn.textContent = 'Logout';
        loginBtn.removeAttribute('onclick');
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const confirmLogout = confirm('Do you really want to logout?');
            if (confirmLogout) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                alert('You have been logged out.');
                window.location.href = 'index.html';
            }
        });
    }

    // ScriptGen Buttons
    const scriptgenBtns = [
        document.getElementById('nav-link-scriptgen'),
        document.getElementById('nav-btn-scriptgen'),
        document.getElementById('hero-btn-scriptgen'),
        document.getElementById('card-link-scriptgen')
    ];

    scriptgenBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo('pages/scriptgen.html');
            });
        }
    });

    // Recap Card Button
    const recapBtn = document.getElementById('card-link-recap');
    if (recapBtn) {
        recapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('pages/recap.html');
        });
    }

    // Story Card Button
    const storyBtn = document.getElementById('card-link-story');
    if (storyBtn) {
        storyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('pages/storyboard.html');
        });
    }
});

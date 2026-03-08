// Particle setup if desired; keeping it light for recap.
if (typeof particlesJS !== 'undefined') {
    particlesJS("particles-js", {
        particles: {
            number: { value: 30 },
            size: { value: 2 },
            color: { value: "#5b6df9" },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#5b6df9",
                opacity: 0.1
            },
            move: { speed: 1 }
        }
    });
}

// Redirect logic to index.html using the logo
const logoBtn = document.querySelector('.sidebar .logo');
if (logoBtn) {
    logoBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
}

// Basic mock handling for the send button
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');

if (sendBtn && userInput) {
    sendBtn.addEventListener('click', () => {
        if (userInput.value.trim() !== "") {
            console.log("Generating recap for:", userInput.value);
            userInput.value = ""; // clear input
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
}

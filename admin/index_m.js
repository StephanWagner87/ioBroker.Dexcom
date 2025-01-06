document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const pollIntervalInput = document.getElementById('pollInterval');

    // Load configuration
    if (window.systemConfig) {
        usernameInput.value = window.systemConfig.native.username || '';
        passwordInput.value = window.systemConfig.native.password || '';
        pollIntervalInput.value = window.systemConfig.native.pollInterval || 300;
    }

    // Save configuration
    document.getElementById('save').addEventListener('click', () => {
        window.systemConfig.native.username = usernameInput.value;
        window.systemConfig.native.password = passwordInput.value;
        window.systemConfig.native.pollInterval = parseInt(pollIntervalInput.value, 10);
        window.saveConfig();
    });
});

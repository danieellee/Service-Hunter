document.addEventListener("DOMContentLoaded", () => {
    const serviceListElement = document.getElementById("serviceList");
    const loginModal = document.getElementById("loginModal");
    const closeButton = document.querySelector(".close-button");
    const loginButton = document.getElementById("loginButton");
    const signInButton = document.getElementById("signInButton");
    const searchInput = document.getElementById("searchInput");

    let services = [];
    let loggedInUser = null;

    async function fetchServices() {
        try {
            const response = await fetch('http://localhost:3000/services');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            services = await response.json();
            displayServices(services);
        } catch (error) {
            console.error('Error fetching services:', error);
            alert('Unable to fetch services. Please try again later.');
        }
    }

    function displayServices(serviceList) {
        serviceListElement.innerHTML = '';
        if (serviceList.length === 0) {
            serviceListElement.innerHTML = '<p>No services found.</p>';
            return;
        }
        serviceList.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'service-card';
            serviceCard.innerHTML = `
                <img src="assets/${service.title.toLowerCase().replace(/ /g, "_")}.png" alt="${service.title}">
                <h3>${service.title}</h3>
                <p>${wrapText(service.description, 200)}</p>
                <p><strong>Rating:</strong> ${service.rating}/5 Stars</p>
                <p><strong>Provider:</strong> ${service.provider}</p>
                <p><strong>Cost:</strong> $${service.cost.toFixed(2)}</p>
                <button onclick="openService(${service.id})">View Details</button>
            `;
            serviceListElement.appendChild(serviceCard);
        });
    }

    window.openService = function(serviceId) {
        const service = services.find(s => s.id === serviceId);
        if (service) {
            alert(`Service: ${service.title}\nDescription: ${service.longDescription}\nCost: $${service.cost.toFixed(2)}`);
        } else {
            alert('Service not found.');
        }
    };

    loginButton.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    closeButton.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    signInButton.addEventListener('click', async () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if (username && password) {
            loginUser(username, password);
        } else {
            alert('Please enter both username and password.');
        }
    });

    async function loginUser(username, password) {
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                loggedInUser = username;
                alert(`Welcome, ${username}!`);
                loginModal.style.display = 'none';
                updateLoginStatus();
            } else {
                alert(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Unable to log in. Please check your credentials and try again.');
        }
    }

    function updateLoginStatus() {
        if (loggedInUser) {
            loginButton.textContent = `Welcome ${loggedInUser}!`;
            loginButton.disabled = true;
        } else {
            loginButton.textContent = 'Sign In';
            loginButton.disabled = false;
        }
    }

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filteredServices = services.filter(service =>
            service.title.toLowerCase().includes(query) ||
            service.description.toLowerCase().includes(query)
        );
        displayServices(filteredServices);
    });

    function wrapText(text, width) {
        const words = text.split(' ');
        let wrappedText = '';
        let line = '';

        words.forEach(word => {
            if ((line + word).length > width) {
                wrappedText += `${line.trim()}\n`;
                line = '';
            }
            line += `${word} `;
        });

        wrappedText += line.trim();
        return wrappedText;
    }

    fetchServices();
});



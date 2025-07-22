# Skyidrow Security Intelligence Platform

## Overview
Skyidrow Security Intelligence is a modern, full-stack cybersecurity operations platform for real-time threat monitoring, attack simulation, news aggregation, and secure API key management. Built with React, Node.js/Express, and a robust API proxy, it empowers security teams and enthusiasts with intuitive dashboards, live analytics, and AI-powered assistance.

---

## ✨ Key Features

- **Live Security Operations Dashboard**: Real-time threat intelligence, system health, and security scores with beautiful, responsive UI cards.
- **API Monitoring & Health Dashboard**: Built-in `/api/monitor` endpoint for live status of all backend APIs, with a locked-down, secure Express proxy server.
- **Attack Simulation (Nmap)**: Simulate network reconnaissance and test detection using Nmap, with results visualized in the dashboard.
- **Cybersecurity News Highlights**: Aggregated, filterable news feed with live threat updates, search, and bookmarking.
- **ThreatHunter Pro Analytics**: Advanced threat correlation, hunting, and analytics with AI insights and IOCs.
- **Secure API Key Management**: Manage, mask, and update API keys for all integrated services from a single UI.
- **AI Assistant (Nova AI)**: Context-aware chatbot for onboarding, navigation, and security guidance.
- **User Onboarding & Guided Tour**: Intuitive onboarding modal and "Take Tour" button for new users.
- **Modern, Intuitive Design**: Responsive layouts, gradient cards, and accessible UI/UX throughout.
- **Role-based Access & Protected Routes**: Secure authentication and protected pages for sensitive features.
- **Easy Deployment & Open Source Ready**: Simple build, serve, and deploy steps for local or cloud hosting.

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v18+ recommended)
- npm or bun (for package management)
- Modern web browser (Chrome, Firefox, Edge)

### 1. Clone the Repository
```sh
git clone https://github.com/yourusername/skyidrow-threat-nexus.git
cd skyidrow-threat-nexus
```

### 2. Install Dependencies
```sh
# With npm
npm install
# Or with bun
bun install
```

### 3. Configure API Keys
- Copy `src/config/apiKeys.ts.example` to `src/config/apiKeys.ts` (if not present)
- Add your API keys for threat intelligence/news services in the config file or via the in-app API Key Manager UI

### 4. Start the Development Servers
```sh
# Start the backend proxy server (port 5001)
For issues or questions, please open an issue in the GitHub repository or contact the development team at support@threathunterpro.com.
# In a new terminal, start the frontend (Vite, port 5173)

```

### 5. Access the App
- Frontend: [http://localhost:8080](http://localhost:5173)
- API Monitor Dashboard: [https://skyidrowsecurity.onrender.com/api/monitor](https://skyidrowsecurity.onrender.com/api/monitor)
- If Deployed the Project Locally -> node proxy.js
### 6. Build & Deploy
```sh
npm run build
# Serve the production build (e.g., with serve, nginx, or your cloud provider)
```
See the deployment section in the documentation for domain, SSL, and cloud setup tips.

---

## 🏁 Quick Start Instructions

1. **Clone the Repository**
   ```sh
   git clone https://github.com/Ontiomacer/SkyidrowSecurity.git
   cd SkyidrowSecurity
   ```
2. **Install Dependencies**
   ```sh
   npm install
   # or
   bun install
   ```
3. **Configure API Keys**
   - Copy `src/config/apiKeys.ts.example` to `src/config/apiKeys.ts` if needed.
   - Add your API keys in `src/config/apiKeys.ts` or set them as environment variables.
4. **Install Required Tools**
   - Install [nmap](https://nmap.org/download.html) and ensure it’s in your system PATH.
   - (Optional) Install `urlbuster` for URL brute-force features.
5. **Start the Backend Proxy**
   ```sh
   node proxy.js
   # or
   npm run start:proxy
   ```
6. **Start the Frontend**
   ```sh
   npm run dev
   ```
7. **Open the App**
   - Visit [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🧭 Onboarding & Usage

- **First Time?** Click "Take Tour" or use the Nova AI chat widget for a guided walkthrough.
- **API Keys:** Go to Settings → API Key Manager to add, update, or view (masked) your service keys.
- **Simulations:** Use the dashboard to run Nmap simulations and view results in real time.
- **News:** Click the News Highlights card or visit `/news` for the latest cybersecurity updates.
- **Threat Analytics:** Open ThreatHunter Pro for advanced threat hunting and analytics.
- **Documentation:** See the in-app Documentation page for detailed guides and screenshots.

---

## 🖼️ Screenshots
Find UI screenshots in `src/docs/screenshots/`.

---

## 🤝 Contributing & Support

1. Fork the repo and create a feature branch.
2. Make your changes and submit a pull request.
3. For issues, open a GitHub issue or contact the maintainers.

---

## 📄 License
This project is open source. See [LICENSE](LICENSE) for details. Recommended: MIT or Apache 2.0.
ThreatHunter Pro uses a modular architecture:

---

## 🟢 Deploying to Splunkbase

### 1. Prepare the Splunk App Structure
- Build your frontend: `npm run build`
- Copy the build output (e.g., `dist/`) to `SkyidrowSecurity/appserver/static/`
- Ensure you have:
  - `SkyidrowSecurity/default/app.conf`
  - `SkyidrowSecurity/appserver/static/` (with your build)
  - `SkyidrowSecurity/README_splunkbase.md`

### 2. Package the App
```sh
cd ..
tar -czvf SkyidrowSecurity-1.0.0.tar.gz SkyidrowSecurity/
```

### 3. Install in Splunk
- Go to Splunk Web > Manage Apps > Install app from file
- Upload the `SkyidrowSecurity-1.0.0.tar.gz` file

### 4. Access and Integrate
- The app will appear in your Splunk navigation.
- You can add Splunk dashboards, custom search commands, or REST API integrations as needed.

For more, see `SkyidrowSecurity/README_splunkbase.md` and Splunk developer docs: https://dev.splunk.com/enterprise/docs/developapps/

---

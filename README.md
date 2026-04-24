# 🏆 BharatVerify - Comprehensive Certificate Verification System

Welcome to **BharatVerify**, an enterprise-grade digital credential validation system. Easily verify the authenticity of all kinds of digital credentials — from academic degrees to technical bootcamps and internship completion letters — in just a few clicks!

---

## ✨ Features

*   **🛡️ Multi-Type Certificate Verification:** Supports validating Course Completions, Internships, Workshop Participation, Academic Degrees, and more automatically. Dynamic UI adjusts the title and description per certificate type.
*   **📹 Built-in QR Code Scanner:** Allows live environment-camera scanning or uploading QR code images directly from your mobile device via an in-app HTML5 component! 
*   **📱 Enterprise & Seamless UI:** Crafted with a professional double-pane layout featuring an Indian-style elegant digital certificate frame (featuring classic Playfair Display fonts, deep gold borders, and digital sig/seals).
*   **🌙 Dark Mode Support:** Seamless toggling between light and dark themes using a user-friendly toggle or reacting natively to the system theme. 
*   **💻 Fully Responsive:** Accessible from desktop browsers, tablets, and smartphones right out of the box.

---

## 🛠️ Technologies Used

*   **HTML5** - Semantic and accessible markup.
*   **CSS3** - Flexbox, Grids, variables, modern animations, UI/UX aesthetics, and `@media` queries.
*   **Vanilla JavaScript** - Robust DOM manipulation, mock database interactions, and state handling. 
*   **[html5-qrcode](https://github.com/mebjas/html5-qrcode)** - Third-party library for rapid and lightweight QR code scanning directly in the browser safely.

---

## 🚀 How To Run

Since the application requires no backend setup for this presentation, getting started is practically instantaneous:

1. **Clone/Download** this repository.
2. Open the directory containing the project files.
3. Open the `index.html` file using any modern Web Browser (e.g., Google Chrome, Firefox, Safari).

*(Note: If you want to use the live laptop/smartphone camera feature for the QR Scanner, you must serve the application over HTTPS or `localhost` to satisfy modern browser security restrictions.)*

---

## 📋 Sample Credentials Database to Test

To see the system in action, use any of the following valid codes. Each maps to a completely different certificate type!

| Certificate ID | Name | Role/Course | Certificate Type |
| --- | --- | --- | --- |
| `CERT-2024-0001` | John Anderson | Advanced Web Development | COURSE COMPLETION |
| `INT-2024-0089` | Priya Sharma | Software Engineering Intern | CERTIFICATE OF INTERNSHIP |
| `WORK-2024-4421` | Arjun Desai | AI & Machine Learning | WORKSHOP PARTICIPATION |
| `DEG-2023-9901` | Sneha Patel | B.Tech. in Computer Science | ACADEMIC DEGREE |

---

## 🔐 Security Information

This simulated tool uses rigorous frontend security structures:
*   Sanitizes and handles IDs dynamically without dangerous `innerHTML` injection flaws.
*   Shows generic errors on failures securely. 
*   Provides robust offline behavior handling with immediate UI resets.

*In a production environment, simply attach the frontend's API to a protected backend returning valid JSON payloads of real certificate properties!*

---

Made with ❤️ and Vanilla JavaScript.
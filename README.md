# 📱 LabelLens — "Label Padhega India" 🇮🇳

> *"There is marketing on the front of the pack, but trust lies in the ingredients list."*  
> — *The fundamental philosophy urging consumers to flip products around and read the back panel.*

> *"The most important skill in the 21st century is not coding, it's decoding."*  
> — *Refers to decoding misleading food labels and false marketing claims.*

---

## 🌟 Inspiration & Vision
While many countries mandate clear warning labels, nutritional grades, or front-of-pack red flags on ultra-processed junk food, packaged foods in India often feature vibrant marketing claims on the front ("100% Natural!", "Healthy Choice!", "No Added Sugar!") while hiding high sodium, refined wheat flour (Maida), palm oil, and synthetic additives on the back.

Inspired by food safety advocates and creators like **Food Pharmer**,**Trustified**, **Satvic Movement**. It was built by a BCA (Bachelor of Computer Applications) student as a mission-driven health-tech mobile application. Its goal is simple: to empower family, friends, and everyday consumers across India to unmask deceptive packaging and make scientifically informed dietary decisions.

---

## 🚀 What LabelLens Does
**LabelLens** acts as your pocket nutritionist and label decoder:
1. **Live Barcode Scanner:** Instantly scans product barcodes and fetches nutritional data directly from the localized Indian Open Food Facts database (`in.openfoodfacts.org`).
2. **ICMR-NIN Health Warnings:** Evaluates product ingredients and nutritional values against official **ICMR-NIN (Indian Council of Medical Research - National Institute of Nutrition)** guidelines to flag excessive added sugars, saturated fats, sodium, and hidden palm oil sources.
3. **INS & E-Code Unmasker:** Translates cryptic chemical additives (such as INS 150d, INS 322, or INS 621) into plain-English risk levels (Low, Moderate, High) with clear explanations of their health impact.
4. **Back-of-Pack Label Analysis:** Designed to help consumers decode ingredient lists when standard front-of-pack claims mislead them.

---

## 💡 Advantages of LabelLens
* **Consumer Empowerment:** Bridges the gap between complex nutritional chemistry and everyday Indian consumers.
* **Localized Context:** Specifically tuned for products manufactured and sold in the Indian market.
* **Cross-Platform Tech Stack:** Built with modern, scalable technologies (**React Native**, **Expo**, **TypeScript**, and **Open Food Facts API**).
* **Open Source & Portfolio-Ready:** Fully transparent codebase designed to demonstrate real-world mobile app development and public-health tech application.

---

## ⚠️ Limitations
* **Database Dependency:** Relies on the Open Food Facts crowd-sourced database. Some hyper-local or newly launched regional snacks might occasionally have missing nutritional fields, requiring fallback estimates.
* **OCR & Lighting:** Scanning packaging in low-light environments can occasionally impact optical clarity.

---

## 🛠️ Tech Stack
* **Frontend:** React Native, Expo, TypeScript
* **Camera & UI:** Expo Camera, React Native StyleSheet
* **API & Data:** Open Food Facts India REST API
* **Tunneling / Dev Tools:** ngrok & Expo Go

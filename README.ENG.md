Menu - Spritzeria Barberini
An Angular web application for displaying a digital restaurant menu with multilingual support, real-time updates, and elegant design.

Project Description
Menu is a modern and responsive web application built with Angular 20 that allows customers to view the menu of a luxury restaurant. The app supports three languages (Italian, English, French), features elegant animations, and provides real-time updates of available dishes via WebSocket.

Key Features
Luxury Design: Premium color palette (gold and black) with elegant fonts (Playfair Display and Montserrat)

Multilingual Support: Full support for Italian, English, and French with dynamic language switching

Elegant Animations: Splash screen with door opening effect, hover effects, smooth transitions

Real-time Updates: Instant dish availability updates via WebSocket (Socket.io)

Responsive: Optimized for desktop, tablet, and mobile devices

Accessibility: Support for screen readers, ARIA labels, prefers-reduced-motion

Dark Mode: Design optimized for OLED and dark mode

Performance: OnPush ChangeDetectionStrategy, intelligent caching, lazy loading

Technology Stack
Frontend Framework: Angular 20 (Standalone Components)

Language: TypeScript

Styling: SCSS with CSS variables

Fonts: Google Fonts (Playfair Display, Montserrat)

Icons: FontAwesome

Translations: ngx-translate

Real-time: Socket.io

HTTP: HttpClient

State Management: RxJS (Observables, BehaviorSubject)

Project Structure
text
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       ├── menu-data/
│   │       │   └── menu-data.ts          (Menu data service with caching)
│   │       └── socket-service/
│   │           └── socket.service.ts      (WebSocket real-time service)
│   ├── features/
│   │   ├── menu/
│   │   │   ├── menu.ts                   (Main menu component)
│   │   │   ├── menu.html                 (Menu template)
│   │   │   └── menu.scss                 (Menu styles)
│   │   ├── splash-screen/
│   │   │   ├── splash-screen.ts          (Splash screen component)
│   │   │   ├── splash-screen.html        (Splash template)
│   │   │   └── splash-screen.scss        (Splash styles)
│   │   └── language-switcher/
│   │       ├── language-switcher.ts      (Language switcher component)
│   │       ├── language-switcher.html    (Switcher template)
│   │       └── language-switcher.scss    (Switcher styles)
│   ├── app.ts                            (Root component)
│   ├── app.html                          (Root template)
│   └── app.scss                          (Root styles)
├── styles.scss                           (Global styles, CSS variables)
├── main.ts                               (Application bootstrap)
└── environment.ts                        (Environment configuration)

assets/
├── i18n/
│   ├── it.json                           (Italian translations)
│   ├── en.json                           (English translations)
│   └── fr.json                           (French translations)
├── images/
│   ├── logo.png                          (Application logo)
│   ├── left-door.png                     (Splash left door)
│   └── right-door.png                    (Splash right door)
Installation and Setup
Prerequisites
Node.js (v18 or higher)

npm or yarn

Angular CLI v20 or higher

Installation Steps
Clone the repository

bash
git clone <repository-url>
cd menu
Install dependencies

bash
npm install
Configure environment
Update src/environment.ts with your backend URL:

typescript
export const environment = {
  apiUrl: 'http://localhost:3000'  // Backend URL
};
Start the development server

bash
ng serve
Open in browser
Navigate to http://localhost:4200/

Development
Development Server
bash
ng serve
The application will automatically reload whenever you modify any source files. Open your browser to http://localhost:4200/.

Generate New Components
bash
ng generate component component-name
Generate New Services
bash
ng generate service core/services/service-name
For a complete list of available schematics:

bash
ng generate --help
Build
Production Build
bash
ng build
The compiled files will be stored in the dist/ directory. The production build is optimized for performance and speed with:

Code minification

Tree-shaking

Lazy loading

AOT compilation

Build for Specific Environments
bash
ng build --configuration production
Testing
Unit Tests
Run unit tests with Karma:

bash
ng test
End-to-End Tests (E2E)
Run end-to-end tests:

bash
ng e2e
Note: Angular CLI does not include an E2E framework by default. You can choose between Cypress, Playwright, or Protractor.

Configuration
Global CSS Variables (styles.scss)
text
:root {
  --font-primary: 'Montserrat', sans-serif;      /* Primary font */
  --font-headings: 'Playfair Display', serif;    /* Heading font */
  
  --color-background: #121212;   /* Deep black */
  --color-text: #E0E0E0;         /* Non-blinding white */
  --color-primary: #D4AF37;      /* Elegant gold */
  --color-border: #333;          /* Discrete borders */
}
i18n Configuration (app.ts)
Supported languages are configured in the root component:

typescript
translate.addLangs(['it', 'en', 'fr']);
translate.setDefaultLang('it');
WebSocket Configuration
WebSocket connection is managed by SocketService:

typescript
private readonly backendUrl = environment.apiUrl;
reconnectionAttempts: 5        // Reconnection attempts
timeout: 15000                  // 15 second timeout
Architecture and Flows
Menu Loading Flow
App Startup → app.ts initializes languages

Menu Component → Calls MenuDataService.getMenuData()

Caching → Returns from cache if available; otherwise HTTP GET

Backend Response → Menu data arrives from server

Data Processing → Menu sorted by price

Rendering → Template renders categories and items

Real-time Update Flow
Server Event → Backend emits menu_item_updated via Socket.io

Socket Listener → SocketService.listen() receives event

Data Update → MenuDataService.updateMenuItemLocally() updates cache

Observable Emit → BehaviorSubject emits new menu

UI Update → Component receives data and template re-renders

Language Change Flow
User Click → User clicks link in LanguageSwitcher

useLanguage() → Calls TranslateService.use(lang)

Event Emission → ngx-translate emits onLangChange

Menu Update → Menu component listens and updates currentLang

Template Re-render → getLocalizedText() extracts texts in new language

Main Components
Menu Component (menu.ts)
Manages menu loading and display

Implements scroll-to-top with listener

Integrates language switcher and splash screen

OnPush change detection for performance

Splash Screen Component (splash-screen.ts)
Elegant door opening animation

Emits event when animation completes

Responsive and accessible

Language Switcher Component (language-switcher.ts)
Enables dynamic language switching

Highlights current language

Hover effects for UX

Menu Data Service (menu-data.ts)
Centralized menu data management

Intelligent caching

WebSocket listeners for real-time updates

Immutable updates for Angular change detection

Socket Service (socket.service.ts)
WebSocket connection management

Observable pattern for events

Automatic resource cleanup

Integration with Angular NgZone

Performance
Implemented Optimizations
OnPush ChangeDetectionStrategy: Only check when input changes

Caching: Menu cached after first load

distinctUntilChanged(): Prevents duplicate emissions

Track functions: Optimizes rendering in @for loops

Lazy loading: Standalone components

Tree-shaking: Removes unused code in build

Font display swap: Prevents FOUT (Flash of Unstyled Text)

Accessibility
ARIA Labels: For interactive elements

Alt Text: For all images

prefers-reduced-motion: Support for motion-sensitive users

Color Contrast: WCAG AA compliant ratios

Semantic HTML: Proper structure with headings, lists, etc.

Screen Reader Friendly: role="presentation" for decorative elements

Browser Support
Chrome/Edge (v90+)

Firefox (v88+)

Safari (v15+)

Mobile browsers (iOS Safari, Chrome Mobile)

Troubleshooting
Error: "Cannot find module '@angular/...'"
Solution: Run npm install

WebSocket Connection Refused
Verify that the backend is online and environment.apiUrl is correct

Translations Not Loading
Verify that JSON files are in src/assets/i18n/

Performance Issues
Check DevTools Performance tab and verify OnPush detection is active

Contributing
To contribute to this project:

Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

License
This project is licensed under the MIT License - see the LICENSE file for details.

Author
Macwell Tubale

Website: macwelltubale.it

GitHub: @macwelltubale

Contact and Support
For questions, bug reports, or feature requests, please open an issue in the repository.

Changelog
v1.0.0 (2025-11-08)
✅ Initial launch

✅ Multilingual support (IT, EN, FR)

✅ Splash screen animation

✅ Real-time WebSocket updates

✅ Responsive design

✅ WCAG AA accessibility

✅ Intelligent caching

Useful Resources
Angular Documentation

Angular CLI Documentation

RxJS Documentation

Socket.io Documentation

ngx-translate Documentation

TypeScript Handbook

Menu - Bringing Digital Excellence to Restaurant Dining ✨
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy";
  }, []);

  const privacyText = `
Last Updated: 2026-01-01

<strong>1. introduction</strong>
This Privacy Policy explains how I collect, use, and protect your personal data when you visit this website (sehetz.info). I am committed to transparency and comply with the Swiss Federal Data Protection Act (FADP) and the General Data Protection Regulation (GDPR) where applicable.

<strong>2. controller of personal data</strong>
Sarah Heitz, E-Mail: sarahelenaheitz@gmail.com
Canton Basel, Switzerland

<strong>3. data I collect and how I collect it</strong>

<strong>3.1 automatically collected data</strong>
Browser Information: IP address, browser type, operating system, referrer URL
Access Logs: Pages visited, time of visit, duration
Technical Data: Device type, screen resolution
Storage: Temporary, in server access logs only. Not used for tracking or profiling.

<strong>3.2 data you voluntarily provide</strong>
Contact Form / E-Mail: Name, e-mail address, message content
Feedback: Any feedback or comments you submit

<strong>3.3 local storage data</strong>
The following data is stored locally in your browser (not sent to servers):
Impressum Text: Your edits to the impressum page
Dark Mode Preference: Your light/dark mode toggle state
Strudel State: WebAudio playback state (no audio is recorded or transmitted)

<strong>3.4 third-party API data</strong>
I use NocoDB (a database service) to manage project and team data. When you visit the «About» or «Work» sections, your browser fetches data from NocoDB's API:
Data retrieved: Project titles, team names, timeline information, descriptions
No personal identifying information is sent to NocoDB
NocoDB's privacy policy applies to their processing: https://nocodb.com/privacy

<strong>3.5 external links and social media</strong>
This website contains links to external platforms (Spotify, Instagram, LinkedIn). These platforms have their own privacy policies. I am not responsible for their data practices.

<strong>4. how I use your data</strong>

<strong>4.1 for service provision</strong>
Display portfolio content and projects
Respond to e-mail inquiries
Maintain website functionality

<strong>4.2 for improvement and analytics</strong>
Analyze website usage via Google Analytics (anonymized)
Understand which projects and pages are most popular
Improve user experience and navigation
Fix bugs and security issues

<strong>4.3 legal obligations</strong>
Comply with Swiss law and GDPR
Respond to lawful requests from authorities

<strong>4.4 NOT used for</strong>
Targeted advertising
Profiling or automated decision-making
Sale to third parties
Tracking across other websites (no cookies, no pixels, no analytics)

<strong>5. data retention</strong>

Access Logs: Deleted after 30 days
E-Mail Correspondence: Retained for 2 years (for legal compliance)
Local Storage Data: Permanently stored on your device until you clear it
NocoDB Data: Retained per NocoDB's retention policy

<strong>6. your rights</strong>
Under FADP and GDPR, you have the right to:
Access your personal data
Correct inaccurate data
Request deletion («right to be forgotten»)
Port your data to another service
Object to processing
Withdraw consent

To exercise these rights, contact me at: sarahelenaheitz@gmail.com

<strong>7. no third-party sharing</strong>
I do not sell, trade, or share your personal data with third parties, except:
NocoDB (for project data retrieval, as disclosed above)
Google (for Analytics, as disclosed above)
Service providers (e.g., hosting providers)
When legally required by Swiss or EU authorities

<strong>8. security</strong>
I implement reasonable security measures:
HTTPS encryption for data in transit
Secure API token handling (not exposed in client-side code)
Regular updates to dependencies
No logging of sensitive information

However, no system is 100% secure. I cannot guarantee absolute security.

<strong>9. cookies and tracking</strong>

<strong>9.1 Google Analytics</strong>
This website uses Google Analytics 4 to understand how visitors use the site. Google Analytics collects:
Anonymized IP addresses (IP anonymization is enabled)
Browser and device information
Pages visited and time spent on pages
Traffic sources (how you found this site)

Google Analytics sets cookies on your device to distinguish unique users. These cookies do not collect personally identifiable information.
Data collected by Google Analytics is processed according to Google's Privacy Policy: https://policies.google.com/privacy
You can opt out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on: https://tools.google.com/dlpage/gaoptout

<strong>9.2 localStorage</strong>
This website uses browser localStorage (not cookies) for:
Dark mode preference
Impressum text edits
WebAudio playback state

This data is stored locally on your device and never transmitted to servers.

<strong>10. external links</strong>
This website contains links to external websites (NocoDB, social media platforms, etc.). I am not responsible for their privacy practices. Please review their privacy policies before sharing data with them.

<strong>11. changes to this policy</strong>
I may update this Privacy Policy at any time. Changes will be posted on this page with an updated «Last Updated» date. Your continued use of this website constitutes acceptance of the updated policy.

<strong>12. contact</strong>
For questions, concerns, or to exercise your privacy rights, please contact me:
E-Mail: sarahelenaheitz@gmail.com
Canton Basel, Switzerland

I will respond to legitimate privacy requests within 30 days.`;

  return (
    <>
      <Header />
      <main className="p-6-all">
        <h1 className="text-1">Privacy Policy</h1>
        <div
          className="text-2"
          style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}
          dangerouslySetInnerHTML={{ __html: privacyText }}
        />
      </main>
      <Footer />
    </>
  );
}

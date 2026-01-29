import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { useEffect } from "react";

export default function Impressum() {
  useEffect(() => {
    document.title = "Impressum — Sarah Heitz";
  }, []);

  const impressumText = `
<strong>Operator / Provider / Head of Code</strong>
Sarah Heitz + Github Copilot

<strong>Contact</strong>
hoi@sehetz.ch

<strong>Liability for Content</strong>
The contents of our website have been created with great care. However, I assume no liability for the accuracy, completeness, or timeliness of the contents.

<strong>Liability for Links</strong>
Our website contains links to external third-party websites, over whose contents I have no control. Therefore, I cannot assume any liability for these external contents.

<strong>Copyright and Intellectual Property</strong>
The content and works created by the operator of this website are subject to Swiss copyright law. Any reproduction, editing, distribution, or any other use outside the scope of copyright law requires the prior written consent of the author or operator.

<strong>Data Protection</strong>
I process personal data in accordance with the Swiss Federal Data Protection Act (FADP) and the General Data Protection Regulation (GDPR) where applicable. For more information, please refer to our privacy policy.

<strong>Liability Limitation</strong>
I assume no liability for direct, indirect, incidental, special, or consequential damages arising from access to or use of this website, even if I have been advised of the possibility of such damages.

<strong>Applicable Law and Jurisdiction</strong>
These terms of use and all legal relationships arising from the use of this website are governed by the laws of Switzerland. The exclusive place of jurisdiction is in the Canton of Basel, Switzerland.

<strong>Third-Party Content</strong>
I am not responsible for third-party content accessible through our website. I do not endorse or assume liability for any external content, products, or services.

<strong>Right of Alteration</strong>
I reserve the right to modify, supplement, or discontinue this website and its contents at any time without prior notice.

<strong>Contact for Inquiries</strong>
For questions regarding this impressum or our website, please contact me via the e-mail address listed above.`;

  return (
    <>
      <Header />
      <main className="p-6-all">
        <h1 className="text-1">Imprint</h1>
        <div
          className="text-2"
          style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}
          dangerouslySetInnerHTML={{ __html: impressumText }}
        />
      </main>
      <Footer />
    </>
  );
}

const HtmlWrapper = {
    html: (content) => `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Terms & Conditions • Sample App</title>
  <meta name="description" content="Sample Terms & Conditions for a website or app." />
  <style>
    :root {
      --bg: #f9fafb;
      --card: #ffffff;
      --muted: #4b5563;
      --text: #111827;
      --accent: #2563eb;
      --border: #e5e7eb;
      --success: #16a34a;
      --warn: #d97706;
      --danger: #dc2626;
      --max: 880px;
    }
    html, body { height: 100%; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
      line-height: 1.6;
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .container {
      max-width: var(--max);
      margin: 0 auto;
      padding: 24px;
    }
    header {
      margin: 24px 0 16px;
      padding: 24px;
      border: 1px solid var(--border);
      background: linear-gradient(180deg, rgba(37,99,235,0.05), rgba(255,255,255,1));
      border-radius: 16px;
      position: relative;
      overflow: hidden;
    }
    header::after {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(600px 200px at 20% 0%, rgba(37,99,235,0.1), transparent 60%);
      pointer-events: none;
    }
    h1 {
      margin: 0 0 8px;
      font-size: clamp(28px, 4vw, 40px);
      letter-spacing: -0.02em;
    }
    .meta { color: var(--muted); font-size: 14px; }
    .badge {
      display: inline-block;
      font-size: 12px;
      padding: 2px 8px;
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--muted);
      background: #f3f4f6;
    }
    nav.toc {
      margin: 24px 0;
      padding: 16px 16px 8px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--card);
    }
    nav.toc summary {
      cursor: pointer;
      font-weight: 600;
    }
    nav.toc ol {
      margin: 8px 0 0;
      padding: 0 0 0 18px;
    }
    nav.toc a { color: var(--accent); text-decoration: none; }
    nav.toc a:hover { text-decoration: underline; }

    section.card {
      border: 1px solid var(--border);
      background: var(--card);
      border-radius: 16px;
      padding: 20px;
      margin: 16px 0;
    }
    h2 { margin: 0 0 8px; letter-spacing: -0.01em; }
    h3 { margin: 16px 0 8px; }
    p { margin: 8px 0; }
    ul, ol { margin: 8px 0 8px 22px; }
    code.inline { background: #f3f4f6; border: 1px solid var(--border); padding: 1px 6px; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

    .note { border-left: 3px solid var(--accent); padding-left: 12px; color: var(--muted); }
    .ok { color: var(--success); }
    .warn { color: var(--warn); }
    .danger { color: var(--danger); }

    footer { color: var(--muted); font-size: 14px; margin: 24px 0; text-align: center; }

    /* Print styles */
    @media print {
      body { background: #fff; color: #000; }
      header, nav.toc, section.card { border-color: #ccc; background: #fff; }
      a { color: #000; text-decoration: none; }
      .badge { border-color: #ccc; color: #333; }
    }
  </style>
</head>
<body>
  <div class="container" role="document">
    ${content}
  </div>

  <script>
    // Update year automatically
    document.getElementById('year').textContent = new Date().getFullYear();
  </script>
</body>
</html>
`,
    terms: ` 

    <section id="acceptance" class="card" aria-labelledby="acceptance-h">
      <h2 id="acceptance-h">1. Acceptance of Terms</h2>
      <p>By accessing or using <strong>Sample App</strong> (the “Service”) provided by <strong>Sample App</strong> ("we", "us", or "our"), you agree to be bound by these Terms & Conditions (the “Terms”). If you do not agree to the Terms, you may not access or use the Service.</p>
      <p>If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms, and “you” refers to that organization.</p>
    </section>

    <section id="changes" class="card" aria-labelledby="changes-h">
      <h2 id="changes-h">2. Changes to Terms</h2>
      <p>We may modify these Terms from time to time. Material changes will be notified via the Service or by email. Changes become effective on the date indicated. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
    </section>

    <section id="eligibility" class="card" aria-labelledby="eligibility-h">
      <h2 id="eligibility-h">3. Eligibility & Accounts</h2>
      <h3>3.1 Eligibility</h3>
      <p>You must be at least the age of majority in your jurisdiction to use the Service. By using the Service, you represent and warrant that you meet this requirement.</p>
      <h3>3.2 Account Registration</h3>
      <p>You may need to create an account. You agree to provide accurate information and keep it updated. You are responsible for safeguarding your credentials and activities under your account. Notify us immediately of any unauthorized use.</p>
      <h3>3.3 Suspension & Termination</h3>
      <p>We may suspend or terminate your account for breach of these Terms, unlawful conduct, or risk to the Service or other users.</p>
    </section>

    <section id="payments" class="card" aria-labelledby="payments-h">
      <h2 id="payments-h">4. Pricing, Payments & Taxes</h2>
      <p>Some features may require payment. Prices are listed before purchase and may change prospectively. You authorize us (and our payment processors) to charge your selected payment method.</p>
      <ul>
        <li><strong>Subscriptions:</strong> Auto-renew unless canceled before the renewal date.</li>
        <li><strong>Refunds:</strong> Except as required by law, all fees are non-refundable.</li>
        <li><strong>Taxes:</strong> Prices may exclude taxes. You are responsible for any applicable taxes, duties, or levies.</li>
      </ul>
    </section>

    <section id="use" class="card" aria-labelledby="use-h">
      <h2 id="use-h">5. Acceptable Use</h2>
      <p>You agree not to misuse the Service. Prohibited activities include, without limitation:</p>
      <ul>
        <li>Violating applicable laws or regulations;</li>
        <li>Infringing intellectual property or privacy rights;</li>
        <li>Uploading malware or interfering with the Service’s operation;</li>
        <li>Attempting to access non-public areas or reverse engineer the Service;</li>
        <li>Harassing, abusing, or harming others.</li>
      </ul>
    </section>

    <section id="content" class="card" aria-labelledby="content-h">
      <h2 id="content-h">6. User Content & Feedback</h2>
      <p>You retain rights to content you submit (“User Content”). By submitting, you grant us a worldwide, non-exclusive, royalty-free license to host, store, reproduce, and display your User Content to operate and improve the Service.</p>
      <p>Feedback is welcome and may be used without restriction or obligation to you.</p>
      <p>You represent you have necessary rights to submit the User Content, and that it does not violate any laws or rights of third parties.</p>
    </section>

    <section id="ip" class="card" aria-labelledby="ip-h">
      <h2 id="ip-h">7. Intellectual Property</h2>
      <p>The Service, including software, design, text, graphics, and logos, is owned by or licensed to Sample App and is protected by intellectual property laws. Except as expressly allowed, you may not copy, modify, distribute, sell, or lease any part of the Service.</p>
    </section>

    <section id="privacy" class="card" aria-labelledby="privacy-h">
      <h2 id="privacy-h">8. Privacy</h2>
      <p>Your use of the Service is also governed by our <a href="/privacy" rel="noopener">Privacy Policy</a>. By using the Service, you consent to the collection and use of information as described there.</p>
    </section>

    <section id="thirdparty" class="card" aria-labelledby="thirdparty-h">
      <h2 id="thirdparty-h">9. Third‑Party Links & Services</h2>
      <p>The Service may link to third-party websites or services we do not control. We are not responsible for their content, policies, or practices. Access them at your own risk.</p>
    </section>

    <section id="warranty" class="card" aria-labelledby="warranty-h">
      <h2 id="warranty-h">10. Disclaimers & Warranties</h2>
      <p><strong>THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.”</strong> TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON‑INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR‑FREE.</p>
    </section>

    <section id="liability" class="card" aria-labelledby="liability-h">
      <h2 id="liability-h">11. Limitation of Liability</h2>
      <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, Sample App AND ITS AFFILIATES, DIRECTORS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.</p>
      <p>IN NO EVENT WILL OUR AGGREGATE LIABILITY EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO US IN THE 3 MONTHS PRECEDING THE CLAIM OR (B) USD $100.</p>
    </section>

    <section id="indemnity" class="card" aria-labelledby="indemnity-h">
      <h2 id="indemnity-h">12. Indemnification</h2>
      <p>You agree to defend, indemnify, and hold harmless Sample App from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys’ fees) arising out of or related to your use of the Service, your User Content, or violation of these Terms.</p>
    </section>

    <section id="termination" class="card" aria-labelledby="termination-h">
      <h2 id="termination-h">13. Termination</h2>
      <p>We may suspend or terminate the Service or your access at any time, with or without cause or notice. Upon termination, your right to use the Service will cease immediately, but sections intended to survive termination will continue to apply.</p>
    </section>

    <section id="law" class="card" aria-labelledby="law-h">
      <h2 id="law-h">14. Governing Law & Dispute Resolution</h2>
      <p>These Terms are governed by the laws of <strong>Place</strong>, without regard to conflict of law principles.</p>
      <h3>14.1 Informal Resolution</h3>
      <p>Before filing a claim, you agree to try to resolve the dispute informally by contacting us at <a href="mailto:sample@example.com">sample@example.com</a>.</p>
      <h3>14.2 Arbitration (Optional)</h3>
      <p>If you include an arbitration clause, specify the administering body, rules, seat, language, and opt‑out procedure here.</p>
      <h3>14.3 Venue</h3>
      <p>Subject to any arbitration requirement, the courts located in <strong>City</strong> will have exclusive jurisdiction.</p>
    </section>

    <section id="contact" class="card" aria-labelledby="contact-h">
      <h2 id="contact-h">15. Contact Us</h2>
      <p>If you have questions about these Terms, contact us at:</p>
      <address>
        Sample App<br/>
        Address Line 1<br/>
        Address Line 2<br/>
        Email: <a href="mailto:sample@example.com">sample@example.com</a><br/>
        Phone: +1234567890
      </address>
    </section>

    <footer>
      <p>© <span id="year"></span> Sample App. All rights reserved.</p>
    </footer>
`,
    privacy: `

    <section id="info" class="card">
      <h2>1. Information We Collect</h2>
      <p>We may collect the following types of information:</p>
      <ul>
        <li><strong>Personal Information:</strong> such as name, email address, phone number, billing details.</li>
        <li><strong>Usage Data:</strong> such as IP address, browser type, pages visited, and time spent on the Service.</li>
        <li><strong>Device Data:</strong> such as device model, operating system, unique device identifiers.</li>
      </ul>
    </section>

    <section id="use" class="card">
      <h2>2. How We Use Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide, operate, and improve the Service;</li>
        <li>Process payments and fulfill transactions;</li>
        <li>Communicate with you, including updates and marketing (with consent);</li>
        <li>Protect against fraud, abuse, or security risks;</li>
        <li>Comply with legal obligations.</li>
      </ul>
    </section>

    <section id="share" class="card">
      <h2>3. How We Share Information</h2>
      <p>We may share your information with:</p>
      <ul>
        <li>Service providers who help us operate the Service;</li>
        <li>Business partners with your consent;</li>
        <li>Authorities if required by law or to protect rights and safety;</li>
        <li>Third parties in connection with a merger, sale, or acquisition.</li>
      </ul>
    </section>

    <section id="cookies" class="card">
      <h2>4. Cookies & Tracking</h2>
      <p>We use cookies and similar technologies to track usage, store preferences, and improve your experience. You can manage cookies in your browser settings.</p>
    </section>

    <section id="security" class="card">
      <h2>5. Data Security</h2>
      <p>We implement reasonable measures to protect your data, but no method of transmission or storage is 100% secure. We cannot guarantee absolute security.</p>
    </section>

    <section id="rights" class="card">
      <h2>6. Your Rights</h2>
      <p>Depending on your location, you may have rights such as:</p>
      <ul>
        <li>Accessing, updating, or deleting your personal data;</li>
        <li>Opting out of marketing communications;</li>
        <li>Restricting or objecting to certain processing;</li>
        <li>Data portability.</li>
      </ul>
    <p>You can exercise these rights by contacting us at <a href="mailto:sample@example.com">sample@example.com</a>.</p>
    </section>

    <section id="retention" class="card">
      <h2>7. Data Retention</h2>
      <p>We retain your information only as long as necessary for the purposes outlined in this Policy, unless a longer retention is required by law.</p>
    </section>

    <section id="children" class="card">
      <h2>8. Children’s Privacy</h2>
      <p>The Service is not intended for children under 13 (or the minimum age in your jurisdiction). We do not knowingly collect data from children. If you believe a child provided us with data, contact us to delete it.</p>
    </section>

    <section id="changes" class="card">
      <h2>9. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with a new “Last updated” date. Material changes may be notified via email or the Service.</p>
    </section>

    <section id="contact" class="card">
      <h2>10. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, contact us at:</p>
      <address>
        Sample App<br/>
        Address Line 1<br/>
        Address Line 2<br/>
        Email: <a href="mailto:sample@example.com">sample@example.com</a><br/>
        Phone: +1234567890
      </address>
    </section>

    <footer>
      <p>© <span id="year"></span> Sample App. All rights reserved.</p>
    </footer>
`,
    faqs: `
    <section id="faqs" class="card" aria-labelledby="faqs-h">
      <h2 id="faqs-h">Frequently Asked Questions</h2>

      <article class="faq" aria-labelledby="q1">
        <h3 id="q1">Q1: What is Sample App?</h3>
        <p>A: {{CompanyName}} provides <strong>sample services</strong> and resources for demonstration purposes. Replace this with a short description of your product or service.</p>
      </article>

      <article class="faq" aria-labelledby="q2">
        <h3 id="q2">Q2: How do I sign up?</h3>
        <p>A: Click the <strong>Sign Up</strong> or <strong>Create Account</strong> button on the site, provide the requested details, and verify your email (if required).</p>
      </article>

      <article class="faq" aria-labelledby="q3">
        <h3 id="q3">Q3: What payment methods are accepted?</h3>
        <p>A: We accept major credit cards, debit cards, and supported digital wallets. For subscriptions, billing occurs on the cycle you select during checkout.</p>
      </article>

      <article class="faq" aria-labelledby="q4">
        <h3 id="q4">Q4: How can I get support?</h3>
        <p>A: For support, contact our team using the details below or email <a href="mailto:sample@example.com">sample@example.com</a>. Provide your account email and a clear description of the issue to help us respond faster.</p>
      </article>

      <article class="faq" aria-labelledby="q5">
        <h3 id="q5">Q5: Where can I find the Privacy Policy and Terms?</h3>
        <p>A: You can view our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms &amp; Conditions</a> at the bottom of every page.</p>
      </article>
    </section>

    <section id="contact" class="card" aria-labelledby="contact-h">
      <h2 id="contact-h">Contact Information</h2>

      <div class="contact-details">
        <p><strong>Company:</strong> Sample App</p>
        <p><strong>Email:</strong> <a href="mailto:sample@example.com">sample@example.com</a></p>
        <p><strong>Phone:</strong> {{SupportPhone}}</p>
        <p><strong>Address:</strong> Address Line 1, Address Line 2</p>
      </div>

      <p>If you need immediate assistance, please include the following in your message:</p>
      <ul>
        <li>Account email or username</li>
        <li>Short description of the issue</li>
        <li>Relevant screenshots or error messages (if any)</li>
      </ul>
    </section>

    <footer>
      <p>© <span id="year"></span> Sample App. All rights reserved.</p>
    </footer>
`,
    getContent: (content) => {
        return HtmlWrapper.html(HtmlWrapper[content]);
    }
}

export default HtmlWrapper;
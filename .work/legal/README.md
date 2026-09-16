# Legal Documents — Placeholder Checklist

Before publishing any of these legal documents on your website, you **must** have a qualified lawyer review them for your jurisdiction and business model, then fill in all placeholders listed below.

## Overview

Four legal documents have been generated as HTML fragments, ready to be integrated into your website:

1. **privacy.html** — Privacy Policy covering India (DPDP 2023), GDPR, UK GDPR, and CCPA/CPRA
2. **terms.html** — Terms of Service (client engagement, payments, IP, liability, disputes)
3. **refunds.html** — Refund & Cancellation Policy
4. **licence.html** — Software Licence Agreement (EULA)

All documents include a template notice at the top reminding readers to have a lawyer review before relying on them.

---

## Placeholders to Fill In

### 1. Privacy Policy (privacy.html)

| Placeholder | What it is | Example | Where |
|---|---|---|---|
| `[GRIEVANCE OFFICER NAME]` | Name of your Data Protection Officer or grievance contact (required under India's DPDP 2023) | Rajesh Sharma | Section 9 |
| `[GRIEVANCE OFFICER EMAIL]` | Email for grievance complaints under Indian data protection law | grievance@lateapex.studio | Section 9 |

**Note:** The privacy officer is a mandatory requirement under the Digital Personal Data Protection Act 2023 if you process personal data of Indian residents. This person handles data protection complaints and inquiries.

---

### 2. Terms of Service (terms.html)

| Placeholder | What it is | Example | Where |
|---|---|---|---|
| `[GSTIN IF REGISTERED]` | Your GST Identification Number (if you're GST-registered in India). Leave blank or remove the line if not registered. | 27AABCU1234M1Z0 | Section 2 |
| `[CITY]` | The city where your business is located and where disputes will be resolved. The template uses Ahmedabad, Gujarat. Confirm this is correct or update. | Ahmedabad | Sections 2, 14 (appears multiple times) |
| `[LATE FEE AMOUNT or PERCENTAGE]` | The penalty for late payment (e.g., "5% per month" or a fixed amount per day). Define your policy. | 5% per month | Section 4 |
| `[NUMBER, e.g., 5]` | Number of support hours included in the monthly care plan | 5 | Section 10 |
| `[MONTHLY RATE, e.g., $99–$299/month]` | Price of your optional monthly care plan, adjusted for your site complexity tiers. List in INR for Indian clients, USD/EUR for foreign clients. | $99–$299/month or ₹8,000–₹25,000/month | Section 10 |

**Note on Jurisdiction:** Courts of [CITY], Gujarat is currently hardcoded as Ahmedabad. If your business is elsewhere in India, update to the correct city where you want disputes resolved.

---

### 3. Refund & Cancellation Policy (refunds.html)

No specific placeholders to fill. The policy references sections of the Terms of Service and Privacy Policy. Ensure consistency:
- Section references to Terms of Service (e.g., Section 4, Section 30) remain accurate.
- Verify that timelines (5–7 business days, 30 days) align with your actual processes.

**Check:** Confirm that the advance percentage (50%), payment terms, and cancellation notice periods (5 business days, 30 days) match your actual practices.

---

### 4. Software Licence Agreement (licence.html)

| Placeholder | What it is | Example | Where |
|---|---|---|---|
| `[CITY]` | The city where disputes over software licensing will be resolved. Should match Terms of Service. | Ahmedabad | Section 15 |

**Note:** This EULA references the Terms of Service for dispute resolution and governing law. Ensure the two documents are consistent.

---

## How to Use These Documents

### Hosting & Linking
- Save the HTML fragments in your website's legal directory (e.g., `/legal/privacy.html`).
- Add links in your website footer (e.g., "Privacy Policy," "Terms of Service," "Refund Policy," "Software Licence").
- Update your `robots.txt` and sitemap to make sure search engines can index these pages (or mark them as `noindex` if you prefer).

### Content Review
1. Read each document carefully with your lawyer.
2. Confirm all placeholders are filled and accurate.
3. Adjust timelines, fees, and processes to match your actual business operations.
4. Consider adding your business registration number (UDYAM/MSME if applicable) in a footer or contact section.

### Legal Review Checklist
- [ ] Lawyer has reviewed all four documents.
- [ ] All placeholders are filled with accurate information.
- [ ] Timelines (payment due dates, refund processing, care plan cancellation) match your processes.
- [ ] GST / tax handling is correct for your registration status.
- [ ] Dispute resolution jurisdiction is correct (Ahmedabad or your city).
- [ ] Payment methods listed (Razorpay, Stripe, bank transfer) are correct.
- [ ] Care plan pricing and included hours are realistic.
- [ ] Grievance officer contact details are active and monitored.
- [ ] Website footer includes links to all legal pages.

### Post-Publication
- Add a "Last updated" date whenever you revise a policy.
- Keep records of any policy changes and why they were made (e.g., law changes, business model changes).
- Monitor for regulatory changes (especially DPDP 2023 updates, GDPR enforcement actions, etc.).
- Update your website's cookie consent or privacy banner to align with the Privacy Policy.

---

## Specific Guidance by Region

### For Indian Clients Only
- Include your business address, phone number, and GST registration (if applicable) somewhere on your site.
- Use the DPDP 2023 grievance officer contact prominently.
- Consider adding a section in your Terms referencing the Consumer Protection Act 2019.
- Ensure invoices show GST separately if you're registered.

### For EU/UK Clients
- Confirm you have a mechanism for collecting explicit consent for non-essential cookies (even though your Privacy Policy states none are used currently).
- If you add analytics later (e.g., Plausible, Fathom), update the Privacy Policy and display a banner.
- Ensure your data processing agreements with hosting providers (e.g., Vercel, AWS) include GDPR Data Processing Agreements (DPAs).

### For US Clients (especially California)
- CCPA applies if your website targets California residents. The Privacy Policy references this; confirm it aligns with your actual data practices.
- Keep records of data requests (access, deletion, opt-out) for at least 12 months.
- Consider a "Do Not Sell My Personal Information" link if you collect data for analytics or marketing.

### For Other International Clients
- Be aware that GDPR applies to any EU/UK visitor, regardless of where your business is based.
- Consider using a privacy-friendly analytics tool (Plausible, Fathom, Umami) if you want to track traffic without GDPR compliance headaches.

---

## Legal Disclaimer

These documents are **templates** and should not be used as-is without legal review. Laws change, and your specific business practices may require modifications. A qualified lawyer in India (preferably familiar with DPDP 2023, GST, and international client law) should review before publication.

**Do not rely on these documents as legal advice.** They are generated based on common practices for freelance web studios in India. Your unique circumstances may require different terms.

---

## Questions to Ask Your Lawyer

When you have these reviewed, ask:

1. **DPDP 2023 Compliance:** Are all required disclosures under the Digital Personal Data Protection Act 2023 included? Should I register my grievance officer anywhere?
2. **GST & Taxation:** Should I add GST to all quotes, or only for Indian clients? Are reverse-charge provisions necessary?
3. **Consumer Protection Act:** Are there specific disclosures required for Indian consumers under CPA 2019?
4. **Dispute Resolution:** Should I use arbitration for all disputes, or allow small claims court for amounts under a threshold?
5. **Limitation of Liability:** Are the liability caps enforceable under Indian law? Should they be higher or lower?
6. **International Clients:** For foreign clients, should the Terms reference their local law as an alternative to Indian law?
7. **Payment Terms & Late Fees:** Are the payment terms (50% advance, 50% on launch) typical and enforceable? Are late fees reasonable?
8. **Refund Policy:** Are the refund terms compliant with consumer protection laws? Should I allow refunds after work begins?
9. **Software Licence:** Is the EULA comprehensive enough for protecting pre-existing tools while allowing clients to own custom code?
10. **Privacy & GDPR:** If I use cloud hosting or analytics, are my Data Processing Agreements (DPAs) in order?

---

## Summary of All Placeholders (Quick Reference)

| Document | Placeholder | Your Value |
|---|---|---|
| Privacy | `[GRIEVANCE OFFICER NAME]` | __________ |
| Privacy | `[GRIEVANCE OFFICER EMAIL]` | __________ |
| Terms | `[GSTIN IF REGISTERED]` | __________ |
| Terms | `[CITY]` | __________ |
| Terms | `[LATE FEE AMOUNT or PERCENTAGE]` | __________ |
| Terms | `[NUMBER, e.g., 5]` (care plan hours) | __________ |
| Terms | `[MONTHLY RATE, e.g., $99–$299/month]` | __________ |
| Licence | `[CITY]` | __________ |

Print this table, fill it in, and keep it with your lawyer's review notes.

---

**Generated:** 16 September 2026  
**Studio:** Late Apex  
**Contact:** hello@lateapex.studio

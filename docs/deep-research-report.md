# Password Manager Security Landscape as of February 2026

## Research scope and key terms

As of **2026-02-14 (America/Los_Angeles)**, this report summarizes **verifiable, source-checkable facts** about password management security across three categories: **offline/local managers**, **cloud-based dedicated managers**, and **browser-built-in managers**. Claims are tied to the date of the underlying source (or, where a vendor/support page does not publish a date, the **retrieval date 2026-02-14** is used). citeturn17view0turn18view0turn16view0

As of **2025-08-26**, **entity["organization","National Institute of Standards and Technology","us standards agency"]**’s Digital Identity Guidelines (SP 800-63B) explicitly base usability/security requirements on supporting password managers: “**Verifiers SHALL allow the use of password managers and autofill functionality**” and “SHOULD permit” paste to facilitate manager use. citeturn16view0

In this report, “**zero-knowledge**” / “**end-to-end encryption (E2EE)**” is treated as a **cryptographic architecture claim** about who can decrypt vault contents (typically: *only the user/device(s) with user-held secrets*), not as a blanket guarantee against breaches, malware, phishing, or account takeover. This framing aligns with how **entity["organization","Electronic Frontier Foundation","digital rights nonprofit"]** explains password managers’ “single point of failure” and emphasizes checking whether vault backups are truly E2EE. (Last reviewed **2025-03-06**.) citeturn17view0

## Offline and local password managers

### Encryption and key-handling characteristics

The defining trait of local/offline managers is that the **vault/database file can be stored and moved independently of any vendor account system**; compromise scenarios typically center on (a) theft of the encrypted database file plus offline cracking attempts, or (b) compromise of the device while unlocked (malware, memory access, keylogging). (Last reviewed **2025-03-06**.) citeturn17view0

| Local/offline manager | As-of date | Encryption model (database) | Key derivation / master key inputs | Where keys live | Practical “attack surface” (what must fail for passwords to leak) | Evidence |
|---|---:|---|---|---|---|---|
| KeePass | Retrieved **2026-02-14** | For KeePass 2.x, database encryption supports **AES-256** and **ChaCha20-256**; integrity via **HMAC-SHA-256** (Encrypt-then-MAC). Uses CBC for block ciphers. | Master key components can include master password + key file + Windows user account key and/or plugin-provided key; SHA-256 composes to 256-bit key, then a KDF is applied. Supports **AES-KDF** and **Argon2 (Argon2d/Argon2id)** in 2.x. | Database key derived on the client; optional reliance on Windows DPAPI for in-memory protection (platform-specific). | Leakage generally requires: (1) database file + successful cracking/guessing of master secret(s), **or** (2) full compromise of the endpoint (malware, memory access, keylogging) at the right time. | KeePass security documentation (retrieved 2026-02-14). citeturn25view0 |
| KeePassXC | **2025-10-28** (ANSSI CSPN evaluation report) | Default database cipher **AES-256-CBC**; **TwoFish-256** and **ChaCha20** selectable. Report also notes ChaCha20 use for some protected fields. Database stored in **KDBX4** format in evaluated version. | User can use a password and/or key file; report describes key file structure and handling. | Report states key file is randomly generated; **key file stores the key in plaintext inside the keyfile** (file protection is the user’s responsibility). | Leakage generally requires: (1) database file + master password/key file compromise/cracking, **or** (2) endpoint compromise while unlocked. The evaluation tested memory hygiene: it found the master password was not present in memory dumps after normal entry, but **was found** after copy/paste into the password field in the tested scenario. | Synacktiv “ANSSI – CSPN Technical Evaluation Report” for KeePassXC, dated 2025-10-28. citeturn30view0turn31view0turn30view2turn32view0 |

### Known incidents and audits

**KeePass (incidents).**  
As of **2023-01-21**, CVE-2023-24055 describes a scenario where an attacker with **write access to KeePass’s XML configuration file** can add an export trigger to obtain cleartext passwords; the NVD entry notes this is **disputed** by the vendor on the grounds that the database is not intended to withstand an attacker with that level of local access. citeturn41search3

As of **2025-01-23** (per NVD record history), CVE-2023-32784 affects KeePass 2.x before 2.54 and concerns recovering most of the master password from memory artifacts (process dump/swap/hibernation/RAM dump), with a mitigation described for 2.54. citeturn2search2

**KeePass (audits / reviews).**  
As of **2016-10** (EU-FOSSA Deliverable 2 summary), an EU-sponsored code review of **KeePass Password Safe v1.31** documented “Medium Risk Findings” and other findings in specific code areas; this is **historical** evidence for review activity, not a statement about current 2026 builds. citeturn38view0turn38view2 **Verify current status** for direct applicability to modern KeePass versions.

As of **2024-06-01**, KeePass release documentation says a code analysis of “KeePass 2.x” sponsored/performed by Germany’s **Federal Office for Information Security** and mgm security partners found **no medium/high/critical** vulnerabilities, with “two minor potential security vulnerabilities” and other improvements implemented in 2.57.1; this is a vendor-published summary of that effort. citeturn39view1turn39view0 **Verify current status** by consulting the underlying analysis report(s) referenced there.

**KeePassXC (audits / certifications, incidents).**  
As of **2025-10-28**, KeePassXC 2.7.9 was evaluated under **ANSSI CSPN** with a published technical evaluation report (Synacktiv). citeturn30view0turn31view0

As of **2024-05-20**, CVE-2024-33901 (NVD) describes a KeePassXC 2.7.7 issue where an attacker with the **privileges of the victim** could recover some passwords via a memory dump; the NVD record notes the vendor disputes it as unavoidable given memory-management constraints. citeturn33search3

### Portability and sync constraints

As of **2025-03-06**, EFF notes that most mainstream password managers sync via vendor cloud by default and that only a smaller set—explicitly naming KeePassXC—appears in the “more specialty” category that gives users more control over where (and if) a vault is stored online; it also warns that operating without syncing/online backups can hinder day-to-day multi-device use. citeturn17view0

As of **2025-09-12** (page metadata shown), Privacy Guides similarly frames local-storage password managers as managing an encrypted database locally and flags portability issues such as CSV export/import lossiness in some ecosystems (example: KeePassXC CSV export caveat). citeturn18view0

### Who recommends local/offline approaches and why

As of **2025-03-06**, EFF discusses password managers in terms of (a) single point of failure and (b) choosing an implementation with E2EE for cloud backups if syncing is used, while explicitly noting KeePassXC as an example of a manager that can give more control over storage location (not presented as a recommendation list). citeturn17view0

As of **2025-09-12**, Privacy Guides lists KeePassXC under “Local Storage” recommendations and explains the general rationale: local encrypted database control and cross-platform availability. citeturn18view0

As of **2025-08-26**, NIST SP 800-63B does not endorse specific products, but it **normatively requires** verifier systems to support password manager use (autofill/paste), which indirectly supports the viability of password managers (including offline ones) as part of modern authentication UX. citeturn16view0

## Cloud-based dedicated password managers

### Encryption models and “zero-knowledge” claims

Cloud-based dedicated managers typically store an encrypted vault on a provider’s servers to enable multi-device sync. The key distinction between vendors is **how encryption keys are derived, what secrets are required, and whether provider-held data alone can be used to validate password guesses** (a core risk in server-side breaches). (EFF last reviewed **2025-03-06**.) citeturn17view0

| Dedicated cloud manager | As-of date | “Zero-knowledge” / E2EE architecture (what’s publicly documented) | Notable cryptographic details (as documented) | Open-source vs proprietary | Audits / external reviews in sources | Evidence |
|---|---:|---|---|---|---|---|
| Bitwarden | Retrieved **2026-02-14** | Documents client-side key generation and local encryption; the vendor describes this as end-to-end encryption. | States “AES-CBC 256 bit encryption with HMAC authentication” and KDF options “PBKDF2 SHA-256 or Argon2id”; keys generated/managed by clients and encryption is local. | Server-side code described as open source by Privacy Guides; self-hosting discussed there. | Privacy Guides lists it as a recommended cloud-based manager; Bitwarden publishes audit/compliance materials (details vary by time). | Bitwarden security whitepaper and encryption docs (retrieved 2026-02-14); Privacy Guides page (2025-09-12). citeturn21search2turn21search6turn18view0turn4search2 |
| 1Password | **2026-02-14** (white paper retrieved) and **2025-11-11** (support doc) | Uses a two-secret design combining a user password and a high-entropy “Secret Key,” aiming to prevent server-held data from being sufficient for password-guessing verification. | White paper section states vault items are encrypted with AES using 256-bit keys and uses **Galois/Counter Mode (GCM)**; shows PBKDF2-HMAC-SHA256 iterations (example shown on the cited page). Support docs emphasize Secret Key + account password. | Privacy Guides: closed source; “security… documented” via white paper; audited “on a regular basis” per that page. | Privacy Guides links to audits; EFF references 1Password’s Secret Key as an example of “novel forms of security” to research. | 1Password support security model (2025-11-11); 1Password white paper page (retrieved 2026-02-14); Privacy Guides (2025-09-12); EFF (2025-03-06). citeturn21search1turn47view0turn18view0turn17view0 |
| Proton Pass | **2026-02-14** (retrieved) and **2023-07-19 / 2023-07-17** (audit materials) | Publicly describes end-to-end encryption where the provider cannot read vault contents. | States vault key is 32-byte random; data encrypted with **256-bit AES-GCM**. Describes item-key-per-item design where item keys are encrypted with a vault key. | Publicly positioned as open source and audited. | Proton states Cure53 audited mobile apps, browser extensions, and API in May–June 2023 and published report. Privacy Guides also notes Cure53 audit (May–June 2023) and that issues were fixed after the report. | Proton security page and security model blog; Proton open-source/audit blog; Cure53 report (May 2023 engagement; published 2023-07-17); Privacy Guides (2025-09-12). citeturn48search2turn48search5turn48search6turn48search3turn18view0 |
| LastPass | **2025-11-20** (UK ICO penalty notice) | UK ICO describes “local-only encryption” where the provider “never has access to the unencrypted data” and cannot decrypt vault contents without the master password; vault contents decrypt locally. | UK ICO describes AES-256-CBC with key derived from master password; at time of 2022 incidents default PBKDF2-SHA256 rounds were 100,100 (customizable), and notes a current default PBKDF2 iteration count of 600,000 (per referenced materials). | Proprietary (not open source in mainstream documentation). | Major security incident disclosures (2022–2023) and regulator action (2025) are documented. | UK ICO penalty notice (2025-11-20). citeturn24view0turn23view2turn23view1 |

### Known breaches and incidents (with dates), focusing on LastPass

#### LastPass breach timeline and subsequent developments

The following timeline is compiled from **LastPass public incident notices** and the **UK ICO penalty notice** (dated **2025-11-20**) summarizing reported events.

| Date (as stated by sources) | What was disclosed | Why it mattered for password safety | Evidence |
|---:|---|---|---|
| **2022-08-25** | LastPass said it detected an incident; later communications noted unauthorized access to “portions of source code and some proprietary technical information.” | Source code / internal technical info can increase the effectiveness of later attacks if combined with other access (e.g., targeting backups, credential stuffing, social engineering). | LastPass notice (2022-08-25) and ICO summary of that statement (penalty notice). citeturn1search0turn23view1 |
| **2022-11-30** | LastPass stated an unauthorized party used information from the August incident to access “certain elements” of customer information; emphasized passwords remained encrypted. | Indicates incident chaining: earlier compromise enabled later access. | LastPass update (2022-11-30) and ICO recounting. citeturn1search1turn23view2 |
| **2022-12-22** | LastPass stated the threat actor copied a backup containing customer account info (names, addresses, email, phone, IPs) and also copied a backup of customer vault data, including **unencrypted website URLs** and **encrypted fields** (usernames/passwords/secure notes). | Even if password fields remain encrypted, unencrypted URLs can aid targeted phishing and prioritizing high-value accounts; encrypted vault data enables offline cracking attempts if master passwords are weak or KDF parameters are low/old. | LastPass notice (2022-12-22) and ICO quotation/summary of what was copied. citeturn2search4turn23view2 |
| **2023-03-01** | LastPass published a “recommended actions” update and detailed categories of affected data; reiterated brute-force risk against stolen vault copies and phishing/credential stuffing risks. | Clarifies threat model: attacker may attempt offline brute-force and social engineering using metadata. | LastPass update (2023-03-01) and ICO summary referencing it. citeturn2search3turn22view0 |
| **2025-11-20** | UK ICO issued a penalty notice describing security shortcomings and reiterating technical details (AES-256-CBC + PBKDF2 defaults at time of incidents; sensitive fields encrypted; URLs unencrypted). | Regulator documentation provides third-party confirmation of technical architecture and breach impact framing. | UK ICO penalty notice (2025-11-20). citeturn24view0turn23view2 |
| **2026-02-13** (verify current status) | Multiple outlets reported a U.S. class action settlement received preliminary approval (reported amount: $24.5M) related to the 2022 incidents. | Legal outcomes don’t directly change cryptography, but they are relevant for “incident aftermath” timelines and user-facing disclosures. | BleepingComputer (2026-02-13) and Bloomberg Law (2026-02-13). citeturn3search6turn3search7 |

**Interpretation constraint (factual):** The ICO document specifically records that the stolen backup contained both **unencrypted website URLs** and **encrypted sensitive fields** and that brute-force attempts against the stolen vault copy were a considered risk. citeturn23view2turn22view0

### Open-source vs proprietary and audit visibility

As of **2025-09-12**, Privacy Guides’ password manager criteria require (among other items) “a **published audit** from a reputable, independent third party” and lists multiple cloud password managers under that rubric, including Bitwarden, Proton Pass, and 1Password (noting 1Password is closed source but documented). citeturn18view0

As of **2023-07-19**, Proton states it selected **entity["organization","Cure53","security research firm"]** to audit Proton Pass across mobile apps, browser extensions, and API during May–June 2023 and published the report. citeturn48search6turn48search3

As of **2025-03-06**, EFF describes third-party audits as “snapshots” and suggests audits and bug bounty programs as signals of security investment, explicitly listing Bitwarden, 1Password, and KeePassXC as examples of password managers that participate in audits. citeturn17view0

### What PrivacyTools.io currently recommends (and how that compares)

As of **2026-02-14**, the current **entity["organization","PrivacyTools.io","privacy tools website"]** “Password Manager” page presents **NordPass** as “We recommend” and acknowledges some entries as closed source; the same page also lists Bitwarden as a choice and labels it “Audited.” citeturn20view0turn19view0

As of **2025-09-12**, **entity["organization","Privacy Guides","privacy education nonprofit"]** recommends a different set (Bitwarden, Proton Pass, 1Password, Psono; plus local-storage options) under explicit objective criteria including published audits and documented E2EE. citeturn18view0

**Verify current status:** Recommendation lists are **highly changeable**, and “privacytools.io” vs “privacyguides.org” represent **different sites with different curation policies** as of the cited dates. citeturn19view0turn18view0

## Browser-built-in password managers

### Chrome / Google Password Manager

**Standard model (Google holds the key).** As of **retrieval 2026-02-14**, Google’s documentation states that saved passwords are encrypted in transit and at rest, and that the **encryption key is stored in your Google Account**; Google “uses this key to access (decrypt) your passwords” when you access them on passwords.google.com, eligible devices, or via Chrome settings. citeturn9view0

**On-device encryption (user holds the key, per Google’s description).** As of **retrieval 2026-02-14**, Google states: “With on-device encryption, you… take the key with you instead,” and “only you have the key to unlock your data.” It also states: “Once on-device encryption is set up, it can’t be removed,” and adds: “Over time, this security measure will be set up for everyone.” citeturn9view0

**Default behavior (opt-in vs automatic).** As of **2025-03-06**, EFF states that Apple’s system is E2EE by default but Google’s is not, and that Google offers a way to enable a passphrase / on-device encryption which requires going into settings. citeturn17view0 As of **2025-09-12**, Privacy Guides similarly describes Google’s password manager as having **optional** E2EE, while stating Apple offers E2EE by default. citeturn18view0  
**Verify current status (important):** Google’s documentation indicates an intended migration “over time,” but the **precise rollout state and defaulting behavior can change by account/device/region**. citeturn9view0turn17view0

**If someone’s Google account is compromised, are passwords exposed? (fact + inference)**  
*Fact (as documented):* In the “standard” model, the key is stored in the Google Account and used to decrypt passwords for access via Google Password Manager interfaces. citeturn9view0  
*Inference:* If an attacker gains effective control of the Google Account and can satisfy any re-authentication steps, that architecture creates a plausible path to viewing/exporting stored passwords in the standard model. This is **not identical** to many dedicated “zero-knowledge” designs, where the provider asserts it cannot decrypt vault material even with server access alone. citeturn9view0turn17view0

### Firefox credential manager

**Local storage structure.** As of **2025-10-28**, Mozilla Support documents that Firefox stores saved passwords in two files in the user profile: `logins.json` (encrypted usernames/passwords) and `key4.db` (stores the encryption key). citeturn5search2

**Primary Password behavior (single point of failure on-device).** As of **2023-08-14** (Mozilla Support forum answer) and consistent with the Primary Password support article (2025-10-28), without a Primary Password, having access to both `logins.json` and `key4.db` is sufficient to decrypt stored logins by placing them in a Firefox profile; the Primary Password encrypts the key in `key4.db`. citeturn5search10turn5search2

**Encryption algorithms.** As of **2025-10-28**, Mozilla Support documents a local encryption upgrade from **3DES-CBC to AES-256-CBC** for saved logins, and states that Firefox Sync uses **end-to-end encryption with AES-256-GCM** (and that the local encryption upgrade did not affect Sync). citeturn5search7

**Firefox Sync E2EE claim.** As of **2025-09-18**, Mozilla Support states that Firefox Sync uses the account password to build an additional layer of encryption beyond TLS and that Mozilla “can’t even access your Firefox Sync data.” citeturn5search3 This aligns with Mozilla’s earlier technical explanation (2014-04-30) that if you forget the Sync password you cannot decrypt Sync data. citeturn5search11

**Mozilla vs Google privacy track record (verify current status).** This report does not make comparative judgments about organizational privacy “track record” beyond what is documented in the cited security/storage materials. **Not verified**: any broader comparative assessment would require separate, privacy-policy and telemetry research beyond the storage/encryption sources above. citeturn5search3turn9view0

### Safari / iCloud Keychain

**Apple’s E2EE claim for passwords.** As of **2022-12-07**, Apple stated that iCloud “already protects 14 sensitive data categories using end-to-end encryption by default, including passwords in iCloud Keychain.” citeturn6search11

**What’s always E2EE vs optional (Advanced Data Protection context).** As of **2026-01-05**, Apple’s iCloud Data Security Overview distinguishes “standard” vs “Advanced Data Protection” and states that some categories (e.g., “Messages in iCloud”) are always end-to-end encrypted; this page is Apple’s authoritative, maintained list of iCloud data categories and their protection modes. citeturn6search1

**Key escrow architecture (how recovery is constrained).** As of **2024-05-07**, Apple’s “Escrow security for iCloud Keychain” documentation describes an escrow infrastructure using clusters of **hardware security modules (HSMs)** that guard escrow records, intended to ensure only authorized users/devices can perform recovery operations. citeturn7search4

**Single point of failure framing (account compromise).** *Fact:* iCloud Keychain is designed so that Apple’s servers are not the decryption party for the E2EE data classes described above. citeturn6search11turn7search4  
*Inference:* The practical exposure in an account takeover scenario depends on whether an attacker can add a trusted device / satisfy recovery flows (which are outside the cryptography of the vault itself). This is **verify current status** because Apple’s recovery UX, trusted-device rules, and region-specific policy can evolve. citeturn7search4turn6search1

### Edge

**Local disk encryption.** As of **2024-07-18**, Microsoft documentation states that Microsoft Edge “stores passwords encrypted on disk,” using AES, and that “the encryption key is saved in an operating system (OS) storage area,” describing this as “local data encryption.” citeturn6search2

**Sync/account integration (single point of failure).** As of **2025-12-31**, Microsoft’s Edge privacy documentation describes sending an account identifier along with “hashed and encrypted credentials” to the Microsoft Password Manager service in the context of Edge. citeturn6search16

**Does Edge use Chrome’s password manager infrastructure?** As of **2024-07-18** and **2025-12-31** Microsoft documentation, Edge has its own password storage and sync descriptions tied to Microsoft services and OS storage, not Google Password Manager documentation. citeturn6search2turn6search16

**End-to-end encryption status (verify current status).** As of **2025-09-12**, Privacy Guides states Edge’s built-in password manager “doesn’t offer end-to-end encryption at all.” citeturn18view0 **Verify current status**: Microsoft’s feature set and terminology around sync encryption can change, and Microsoft’s cited security page focuses on local encryption rather than an explicit user-held-key E2EE model. citeturn6search2turn18view0

## Cross-cutting security tradeoffs and industry guidance

### Factual tradeoffs between the three categories

As of **2025-03-06**, EFF explicitly frames password managers as creating a **single point of failure** while also being highly beneficial for unique/strong password use; this applies across categories, but the **failure modes differ** by architecture. citeturn17view0

The table below summarizes “what has to go wrong” for credential exposure, focusing on **common compromise paths**.

| Category | As-of date | Primary security benefit (architectural) | Typical single point(s) of failure | What a server-side breach can expose (if any) | What an endpoint compromise can expose | Evidence |
|---|---:|---|---|---|---|---|
| Offline/local | 2025-03-06 / 2026-02-14 | Vault can stay outside vendor accounts; you control where the encrypted database lives. | Master password (+ optionally a key file) and the security of devices that open the vault. | No central vendor vault to steal (unless you put the file in third-party cloud storage). | High if malware can capture keystrokes, read memory, or access unlocked vault/UI; some CVEs concern memory/config tampering with local access. | EFF; KeePass docs; NVD entries. citeturn17view0turn25view0turn41search3turn2search2 |
| Cloud-based dedicated | 2025-09-12 / 2025-11-20 | Cross-device sync with encrypted-at-source vaults; many vendors claim provider cannot decrypt vault contents. | Master password and account security; recovery flows; vendor client/app supply chain. | Depends on architecture: (a) encrypted vault blobs potentially usable for offline guessing if attacker steals them; (b) metadata may be exposed; incident history matters (e.g., LastPass 2022). | High if endpoint compromised while unlocked; extension/UI attacks can matter for browser-integrated clients. | Privacy Guides criteria; LastPass ICO summary; vendor cryptography docs. citeturn18view0turn23view2turn24view0turn21search2 |
| Browser-built-in | 2025-10-28 / 2026-02-14 | Deep OS/browser integration; low friction adoption; can reduce password reuse for many users. | The platform account (Google/Apple/Mozilla/Microsoft) + local device security + recovery mechanisms. | Often tied to platform account systems; encryption may be “at rest” with provider-managed keys, or optional E2EE (varies). | High if browser profile or OS account is compromised; local files (e.g., Firefox profile) can be sufficient without added local master password. | Google on-device encryption doc; Mozilla storage docs; Apple iCloud security docs; Edge docs. citeturn9view0turn5search2turn6search11turn6search2 |

### Industry consensus signals: browser vs dedicated

As of **2025-08-26**, NIST SP 800-63B is explicit that services should support password manager usability (autofill/paste), but it does **not** draw a line between browser vs dedicated managers; the guidance is about enabling password managers generally. citeturn16view0

As of **2025-03-06**, EFF acknowledges browser/OS built-in managers as sometimes easier to adopt due to integration, but flags that default security differs and offers concrete distinctions: Apple’s encrypted password system E2EE by default, Google’s not by default (manual configuration needed), and Mozilla provides encryption details; it also highlights that browser extensions are a common place for password manager vulnerabilities, which is relevant for dedicated managers implemented as extensions. citeturn17view0

As of **2025-09-12**, Privacy Guides states built-in password managers are “sometimes not as good as dedicated” and provides specific examples: Edge lacking E2EE (as they define it), Google having optional E2EE, Apple offering E2EE by default. citeturn18view0

**Consumer Reports (requested): Not verified.** As of **2026-02-14**, Consumer Reports pages relevant to password managers were not accessible to this research environment (HTTP 403), so specific CR claims cannot be quoted or validated here. **Verify current status directly in Consumer Reports** if you require that source in-app. citeturn12view0turn13view0

### A concrete, cross-category risk: browser-extension UI attacks (clickjacking)

As of **2025-10-17**, entity["organization","CERT/CC","vulnerability coordination team"]** published a vulnerability note stating that browser-extension password managers can be exposed to clickjacking attacks exploiting the trust relationship between web pages and extension-injected UI, and that DOM-level manipulation can bypass standard clickjacking defenses. citeturn48search8

As of **2025-08** (post-disclosure reporting window), researcher **Marek Tóth** documented “DOM-based extension clickjacking” and stated vulnerabilities were reported in **April 2025** with planned public disclosure in **August 2025**; vendor patch status was mixed in the reporting period. citeturn48search0  
As of **2025-11-12**, Proton stated that multiple password managers were found vulnerable to Tóth’s technique, while arguing Proton Pass had mitigations; this is vendor commentary and should be read alongside neutral coordination notes like CERT/CC. citeturn48search11turn48search8

## Decision factors for non-technical users and common misconceptions

### Decision factors framed as “what to know,” not “what to do”

As of **2025-03-06**, EFF emphasizes that adopting any password manager concentrates risk into a single vault, so the meaningful decision factors are about **how that vault can be compromised and how you recover it**. citeturn17view0

A non-technical user evaluating options typically needs to understand these factual dimensions (each maps to a different failure mode shown earlier):

- **Recovery and lockout risk (especially for E2EE/on-device encryption):** As of **2026-02-14** (retrieval), Google’s on-device encryption documentation explicitly warns that losing the “key” can mean losing access to passwords, and describes recovery-dependent flows. citeturn9view0
- **Account takeover blast radius:** As of **2026-02-14** (retrieval), Google documents a standard mode where account-held keys decrypt passwords for access via Google Password Manager surfaces. citeturn9view0 As of **2024-07-18**, Microsoft documents Edge tying password protection to OS key storage and (by other docs) to Microsoft account services for sync. citeturn6search2turn6search16
- **Endpoint compromise vs server compromise:** As of **2025-11-20**, the UK ICO’s LastPass penalty notice provides a concrete example where encrypted vault backups were stolen, making offline brute-force and targeted phishing relevant even without plaintext vault disclosure. citeturn23view2turn22view0
- **Extension/UI attack exposure:** As of **2025-10-17**, CERT/CC treats clickjacking against extension-injected UI as a real class of risk affecting browser-extension password managers. citeturn48search8
- **Portability and ecosystem lock-in:** As of **2025-03-06**, EFF notes browser-based managers often work best within their platform ecosystems (Chrome/Android/ChromeOS; Safari/iOS/macOS), while some offerings (like Firefox’s) are less integrable elsewhere. citeturn17view0

### Common misconceptions to avoid repeating

- **Misconception: “If it’s encrypted, an account takeover can’t expose anything.”**  
  *Counter-fact:* Some systems use encryption keys tied to the account/provider-managed key stores in standard modes (Google explicitly documents account-held keys in its standard mode). citeturn9view0

- **Misconception: “Zero-knowledge means breaches don’t matter.”**  
  *Counter-fact:* The LastPass 2022 incident is a documented case where encrypted vault backups plus unencrypted URLs/metadata were stolen, creating offline brute-force and phishing/targeting risk even when password fields were encrypted. citeturn23view2turn22view0

- **Misconception: “Browser password managers store passwords in plain text on disk.”**  
  *Counter-fact:* Firefox documents encrypted storage (`logins.json`) and key handling (`key4.db`), with stronger protection when a Primary Password is set. citeturn5search2turn5search10 Microsoft documents Edge encrypting passwords on disk with AES and storing the key in OS-secured storage. citeturn6search2

- **Misconception: “Local/offline managers are immune to device compromise.”**  
  *Counter-fact:* Both KeePass and KeePassXC ecosystems have documented issues where local attacker capability (memory dumps, config tampering) can extract secrets, emphasizing that offline encryption primarily protects data at rest, not against a compromised endpoint. citeturn41search3turn2search2turn32view0

- **Misconception: “Built-in managers are always worse than dedicated managers.”**  
  *Counter-fact:* EFF and Privacy Guides both acknowledge built-in managers can be easier to adopt due to integration and can provide meaningful baseline security; the key factual point is that **default security and E2EE availability differ by platform** (Apple E2EE by default for keychain passwords; Google optional on-device encryption; Edge disputed as lacking E2EE in some third-party evaluations). citeturn17view0turn18view0turn6search11turn9view0
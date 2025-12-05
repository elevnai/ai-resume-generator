
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeRequest } from '../types';

const mainSystemInstruction = `
You are a "Believability-First Resume Engine" for one specific candidate: Nick.

CANDIDATE FACTS (truth only):
- Certification: CompTIA Security+ (current).
- Roles:
  1) Citadel Drilling — Motorhand / Field Operations Lead
     - Worked on a land-based drilling rig in the Permian Basin (Odessa / Midland area).
     - Supported daily rig operations focused on the mechanical side: engines, pumps, generators, and mud systems.
     - Performed routine checks on oil levels, coolant, pressures, temperatures, and gauges; reported abnormal readings fast.
     - Assisted mechanic/derrickhand with basic repairs such as hose and belt changes, filter swaps, tightening fittings, and fixing minor leaks.
     - Monitored for leaks, unusual noises, or vibrations and escalated to the driller or pusher when something looked off.
     - Helped with rig-up and rig-down, including connecting/disconnecting lines, hoses, and cables under supervision.
     - Kept pump room and work areas clean and organized to reduce slip, trip, and equipment hazards.
     - Participated in daily safety meetings and JSAs; followed company and operator safety policies on every task.
     - Used lockout/tagout and other energy-control steps when equipment needed to be worked on.
     - Communicated with driller, derrickhand, and floorhands using radios and hand signals during equipment moves and lifts.
     - Logged readings, simple maintenance tasks, and issues in paper or digital forms as required by company procedures.
     - Worked rotating 12-hour shifts (days/nights) in harsh weather while staying alert around high-risk equipment.
     - Supported newer hands by showing them basic tasks, safe tool use, and how to recognize unsafe conditions.
  2) DuPure — Water Treatment Installer / Service
     - Installed residential water softeners, reverse osmosis (RO) systems, and whole-home filtration units.
     - Worked with PVC and related fittings: measuring runs, cutting pipe, gluing, and pressure-testing for leaks.
     - Reviewed install diagrams and followed manufacturer instructions for bypass valves, drain lines, and electrical needs.
     - Performed pre-install walkthroughs with homeowners to explain the plan and confirm equipment locations.
     - Used drills, hole saws, and other power tools to mount tanks, brackets, and RO faucets cleanly and safely.
     - Tied into existing plumbing with minimal cutting, patching, or disruption to the home.
     - Performed start-up and system checks: set hardness levels, programmed regeneration cycles, and verified flow.
     - Tested water quality before and after install (e.g., hardness / TDS) and explained the difference in simple terms.
     - Documented each job with notes and photos (equipment, serial numbers, install layout) for warranty and service history.
     - Used a tablet/phone app or CRM for job dispatch, navigation, status updates, and closing work orders.
     - Communicated parts issues or add-on work to the office so follow-up visits could be scheduled correctly.
     - Handled basic troubleshooting on service calls: leaks, low pressure, noisy units, or systems not regenerating.
     - Educated customers on ongoing maintenance: how to check salt, when to change filters, and when to call for service.
     - Protected work areas with drop cloths and cleaned up after installs so the home was left in good condition.
     - Managed multiple installs or service calls per day while staying on time and maintaining quality.
  3) Houston Water Solutions — Head Installer / Technician & Project Lead
     - Installed whole-home water softeners, reverse osmosis (RO) systems, and filtration units in residential homes.
     - Worked heavily with PVC, copper, and PEX fittings; cut, glued, and pressure-tested lines for leaks.
     - Read install diagrams and followed manufacturer specs for bypass valves, drain lines, and electrical requirements.
     - Performed in-home water tests (e.g., hardness, TDS) and explained results to customers in plain language.
     - Planned installation layout to minimize wall/ceiling damage and keep equipment accessible for future service.
     - Used power tools (drills, hammer drills, hole saws) to mount tanks, brackets, and RO faucets.
     - Protected customers’ homes with drop cloths and cleanup so work areas were left cleaner than before.
     - Diagnosed issues like low pressure, unusual tastes/odors, and leaks, then replaced media, filters, or fittings as needed.
     - Took before/after readings to prove system performance and documented settings (time, regen cycles, hardness).
     - Used a tablet/phone-based CRM or scheduling app to receive jobs, update status, log notes, and close work orders.
     - Uploaded job photos (before/after, serial numbers, install locations) for warranty and future service history.
     - Coordinated with the office on arrival windows, parts availability, and follow-up visits when extra work was needed.
     - Frequently acted as lead tech on installs, assigning tasks to helpers and verifying their work.
     - Handled frustrated or skeptical customers by walking them through the install plan and answering questions calmly.
     - Educated homeowners on basic maintenance: salt levels, filter changes, RO tank recharge, and when to call for service.
     - Balanced multiple jobs per day while still hitting promised time windows and quality standards.

JOB MATCHING & TAILORING RULES:

1) READ THE JOB DESCRIPTION FIRST
- Carefully read the job description the user provides.
- Extract:
  - Target job title
  - Top 8–12 required skills/tools/technologies
  - Main responsibilities and outcomes
- Mirror the employer’s language and keywords when it is accurate for the user.

2) PRIORITIZE RELEVANT EXPERIENCE BASED ON ROLE TYPE

A. IF THE JOB IS IT / CYBER / TECH-LEANING
(Examples: "Information Security Analyst", "Security Engineer", "GRC Analyst", "IT Support", "Help Desk", "Systems Admin", etc.)

- 60–75% of bullets should come from:
  - IT/Cyber lab experience
  - Security+/NIST/RMF knowledge
  - Scripting, automation, troubleshooting, documentation, process mindset
- 25–40% of bullets should be:
  - Transferable skills from Citadel / DuPure / Houston Water Solutions that clearly support IT/security work (documentation, incident response mindset, safety, procedures, customer communication, working tickets/jobs, scheduling tools, etc.)
- Do NOT spend more than 1–2 bullets on purely mechanical or plumbing details in a tech/cyber resume.
- Always connect non-tech work back to tech-relevant themes (e.g., “incident-style response”, “logged work in digital systems”, “followed strict procedures and documentation standards”).

B. IF THE JOB IS FIELD / MECHANICAL / INSTALLATION / MAINTENANCE
(Examples: "Field Service Technician", "Maintenance Tech", "Installer", etc.)

- 60–75% of bullets should come from:
  - DuPure and Houston Water Solutions (installs, troubleshooting, customer homes, documentation, CRM/scheduling).
  - Citadel Motorhand (mechanical systems, safety, harsh environments, long shifts).
- 25–40% can reference:
  - IT/tech comfort as a bonus (using tablets/CRMs, basic scripting, lab work) but not as the main focus.
- Emphasize tools, equipment, safety, troubleshooting, and customer communication.

3) HOW TO BUILD BULLELETS

- Always start from the facts above AND the job description.
- Choose 6–10 of the MOST relevant facts; you do NOT need to use everything.
- Rewrite bullets in fresh language that:
  - Uses verbs aligned with the job (e.g., "monitored, analyzed, implemented, supported, documented, escalated, troubleshot").
  - Connects my past work directly to what this employer is asking for.
- For each bullet, ask: “How does this help me do THIS job?” If it doesn’t, either rewrite it or drop it.

4) TARGETED SUMMARY & SKILLS SECTION

- Professional Summary:
  - Always include the target role title in the first line (e.g., "Aspiring Information Security Analyst..." or "Field Service Technician with experience in...").
  - Mention 3–5 skills that match the job description AND are supported by my real experience/labs.

- Skills / Tools:
  - Prioritize listing tools and skills mentioned in the job description that I truly have experience with (professional OR lab).
  - Group them logically (Security & IT, Field Operations, Customer & Communication, etc.).

5) HONESTY & STRENGTH

- Do NOT invent employers, job titles, tools, or certifications I have not actually used or earned.
- It is okay to:
  - Combine several small tasks into stronger, more general bullets.
  - Use qualitative phrases like "multiple installs per week" or "high-volume schedule" when it reflects reality.
- Always lean toward strong but truthful wording instead of exaggeration.

LAB / STUDY-LEVEL ONLY (not production):
- Nessus vulnerability scans (lab).
- SIEM/XDR workflows (Splunk, Sentinel, Sumo Logic, CrowdStrike) – study-level.
- RMF and NIST 800-37/53/60, FIPS 199/200 – study/lab level.
- Windows/macOS hardening – study level.
- Basic PowerShell/Python scripting – intro level.

BELIEVABILITY RULES:
- Do not invent tools, employers or responsibilities.
- Do not claim any clearance or federal/classified work.
- Do not claim production SIEM/EDR/RMF admin; keep those as lab/study-level only.
- Clearly label labs as "(lab)" and study-only as "(study-level)".
- It IS okay to:
  - Combine several small tasks into one strong bullet (e.g., multiple small repairs -> "diagnosed and resolved residential water quality issues").
  - Infer reasonable soft skills from the facts (customer service, time management, documentation, safety focus).
  - Use approximate or qualitative phrases that are still truthful, such as "multiple installs per week", "dozens of customers", "high-volume schedule", if they match the user's real experience level.
- Always keep bullets aggressive but honest. When in doubt, stay conservative instead of exaggerating

ROLE DIAL BEHAVIOR:
- Use the ROLE_DIAL_VALUE (where 0 is deeply technical/hands-on and 100 is strategic/leadership) to emphasize different facets of the candidate's experience.
- Low values (0-40) should prioritize bullets about direct implementation, diagnostics, hands-on tool use (even in labs), and specific procedural tasks.
- Mid values (40-60) should balance technical skills with coordination, documentation, and small-team mentoring.
- High values (60-100) should prioritize bullets about project lifecycle management, KPI tracking, scheduling, stakeholder communication, and training others.

FORMAT RULES FOR EVERY RESPONSE:
- Produce a complete resume in this exact section order:
  1) Summary (3–4 lines; include target job title, 3–5 JD keywords, and one clear outcome. If a company name is provided, subtly weave it into the summary, e.g., "...eager to contribute to [Company Name]'s security posture.").
  2) Core Skills (12–18 items, comma-separated; mostly Tier 1–2 JD signals; mark labs/study).
  3) Professional Experience:
     - Citadel Drilling — 6 bullets.
     - DuPure — 6 bullets.
     - Houston Water Solutions — 6 bullets.
     Each bullet = Verb + Scope + Tool/Method + Outcome.
  4) Security/Projects (only if relevant; clearly mark lab/study-level and reference artifacts).
  5) Certifications (always include Security+).
  6) Tools & Platforms (list tools relevant to the job description from the candidate background; lab/study labeled).
- ALL specified sections MUST be included in the output. Never omit a section.
- For the "Tools & Platforms" section, analyze the job description to understand the required tool categories (e.g., diagnostic, monitoring, project management, CRM). Based on the candidate's factual roles (gauges at Citadel, CRM at DuPure, Excel for KPIs), list specific or categorical tools that are believable and relevant. Generalize from facts, e.g., "CRM/Ticketing Systems" from DuPure or "Operational Dashboards" from Citadel. Include technical and non-technical tools if the job implies a need. REMAIN BELIEVABLE.
- **IMPORTANT**: The output must be plain text ONLY. Do not use any Markdown formatting like asterisks or hashes.

GENERAL BEHAVIOR:
- Align verbs and nouns to Tier 1–2 signals from the job description when they are truthful.
- Keep language ATS-friendly, plain text, no Markdown.
- Never break the "6 bullets per role" rule.
You will receive a ROLE_DIAL_VALUE (0-100) and a DIAL_DESCRIPTION that explains the user's chosen focus. Use both to tailor the resume.
`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isQuotaError = (error: any): boolean => {
    const msg = (error.message || '') + (typeof error === 'object' ? JSON.stringify(error) : '');
    return msg.includes('429') || 
           msg.toLowerCase().includes('quota') || 
           msg.includes('RESOURCE_EXHAUSTED') ||
           error.status === 429 ||
           error.code === 429;
};

const isAuthError = (error: any): boolean => {
    const msg = (error.message || '') + (typeof error === 'object' ? JSON.stringify(error) : '');
    return msg.includes('401') || 
           msg.includes('403') || 
           msg.toLowerCase().includes('api key') || 
           msg.toLowerCase().includes('permission denied') ||
           error.status === 401 ||
           error.status === 403;
};

export async function* generateResumeStream(request: ResumeRequest, selectedDialDescription: string): AsyncGenerator<string> {
    if (!process.env.API_KEY) {
        throw new Error("Missing API Key configuration.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const { jobTitle, companyName, roleDial, jobDescription } = request;

    const userPrompt = `
JOB_TITLE: ${jobTitle}
COMPANY_NAME: ${companyName || 'Not Provided'}
ROLE_DIAL_VALUE: ${roleDial}  // 0 = technical, 100 = leadership
DIAL_DESCRIPTION: ${selectedDialDescription}
JOB_DESCRIPTION:
${jobDescription}
    `;

    const header = `Nicholas Richardson\nemail: nknick_r@yahoo.com phone: 832-640-9898 Lubbock, TX\n\n`;
    yield header;

    let attempt = 0;
    const maxAttempts = 5;

    while (attempt < maxAttempts) {
        try {
            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: [{ parts: [{ text: userPrompt }] }],
                config: {
                    systemInstruction: mainSystemInstruction,
                    temperature: 0.5,
                    topP: 0.95,
                    topK: 40,
                }
            });
            
            for await (const chunk of responseStream) {
                const text = chunk.text;
                if (text) {
                    yield text;
                }
            }
            // If successful, exit the function
            return;

        } catch (error: any) {
            if (isAuthError(error)) {
                console.error("Authentication error calling Gemini API:", error);
                throw new Error("Access Denied. Please check your API Key configuration.");
            }

            if (isQuotaError(error) && attempt < maxAttempts - 1) {
                attempt++;
                // Exponential backoff starting at 2000ms: 2000, 4000, 8000, 16000...
                const waitTime = 2000 * Math.pow(2, attempt - 1);
                console.warn(`Quota hit (429). Retrying in ${waitTime}ms... (Attempt ${attempt} of ${maxAttempts})`);
                await delay(waitTime);
                continue; // Retry the loop
            }

            console.error("Error calling Gemini API:", error);
            
            if (isQuotaError(error)) {
                throw new Error("Quota exceeded. The system is busy, please try again in a few moments.");
            }
            throw new Error("The AI model failed to generate a response. Please check your inputs or try again later.");
        }
    }
};

export const generateDialDescriptions = async (jobTitle: string, jobDescription: string): Promise<string[]> => {
    if (!process.env.API_KEY) {
        // Fail silently for dial descriptions if key is missing, UI will catch resume generation error
        console.warn("API Key missing during dial generation.");
        return Array(11).fill("Standard tailored focus for this role.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `You are an expert career coach. Analyze the provided job title and description. Your task is to generate exactly 11 one-sentence descriptions for a resume tailoring dial. The dial ranges from 0 (deeply technical, individual contributor) to 100 (strategic, leadership/management), in increments of 10. Each description must concisely explain the resume's focus for that dial setting, tailored specifically to the context of the job. Frame each sentence as a directive, e.g., "Focus on hands-on threat detection..." or "Emphasize project lifecycle management...".`;

    const userPrompt = `
JOB_TITLE: ${jobTitle}
JOB_DESCRIPTION:
${jobDescription}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction,
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                    },
                },
            },
        });

        const jsonText = response.text?.trim();

        if (!jsonText) {
           return Array(11).fill("Standard tailored focus for this role.");
        }

        const descriptions = JSON.parse(jsonText);

        if (Array.isArray(descriptions) && descriptions.length === 11 && descriptions.every(d => typeof d === 'string')) {
            return descriptions;
        } else {
            throw new Error("AI returned an invalid format for dial descriptions.");
        }
    } catch (error: any) {
        if (isAuthError(error)) {
             // Throw auth errors so the UI knows the key is invalid
             console.error("Authentication error in dial generation:", error);
             throw new Error("Invalid API Key or Permissions.");
        }
        
        // Gracefully handle quota errors without spamming the console
        if (isQuotaError(error)) {
             console.warn("Dial description generation skipped due to rate limit (using fallback).");
        } else {
             console.error("Error generating dial descriptions:", error);
        }
        return Array(11).fill("Standard tailored focus for this role.");
    }
};

/**
 * Sarthi Founder & Vision Configuration
 * Centralized data source for the Public Landing Page Founder/Vision section.
 * Easily updated without modifying UI component code.
 */

export const founderConfig = {
    name: "Balaji Aadi",
    title: "Founder & Creator",
    roleSubtitle: "Software Engineer & Systems Architect",
    workplace: "", // Can be specified (e.g. current organization)
    image: "", // Path to your photograph (e.g. "/founder.jpg" in public/ or external URL)
    avatarFallback: "BA",
    
    // Personal website and professional links
    personalWebsite: "", // Your real personal website URL, e.g. "https://balajiaadi.com"
    professionalLinks: {
        github: "",
        linkedin: "",
        twitter: ""
    },

    // The core philosophy connecting your journey to Sarthi
    story: {
        observation: "Traditional technical interview preparation is fundamentally fragmented. Engineers find themselves grinding hundreds of disconnected problems, memorizing patterns that fade within weeks, and feeling unprepared when faced with real-world low-level design and machine coding rounds.",
        conviction: "True engineering competence is not built on sporadic cramming—it is developed through systematic learning, deliberate practice in an authentic environment, active spaced recall, and focused execution.",
        whySarthi: "I built Sarthi to provide the structured workspace I wished existed: an engineering-grade environment that pairs curated pattern taxonomies and phased system design drills with an automated spaced repetition engine.",
        vision: "The long-term vision for Sarthi is to be the definitive workspace for technical mastery—where engineers don't just prepare for interviews, but develop the architectural intuition, clean coding rigor, and problem-solving confidence that lasts throughout their careers."
    },

    // Curated highlights (strictly genuine, no exaggerated claims)
    selectedHighlights: [
        {
            title: "Architect of Sarthi Platform",
            context: "Engineered the end-to-end curriculum roadmap, automated daily spaced repetition engine, and integrated Monaco execution workspace."
        },
        {
            title: "Pattern-First Philosophy",
            context: "Designed the algorithmic taxonomies and multi-level LLD drills prioritizing deep architectural understanding over rote memorization."
        }
    ]
};

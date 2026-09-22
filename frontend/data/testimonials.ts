export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

// Placeholder copy — replace with real learner/recruiter testimonials
// once available. Not wired into a component yet; drop <Testimonials />
// wherever it's useful (e.g. below the signup form on wide screens).
export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Verified assessments gave me proof of skills my resume couldn't.",
    name: "A. Student",
    role: "Final-year learner",
  },
  {
    quote:
      "We cut first-round interviews significantly using verified talent profiles.",
    name: "A. Recruiter",
    role: "Talent Acquisition",
  },
];

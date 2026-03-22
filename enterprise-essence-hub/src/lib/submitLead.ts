import { leads } from "@/integrations/api/client";

export type LeadSubmission = {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  interest?: string | null;
  message?: string | null;
  form_type: string;
  source_page?: string | null;
  honeypot?: string | null;
};

export async function submitLead(payload: LeadSubmission) {
  try {
    // Remove honeypot field before sending
    const { honeypot, ...leadData } = payload;
    
    const { data, error } = await leads.submit(leadData as any);
    
    if (error) {
      // Check for rate limiting
      const isRateLimited = error.includes('429') || error.includes('rate limit');
      const message = isRateLimited
        ? "Please wait a moment before submitting again."
        : undefined;
      return { data: null, error: new Error(error), message };
    }
    
    return { data, error: null };
  } catch (error: any) {
    const message = error?.message?.includes('rate') 
      ? "Please wait a moment before submitting again."
      : undefined;
    return { data: null, error, message };
  }
}

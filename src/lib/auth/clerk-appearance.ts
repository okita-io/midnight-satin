/** Midnight Satin — Tactile Noir Luxury Clerk appearance */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#D4AF37",
    colorBackground: "#121212",
    colorInputBackground: "#050505",
    colorInputText: "#F5F0E6",
    colorText: "#F5F0E6",
    colorTextSecondary: "#A89F91",
    colorDanger: "#800020",
    borderRadius: "0.125rem",
    fontFamily: "var(--font-ui), Georgia, serif",
    fontFamilyButtons: "var(--font-ui), Georgia, serif",
  },
  elements: {
    card: "bg-[#121212] border border-[#D4AF37]/20 shadow-none",
    headerTitle: "font-serif text-[#D4AF37]",
    headerSubtitle: "text-[#A89F91]",
    socialButtonsBlockButton:
      "border border-[#D4AF37]/30 bg-[#050505] text-[#F5F0E6] hover:bg-[#121212]",
    formButtonPrimary:
      "bg-[#D4AF37] text-[#050505] hover:bg-[#D4AF37]/90 font-semibold",
    footerActionLink: "text-[#D4AF37] hover:text-[#D4AF37]/80",
    identityPreviewEditButton: "text-[#D4AF37]",
    formFieldInput:
      "bg-[#050505] border-[#D4AF37]/20 text-[#F5F0E6] focus:border-[#D4AF37]",
    userButtonPopoverCard: "bg-[#121212] border border-[#D4AF37]/20",
  },
} as const;

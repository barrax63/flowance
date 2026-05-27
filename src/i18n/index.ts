import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/**
 * i18n bootstrap. Bundle DE + EN inline — small enough not to warrant async loading.
 */
const resources = {
  en: {
    translation: {
      app: {
        title: "Flowance",
        tagline: "Where your money flows.",
      },
      panel: {
        income: "Income",
        spendings: "Spendings",
        addIncome: "Add income",
        addCategory: "Add category",
        addExpense: "Add item",
        empty: "No entries yet. Add your first income to get started.",
        savingsNote: "Savings appear automatically when income exceeds spendings.",
      },
      fields: {
        name: "Name",
        amount: "Amount",
        category: "Group",
        categoryBadge: "CAT",
        delete: "Delete",
      },
      toolbar: {
        currency: "Currency",
        language: "Language",
        export: "Export SVG",
        reset: "Reset",
        period: "Period",
        monthly: "Monthly",
        yearly: "Yearly",
      },
      summary: {
        income: "Total income",
        spendings: "Total spendings",
        savings: "Savings",
        rate: "Savings rate",
      },
      warnings: {
        overspend:
          "Your spendings exceed your income by {{amount}}. Adjust amounts to balance the flow.",
        noIncome: "Add at least one income source to render the diagram.",
      },
      sankey: {
        budget: "Budget",
        savings: "Savings",
      },
      placeholder: {
        income: "e.g. Salary",
        category: "e.g. Housing",
        expense: "e.g. Rent",
      },
    },
  },
  de: {
    translation: {
      app: {
        title: "Flowance",
        tagline: "Wohin dein Geld fließt.",
      },
      panel: {
        income: "Einnahmen",
        spendings: "Ausgaben",
        addIncome: "Einnahme hinzufügen",
        addCategory: "Kategorie hinzufügen",
        addExpense: "Position hinzufügen",
        empty: "Noch keine Einträge. Beginne mit einer Einnahme.",
        savingsNote: "Sparen erscheint automatisch, wenn Einnahmen die Ausgaben übersteigen.",
      },
      fields: {
        name: "Name",
        amount: "Betrag",
        category: "Gruppe",
        categoryBadge: "KAT",
        delete: "Löschen",
      },
      toolbar: {
        currency: "Währung",
        language: "Sprache",
        export: "SVG exportieren",
        reset: "Zurücksetzen",
        period: "Zeitraum",
        monthly: "Monatlich",
        yearly: "Jährlich",
      },
      summary: {
        income: "Gesamteinnahmen",
        spendings: "Gesamtausgaben",
        savings: "Sparen",
        rate: "Sparquote",
      },
      warnings: {
        overspend:
          "Deine Ausgaben übersteigen die Einnahmen um {{amount}}. Bitte Beträge anpassen.",
        noIncome: "Füge mindestens eine Einnahmequelle hinzu, um das Diagramm zu erzeugen.",
      },
      sankey: {
        budget: "Budget",
        savings: "Sparen",
      },
      placeholder: {
        income: "z. B. Gehalt",
        category: "z. B. Wohnen",
        expense: "z. B. Miete",
      },
    },
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: (typeof localStorage !== "undefined" && localStorage.getItem("flowance.lng")) || "de",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;

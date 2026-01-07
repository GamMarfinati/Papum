
import { GoogleGenAI } from "@google/genai";
import { Expense } from "../types";

export const analyzeExpenses = async (expenses: Expense[]) => {
  if (expenses.length === 0) return "Adicione algumas despesas para receber uma análise inteligente sobre a economia da casa.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const categories = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.value;
    return acc;
  }, {} as Record<string, number>);

  const summary = Object.entries(categories)
    .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`)
    .join(", ");
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um consultor financeiro doméstico. Analise estes gastos mensais de uma casa dividida entre amigos: ${summary}. Dê uma dica curta (máximo 200 caracteres) em português brasileiro sobre como economizar ou gerenciar melhor esses tipos de gastos específicos.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "Continue gerenciando suas contas com sabedoria!";
  } catch (error) {
    console.error("Erro ao analisar despesas:", error);
    return "Mantenha o foco na organização financeira da casa!";
  }
};

// Utilitaire pour convertir le PDF en base64 pour Gemini
export const convertPDFToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Retirer le préfixe data:application/pdf;base64,
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Erreur lors de la conversion du fichier'));
    reader.readAsDataURL(file);
  });
};

export const validatePDFFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'Aucun fichier sélectionné' };
  }
  
  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'Le fichier doit être au format PDF' };
  }
  
  if (file.size > 10 * 1024 * 1024) { // Augmenté à 10MB pour Gemini
    return { isValid: false, error: 'Le fichier ne doit pas dépasser 10MB' };
  }
  
  return { isValid: true };
};
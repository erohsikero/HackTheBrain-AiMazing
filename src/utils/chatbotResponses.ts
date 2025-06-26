export const getChatbotResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();

  // Insurance questions
  if (message.includes('insurance') || message.includes('coverage')) {
    return "We cover CDCP and most insurances. However, we do not accept provincial insurance. Please check with a receptionist for your exact coverage details.";
  }

  // Cleaning cost questions
  if (message.includes('cleaning') && (message.includes('cost') || message.includes('price') || message.includes('how much'))) {
    return "A dental cleaning costs $235. This includes a comprehensive cleaning and examination by our dental hygienist.";
  }

  // Filling cost questions
  if ((message.includes('filling') || message.includes('cavities') || message.includes('cavity')) && 
      (message.includes('cost') || message.includes('price') || message.includes('how much'))) {
    return "Fillings for cavities cost between $300-$600, depending on the size and location of the cavity. Our dentist will provide a detailed estimate during your consultation.";
  }

  // Hours questions
  if (message.includes('hours') || message.includes('time') || message.includes('open') || message.includes('close')) {
    return "Our clinic hours are:\n\nMonday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 2:00 PM\nSunday: Closed\n\nWe also offer emergency appointments outside regular hours.";
  }

  // Location questions
  if (message.includes('location') || message.includes('address') || message.includes('where')) {
    return "Dental AI Clinic is conveniently located in the heart of the city. For our exact address and directions, please contact our front desk at your convenience.";
  }

  // Appointment booking
  if (message.includes('appointment') || message.includes('book') || message.includes('schedule')) {
    return "I'd be happy to help you schedule an appointment! You can:\n\n1. Use our online booking system by going back to the main menu\n2. Call our front desk during business hours\n3. Request a callback and we'll contact you\n\nWould you like me to direct you to our booking system?";
  }

  // Emergency questions
  if (message.includes('emergency') || message.includes('urgent') || message.includes('pain')) {
    return "For dental emergencies, please call our clinic immediately. If it's after hours, we have an emergency line available. Dental pain should not be ignored - please seek immediate care.";
  }

  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! I'm enamAI, your dental assistant. How can I help you today?";
  }

  // Thank you responses
  if (message.includes('thank') || message.includes('thanks')) {
    return "You're very welcome! I'm here to help. Is there anything else you'd like to know about Dental AI Clinic?";
  }

  // Services questions
  if (message.includes('services') || message.includes('treatment')) {
    return "We offer a wide range of dental services including:\n\n• Cleanings and exams\n• Fillings and restorations\n• Root canals\n• Extractions\n• Invisalign consultations\n• Denture consultations\n• Crown and bridge work\n• Emergency dental care\n\nWould you like more information about any specific service?";
  }

  // Default response
  return "I understand your question, but I might need more specific information to provide the best answer. Could you please rephrase or ask about:\n\n• Insurance coverage\n• Treatment costs\n• Clinic hours and location\n• Booking appointments\n• Our dental services\n\nOur front desk staff are also available to help with any detailed questions!";
};
export const gitaShlokas = [
  {
    chapter: 2,
    verse: 47,
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    english: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction.",
    category: "slacking",
    counsel: "Arjuna, do not grieve over outcomes or let procrastination freeze your mind. Focus entirely on the immediate task at hand; action is your only true domain."
  },
  {
    chapter: 3,
    verse: 8,
    sanskrit: "नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः।\nशरीरयात्रापि च ते न प्रसिद्ध्येदकर्मणः॥",
    english: "Perform your prescribed duty, for action is better than inaction. A man cannot even maintain his physical body without work.",
    category: "slacking",
    counsel: "Procrastination drains the spirit, while even the smallest action builds momentum. Shake off the lethargy and take the first step right now."
  },
  {
    chapter: 2,
    verse: 50,
    sanskrit: "बुद्धियुक्तो जहातीह उभे सुकृतदुष्कृते।\nतस्माद्योगाय युज्यस्व योगः कर्मसु कौशलम्॥",
    english: "A man engaged in pure devotional service rids himself of both good and bad actions even in this life. Therefore strive for yoga, which is the art of all work.",
    category: "steady",
    counsel: "Excellence is not an accident; it is the art of work done with deep focus. Continue your practice today with dedication and skill."
  },
  {
    chapter: 6,
    verse: 5,
    sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
    english: "One must deliver himself with the help of his mind, and not degrade himself. The mind is the friend of the conditioned soul, and his enemy as well.",
    category: "steady",
    counsel: "You are your own ultimate ally. Keep your mind disciplined, and it will guide you to your destination with unwavering clarity."
  },
  {
    chapter: 6,
    verse: 6,
    sanskrit: "बन्धुरात्मात्मनस्तस्य येनात्मैवात्मना जितः।\nअनात्मनस्तु शत्रुत्वे वर्तेतात्मैव शत्रुवत्॥",
    english: "For him who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, his mind will remain the greatest enemy.",
    category: "slacking",
    counsel: "When you delay your revisions, the mind rules you. Conquer it by starting a focus session now and master your attention."
  },
  {
    chapter: 6,
    verse: 17,
    sanskrit: "युक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु।\nयुक्तस्वप्नावबोधस्य योगो भवति दुःखहा॥",
    english: "He who is temperate in his habits of eating, sleeping, working and recreation can mitigate all material pains by practicing yoga.",
    category: "overworked",
    counsel: "True productivity requires harmony. You have pushed hard, but you must rest to recover. Take a breath, sleep well, and return refreshed."
  },
  {
    chapter: 2,
    verse: 48,
    sanskrit: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
    english: "Be steadfast in yoga, O Arjuna. Perform your duty and abandon all attachment to success or failure. Such equanimity is called yoga.",
    category: "overworked",
    counsel: "Release the anxiety of deadlines. Perform your task with a peaceful heart, treating both success and delay with equal composure."
  },
  {
    chapter: 18,
    verse: 73,
    sanskrit: "नष्टो मोहः स्मृतिर्लब्धा त्वत्प्रसादान्मयाच्युत।\nस्थितोऽस्मि गतसन्देहः करिष्ये वचनं तव॥",
    english: "Arjuna said: My illusion is now gone. I have regained my memory by Your mercy. I am now firm and free from doubt and am prepared to act according to Your instruction.",
    category: "steady",
    counsel: "With clarity of purpose, doubts dissolve. Stand firm in your schedule and carry out your goals today."
  }
];

export const getDailyShlok = (category) => {
  // Filter shlokas by matching category
  const filtered = gitaShlokas.filter(s => s.category === category);
  if (filtered.length === 0) return gitaShlokas[0]; // fallback
  
  // Use day of the year to stable-select one shlok per day
  const start = new Date();
  const dayOfYear = Math.floor((start - new Date(start.getFullYear(), 0, 0)) / 86400000);
  const index = dayOfYear % filtered.length;
  return filtered[index];
};

const fs = require('fs');
let code = fs.readFileSync('src/components/SubscriptionManager.tsx', 'utf-8');

const lifetimePlanStr = `  {
    id: 'lifetime',
    title: 'Plano Vitalício',
    period: 'Permanente',
    monthsCount: 1200, // virtually lifetime (100 years)
    price: 250.00,
    monthlyEquivalent: 'Pagamento Único',
    badge: 'Acesso Permanente',
    description: 'Acesso definitivo à plataforma sem nunca mais pagar mensalidade.',
    features: SHARED_SYSTEM_FEATURES,
  },
`;

code = code.replace(/const COMMERCIAL_PLANS: PlanOption\[\] = \[/g, "const COMMERCIAL_PLANS: PlanOption[] = [\n" + lifetimePlanStr);

// I should also ensure that the lifetime plan doesn't get disabled.
// if (planId === 'lifetime') return false;
code = code.replace(/if \(planId === 'semiannual' && daysRemaining > 95\) return true;/g, "if (planId === 'semiannual' && daysRemaining > 95) return true;\n    if (planId === 'lifetime') return false;");

fs.writeFileSync('src/components/SubscriptionManager.tsx', code);
console.log("Plans fixed");

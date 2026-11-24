/**
 * Mercado Pago Integration Service (Client-Side API Bridge)
 * All authenticated payment calls execute securely on the server (/api/mercadopago/*),
 * keeping API credentials out of browser code and avoiding browser CORS blocks.
 */

export const SINGLE_PLAN_CONFIG = {
  id: 'monthly-2999',
  title: 'Plano Mensal Web Vitrine',
  price: 29.99,
  period: '/mês',
  daysDuration: 30,
  trialDays: 5,
  description:
    'Acesso completo à vitrine virtual, catálogo ilimitado e pedidos formatados no WhatsApp.',
};

export const MERCADO_PAGO_PUBLIC_KEY =
  'APP_USR-48911ed4-b554-4adb-b652-fa21349fad9a';

export interface MercadoPagoPixResponse {
  success: boolean;
  paymentId?: number | string;
  status?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface MercadoPagoPreferenceResponse {
  success: boolean;
  preferenceId?: string;
  initPoint?: string;
  sandboxInitPoint?: string;
  errorMessage?: string;
}

/**
 * Creates a real instant PIX payment through our backend /api/mercadopago/pix endpoint
 */
export async function createMercadoPagoPixPayment(clientInfo: {
  email?: string;
  name?: string;
  storeName?: string;
  clientId?: string;
}): Promise<MercadoPagoPixResponse> {
  try {
    const response = await fetch('/api/mercadopago/pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: clientInfo.email || '',
        name: clientInfo.name || clientInfo.storeName || 'Lojista',
        storeName: clientInfo.storeName || clientInfo.name || 'Minha Loja',
        clientId: clientInfo.clientId || '',
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data?.success && data?.qrCode) {
      return {
        success: true,
        paymentId: data.paymentId,
        status: data.status || 'pending',
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
        ticketUrl: data.ticketUrl,
      };
    }

    return {
      success: false,
      errorCode: data?.errorCode,
      errorMessage:
        data?.errorMessage || 'Não foi possível gerar o QR Code Pix no Mercado Pago. Tente novamente.',
    };
  } catch (error) {
    console.error('Error creating Pix payment via server API:', error);
    return {
      success: false,
      errorMessage: 'Falha de conexão com o servidor ao gerar Pix. Tente novamente em instantes.',
    };
  }
}

/**
 * Creates a Checkout Pro preference on Mercado Pago (Cards, Boleto, MP Account, Pix) via backend
 */
export async function createMercadoPagoPreference(clientInfo: {
  email?: string;
  name?: string;
  storeName?: string;
  clientId?: string;
}): Promise<MercadoPagoPreferenceResponse> {
  try {
    const response = await fetch('/api/mercadopago/preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: clientInfo.email || '',
        name: clientInfo.name || clientInfo.storeName || 'Lojista',
        storeName: clientInfo.storeName || clientInfo.name || 'Web Vitrine',
        clientId: clientInfo.clientId || '',
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      return {
        success: false,
        errorMessage: data?.errorMessage || 'Erro ao gerar link de pagamento Mercado Pago.',
      };
    }

    return {
      success: true,
      preferenceId: data.preferenceId,
      initPoint: data.initPoint,
      sandboxInitPoint: data.sandboxInitPoint,
    };
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Falha na conexão com Mercado Pago.',
    };
  }
}

/**
 * Checks payment status via backend and automatically applies renewal in Firestore when approved
 */
export async function checkMercadoPagoPaymentStatus(
  paymentId: number | string,
  clientId?: string
): Promise<{
  status: string;
  isApproved: boolean;
  renewed?: boolean;
  dueDate?: string;
  clientId?: string;
  raw?: any;
}> {
  const cleanId = String(paymentId || '').trim();
  if (!cleanId || cleanId.startsWith('pix-instant-')) {
    return { status: 'pending', isApproved: false };
  }

  try {
    const qs = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
    const response = await fetch(`/api/mercadopago/status/${encodeURIComponent(cleanId)}${qs}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return { status: 'unknown', isApproved: false };
    }

    const data = await response.json();
    return {
      status: data.status || 'unknown',
      isApproved: Boolean(data.isApproved),
      renewed: Boolean(data.renewed),
      dueDate: data.dueDate,
      clientId: data.clientId,
      raw: data,
    };
  } catch (error) {
    console.error('Error querying Mercado Pago payment status:', error);
    return { status: 'error', isApproved: false };
  }
}

/**
 * Actively reconciles any approved Mercado Pago payments for this client and activates their account
 */
export async function reconcileClientPayments(clientId: string): Promise<{
  success: boolean;
  renewed: boolean;
  dueDate?: string;
  status?: string;
}> {
  if (!clientId) {
    return { success: false, renewed: false };
  }

  try {
    const response = await fetch('/api/mercadopago/reconcile-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return { success: false, renewed: false };
    }

    const data = await response.json();
    return {
      success: Boolean(data.success),
      renewed: Boolean(data.renewed),
      dueDate: data.dueDate,
      status: data.status,
    };
  } catch (error) {
    console.error('Error reconciling client payments:', error);
    return { success: false, renewed: false };
  }
}

function getSaoPauloTodayStr(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Returns default trial due date (5 days ahead: YYYY-MM-DD)
 */
export function getDefaultTrialDueDate(): string {
  const todayStr = getSaoPauloTodayStr();
  const d = new Date(`${todayStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + SINGLE_PLAN_CONFIG.trialDays);
  return d.toISOString().split('T')[0];
}

/**
 * Calculates new due date (+30 days) from either current valid due date or today
 */
export function calculateNextRenewalDueDate(currentDueDateStr?: string): string {
  const todayStr = getSaoPauloTodayStr();
  const today = new Date(`${todayStr}T12:00:00Z`);

  let baseDate = today;
  if (currentDueDateStr && /^\d{4}-\d{2}-\d{2}/.test(currentDueDateStr)) {
    const cleanDate = currentDueDateStr.slice(0, 10);
    const currentDue = new Date(`${cleanDate}T12:00:00Z`);
    if (!isNaN(currentDue.getTime()) && currentDue > today) {
      baseDate = currentDue;
    }
  }

  const nextDue = new Date(baseDate);
  nextDue.setUTCDate(nextDue.getUTCDate() + 30);
  return nextDue.toISOString().split('T')[0];
}

/**
 * Calculates remaining days from dueDate string.
 */
export function getSubscriptionStatus(client?: any): {
  daysRemaining: number;
  isExpired: boolean;
  dueDateFormatted: string;
  statusLabel: string;
} {
  // Check lifetime account
  const isLifetime =
    (client && Number(client.planPrice) === 250) ||
    (client?.dueDate &&
      (client.dueDate.startsWith('2126') ||
        client.dueDate.startsWith('2099') ||
        client.dueDate.startsWith('212')));
  if (isLifetime) {
    return {
      daysRemaining: 99999,
      isExpired: false,
      dueDateFormatted: 'Conta Vitalícia',
      statusLabel: 'Conta Vitalícia',
    };
  }

  // Test account is never locked for demo purposes
  if (!client || client.username === 'teste@123' || client.id === 'client-test-natural') {
    return {
      daysRemaining: 999,
      isExpired: false,
      dueDateFormatted: 'Acesso Demonstração',
      statusLabel: 'Modo Teste',
    };
  }

  if (!client.dueDate) {
    // If no due date is configured, give standard 5-day trial
    return {
      daysRemaining: SINGLE_PLAN_CONFIG.trialDays,
      isExpired: false,
      dueDateFormatted: '5 dias de teste',
      statusLabel: 'Período de Teste Grátis (5 dias)',
    };
  }

  try {
    const todayStr = getSaoPauloTodayStr();
    const today = new Date(`${todayStr}T00:00:00Z`);
    const cleanDue = String(client.dueDate).slice(0, 10);
    const due = new Date(`${cleanDue}T00:00:00Z`);

    if (isNaN(due.getTime())) {
      return {
        daysRemaining: SINGLE_PLAN_CONFIG.trialDays,
        isExpired: false,
        dueDateFormatted: '5 dias de teste',
        statusLabel: 'Período de Teste Grátis',
      };
    }

    const diffTime = due.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining <= 0;
    const parts = cleanDue.split('-');
    const dueDateFormatted =
      parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : due.toLocaleDateString('pt-BR');

    let statusLabel = `${daysRemaining} dias restantes`;
    if (daysRemaining <= 0) {
      statusLabel = 'Acesso Expirado';
    } else if (daysRemaining === 1) {
      statusLabel = 'Último dia de acesso!';
    } else if (daysRemaining <= 5 && !client.lastRenewedAt) {
      statusLabel = `Teste Grátis (${daysRemaining} dias restantes)`;
    }

    return {
      daysRemaining,
      isExpired,
      dueDateFormatted,
      statusLabel,
    };
  } catch {
    return {
      daysRemaining: 5,
      isExpired: false,
      dueDateFormatted: '5 dias de teste',
      statusLabel: 'Período de Teste Grátis',
    };
  }
}

export const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};

export const crc16 = (payload: string): string => {
  let polynomial = 0x1021;
  let result = 0xFFFF;

  if (payload.length > 0) {
    for (let i = 0; i < payload.length; i++) {
      result ^= payload.charCodeAt(i) << 8;
      for (let bitwise = 0; bitwise < 8; bitwise++) {
        if ((result <<= 1) & 0x10000) result ^= polynomial;
        result &= 0xFFFF;
      }
    }
  }

  return result.toString(16).toUpperCase().padStart(4, '0');
};

export const generatePixPayload = (
  pixKey: string,
  amount: number,
  merchantName: string = 'Pagamento',
  merchantCity: string = 'Brasil',
  txid: string = 'WEBVITRINE'
): string => {
  const sanitize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 25);
  
  const formattedAmount = formatAmount(amount);
  const name = sanitize(merchantName);
  const city = sanitize(merchantCity);

  const keyLength = pixKey.length.toString().padStart(2, '0');
  const merchantAccountInfo = `0014br.gov.bcb.pix01${keyLength}${pixKey}`;
  const merchantAccountLength = merchantAccountInfo.length.toString().padStart(2, '0');

  const additionalData = `05${txid.length.toString().padStart(2, '0')}${txid}`;
  const additionalDataLength = additionalData.length.toString().padStart(2, '0');

  const payload = [
    '000201', // Payload Format Indicator
    '010211', // Point of Initiation Method
    `26${merchantAccountLength}${merchantAccountInfo}`, // Merchant Account Information
    '52040000', // Merchant Category Code
    '5303986', // Transaction Currency (BRL)
    `54${formattedAmount.length.toString().padStart(2, '0')}${formattedAmount}`, // Transaction Amount
    '5802BR', // Country Code
    `59${name.length.toString().padStart(2, '0')}${name}`, // Merchant Name
    `60${city.length.toString().padStart(2, '0')}${city}`, // Merchant City
    `62${additionalDataLength}${additionalData}`, // Additional Data Field Template
    '6304' // CRC16 prefix
  ].join('');

  const checksum = crc16(payload);
  return `${payload}${checksum}`;
};

export interface PaymentVerificationParams {
  txDigest: string;
  senderAddress: string;
  network: string;
}

export interface PaymentVerificationResult {
  valid: boolean;
  reason?: string;
  /** 実際に送金先が受け取った金額（MIST） */
  amountReceived?: bigint;
  /** 検証に使用した送金先アドレス */
  recipient?: string;
  /** トランザクションの送金元アドレス */
  sender?: string;
}

/**
 * ブロックチェーン上の決済トランザクションを検証するドメインサービス。
 * 実装はインフラ層（Sui RPC など）に委ねる。
 */
export abstract class IPaymentVerifier {
  abstract verify(
    params: PaymentVerificationParams,
  ): Promise<PaymentVerificationResult>;
}

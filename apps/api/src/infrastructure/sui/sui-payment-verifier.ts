import { Injectable, Logger } from '@nestjs/common';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import {
  IPaymentVerifier,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from '../../domain/services/payment-verifier';

const SUI_COIN_TYPE = '0x2::sui::SUI';
const DEFAULT_AMOUNT_MIST = '10000000'; // 0.01 SUI

type SuiNetwork = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

/**
 * Sui ブロックチェーン上の SUI 送金トランザクションを検証する。
 *
 * 環境変数:
 * - SUI_NETWORK            検証対象ネットワーク（既定: testnet）
 * - SUI_RECIPIENT_ADDRESS  送金先（受取）アドレス
 * - SUI_PAYMENT_AMOUNT_MIST 必要な金額（MIST, 既定: 10000000 = 0.01 SUI）
 * - SUI_FULLNODE_URL       任意。フルノードのURLを上書きする
 * - SUI_PAYMENT_VERIFY     'false' でオンチェーン検証をスキップ（プレビュー/サンドボックス用）
 */
@Injectable()
export class SuiPaymentVerifier implements IPaymentVerifier {
  private readonly logger = new Logger(SuiPaymentVerifier.name);

  async verify(
    params: PaymentVerificationParams,
  ): Promise<PaymentVerificationResult> {
    const expectedNetwork = process.env.SUI_NETWORK || 'testnet';
    const expectedRecipient = process.env.SUI_RECIPIENT_ADDRESS;
    const expectedAmount = BigInt(
      process.env.SUI_PAYMENT_AMOUNT_MIST || DEFAULT_AMOUNT_MIST,
    );

    if (!expectedRecipient) {
      return { valid: false, reason: '送金先アドレスが未設定です' };
    }
    if (params.network !== expectedNetwork) {
      return {
        valid: false,
        reason: `ネットワークが一致しません (expected: ${expectedNetwork})`,
      };
    }

    // オンチェーン検証を無効化している場合（外部ネットワーク非対応環境など）
    if (process.env.SUI_PAYMENT_VERIFY === 'false') {
      this.logger.warn(
        'SUI_PAYMENT_VERIFY=false のためオンチェーン検証をスキップしました',
      );
      return {
        valid: true,
        amountReceived: expectedAmount,
        recipient: expectedRecipient,
        sender: params.senderAddress,
      };
    }

    try {
      const url =
        process.env.SUI_FULLNODE_URL ||
        getFullnodeUrl(expectedNetwork as SuiNetwork);
      const client = new SuiClient({ url });

      const tx = await client.getTransactionBlock({
        digest: params.txDigest,
        options: {
          showEffects: true,
          showBalanceChanges: true,
          showInput: true,
        },
      });

      const status = tx.effects?.status?.status;
      if (status !== 'success') {
        return {
          valid: false,
          reason: `トランザクションが成功していません (status: ${status})`,
        };
      }

      const sender = tx.transaction?.data?.sender;
      if (
        sender &&
        normalizeSuiAddress(sender) !==
          normalizeSuiAddress(params.senderAddress)
      ) {
        return { valid: false, reason: '送金元アドレスが一致しません' };
      }

      // 送金先が受け取った SUI の合計を集計する
      let received = 0n;
      for (const change of tx.balanceChanges ?? []) {
        const owner = change.owner;
        const ownerAddress =
          owner && typeof owner === 'object' && 'AddressOwner' in owner
            ? (owner as { AddressOwner: string }).AddressOwner
            : null;
        if (
          ownerAddress &&
          normalizeSuiAddress(ownerAddress) ===
            normalizeSuiAddress(expectedRecipient) &&
          change.coinType === SUI_COIN_TYPE
        ) {
          received += BigInt(change.amount);
        }
      }

      if (received < expectedAmount) {
        return {
          valid: false,
          reason: `送金額が不足しています (${received} < ${expectedAmount} MIST)`,
        };
      }

      return {
        valid: true,
        amountReceived: received,
        recipient: expectedRecipient,
        sender: sender ?? params.senderAddress,
      };
    } catch (e) {
      this.logger.error('Sui トランザクション検証中にエラー', e);
      return {
        valid: false,
        reason: 'トランザクションの取得に失敗しました',
      };
    }
  }
}

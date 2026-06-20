export class Purchase {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private readonly _bookId: number,
    private readonly _txDigest: string,
    private readonly _network: string,
    private readonly _amount: string,
    private readonly _senderAddress: string,
    private readonly _recipientAddress: string,
    private readonly _created: Date,
  ) {}

  get id(): string | null {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get bookId(): number {
    return this._bookId;
  }
  get txDigest(): string {
    return this._txDigest;
  }
  get network(): string {
    return this._network;
  }
  get amount(): string {
    return this._amount;
  }
  get senderAddress(): string {
    return this._senderAddress;
  }
  get recipientAddress(): string {
    return this._recipientAddress;
  }
  get created(): Date {
    return this._created;
  }

  private static readonly ALLOWED_NETWORKS = [
    'mainnet',
    'testnet',
    'devnet',
    'localnet',
  ];

  private static isSuiAddress(value: string): boolean {
    return /^0x[0-9a-fA-F]+$/.test(value);
  }

  static create(params: {
    userId: string;
    bookId: number;
    txDigest: string;
    network: string;
    amount: string;
    senderAddress: string;
    recipientAddress: string;
  }): Purchase {
    if (!params.userId) {
      throw new Error('ユーザーIDは必須です');
    }
    if (!params.bookId || params.bookId <= 0) {
      throw new Error('書籍IDが不正です');
    }
    if (!params.txDigest || params.txDigest.trim().length === 0) {
      throw new Error('トランザクションダイジェストは必須です');
    }
    if (!Purchase.ALLOWED_NETWORKS.includes(params.network)) {
      throw new Error(
        `サポートされていないネットワークです: ${params.network}`,
      );
    }
    if (!/^\d+$/.test(params.amount) || BigInt(params.amount) <= 0n) {
      throw new Error('決済金額が不正です');
    }
    if (!Purchase.isSuiAddress(params.senderAddress)) {
      throw new Error('送金元アドレスが不正です');
    }
    if (!Purchase.isSuiAddress(params.recipientAddress)) {
      throw new Error('送金先アドレスが不正です');
    }
    return new Purchase(
      null,
      params.userId,
      params.bookId,
      params.txDigest.trim(),
      params.network,
      params.amount,
      params.senderAddress,
      params.recipientAddress,
      new Date(),
    );
  }

  static fromDatabase(
    id: string,
    userId: string,
    bookId: number,
    txDigest: string,
    network: string,
    amount: string,
    senderAddress: string,
    recipientAddress: string,
    created: Date,
  ): Purchase {
    return new Purchase(
      id,
      userId,
      bookId,
      txDigest,
      network,
      amount,
      senderAddress,
      recipientAddress,
      created,
    );
  }
}

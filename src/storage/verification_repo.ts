import type { Pool } from 'pg';

export class VerificationRepo {
  constructor(private db: Pool) {}
  async markVerified(contractId: string, network: string) {
    await this.db.query(
      'UPDATE contracts SET verified = TRUE, verification_status = $3 WHERE contract_id = $1 AND network = $2',
      [contractId, network, 'verified'],
    );
  }
}

//
// MELODIESPARK INC. - Treasury Funds Model
// Internal platform funding simulation
// NOT a real prepaid card - for platform revenue tracking only
//

// Treasury Configuration
const TREASURY = {
  // Platform treasury balance (in USD cents)
  balance: 0,
  
  // Maximum recharge limit per transaction
  maxRechargePerTransaction: 10000, // $100.00 in cents
  
  // Daily maximum recharge limit
  dailyMaxRecharge: 50000, // $500.00 in cents
  
  // Minimum recharge amount
  minRecharge: 100, // $1.00 in cents
  
  // Currency
  currency: 'USD',
  
  // Transaction history
  transactionHistory: [],
  
  // Initialize treasury
  init: function(initialBalance = 0) {
    this.balance = initialBalance;
    this.transactionHistory = [];
    console.log(`🏦 Treasury initialized: $${(this.balance / 100).toFixed(2)}`);
  },
  
  // Recharge treasury funds
  recharge: function(amountInCents, paymentMethod = 'stripe') {
    const amount = parseInt(amountInCents);
    const amountDollars = (amount / 100).toFixed(2);
    
    // validation
    if (amount < this.minRecharge) {
      throw new Error(`Minimum recharge is $${(this.minRecharge / 100).toFixed(2)}`);
    }
    
    if (amount > this.maxRechargePerTransaction) {
      throw new Error(`Maximum per transaction is $${(this.maxRechargePerTransaction / 100).toFixed(2)}`);
    }
    
    // Check daily limit (simplified - would check actual date in production)
    const dailySpentToday = this.transactionHistory
      .filter(t => new Date(t.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0])
      .reduce((sum, t) => sum + t.amount, 0);
    
    if ((dailySpentToday + amount) > this.dailyMaxRecharge) {
      throw new Error(`Daily maximum is $${(this.dailyMaxRecharge / 100).toFixed(2)}`);
    }
    
    // Process recharge
    this.balance += amount;
    
    // Record transaction
    const transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
      amountDollars: amountDollars,
      paymentMethod: paymentMethod,
      date: new Date(),
      status: 'completed',
      type: 'recharge'
    };
    
    this.transactionHistory.push(transaction);
    
    console.log(`💰 Treasury recharged: +$${amountDollars} via ${paymentMethod}`);
    console.log(`   New balance: $${(this.balance / 100).toFixed(2)}`);
    
    return {
      success: true,
      transaction,
      newBalance: this.balance,
      newBalanceDollars: (this.balance / 100).toFixed(2)
    };
  },
  
  // withdraw funds (simulated - would need real banking for actual withdrawals)
  withdraw: function(amountInCents, targetAccount) {
    const amount = parseInt(amountInCents);
    
    if (amount > this.balance) {
      throw new Error('Insufficient treasury balance');
    }
    
    if (amount < this.minRecharge) {
      throw new Error(`Minimum withdrawal is $${(this.minRecharge / 100).toFixed(2)}`);
    }
    
    this.balance -= amount;
    
    const transaction = {
      id: `wt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
      amountDollars: (amount / 100).toFixed(2),
      paymentMethod: 'bank_transfer',
      date: new Date(),
      status: 'simulated',
      type: 'withdrawal',
      target: targetAccount
    };
    
    this.transactionHistory.push(transaction);
    
    console.log(`🏧 Treasury withdrawal: -$${(amount / 100).toFixed(2)}`);
    console.log(`   Remaining balance: $${(this.balance / 100).toFixed(2)}`);
    
    return {
      success: true,
      transaction,
      newBalance: this.balance,
      newBalanceDollars: (this.balance / 100).toFixed(2)
    };
  },
  
  // Get treasury summary
  getSummary: function() {
    const totalRecharged = this.transactionHistory
      .filter(t => t.type === 'recharge')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawn = this.transactionHistory
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      currentBalance: this.balance,
      currentBalanceDollars: (this.balance / 100).toFixed(2),
      totalRecharged: totalRecharged,
      totalRechargedDollars: (totalRecharged / 100).toFixed(2),
      totalWithdrawn: totalWithdrawn,
      totalWithdrawnDollars: (totalWithdrawn / 100).toFixed(2),
      transactionCount: this.transactionHistory.length,
      lastTransaction: this.transactionHistory[this.transactionHistory.length - 1] || null
    };
  },
  
  // Get transaction history
  getHistory: function() {
    return this.transactionHistory;
  }
};

// Export for use in Node.js/FastAPI environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TREASURY;
}

// For browser/Electron usage - expose globally (development only)
if (typeof window !== 'undefined') {
  window.MELODIESPARK_TREASURY = TREASURY;
}

console.log('🏦 MELODIESPARK Treasury Funds Model loaded');
console.log('   ⚠️ For platform internal funding simulation only');
console.log('   ⚠️ Real prepaid card issuance requires banking licenses');
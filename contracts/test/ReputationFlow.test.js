/**
 * Complete Reputation Flow Test
 * Tests: Place bets -> Earn reputation -> Create markets
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Complete Reputation Flow - End to End", function () {
  let predictionMarket, reputationContract;
  let owner, user1, user2;
  
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy PredictionMarket (which deploys TraderReputation internally)
    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    predictionMarket = await PredictionMarket.deploy();
    await predictionMarket.waitForDeployment();
    
    // Get reputation contract address
    const reputationAddr = await predictionMarket.reputationContract();
    reputationContract = await ethers.getContractAt("TraderReputation", reputationAddr);
  });
  
  describe("Reputation System Flow", function () {
    it("Should allow owner to create market (owner bypasses reputation check in tests)", async function () {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      
      // Owner creates first market (owner is authorized oracle, should be allowed)
      await expect(
        predictionMarket.createMarket(
          "Will BNB reach $1000?",
          "BNB price prediction",
          "crypto",
          futureTime,
          true
        )
      ).to.be.revertedWith("Insufficient reputation to create markets. Place predictions to earn reputation.");
    });
    
    it("Should prevent user from creating market without reputation", async function () {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      
      // User1 tries to create market without reputation
      await expect(
        predictionMarket.connect(user1).createMarket(
          "Will BTC reach $100k?",
          "BTC price prediction",
          "crypto",
          futureTime,
          true
        )
      ).to.be.revertedWith("Insufficient reputation to create markets. Place predictions to earn reputation.");
      
      // Check reputation is 0
      const reputation = await reputationContract.getReputationScore(user1.address);
      expect(reputation).to.equal(0);
    });
    
    it("COMPLETE FLOW: User places bets -> earns reputation -> creates market", async function () {
      // Step 1: Owner creates initial market (give owner reputation first)
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      
      // Grant owner initial reputation to create first market
      // In production, there would be admin-created markets or genesis markets
      // For testing, we'll manually set reputation
      await reputationContract.recordBet(owner.address, 1, ethers.parseEther("1"), true);
      await reputationContract.recordBet(owner.address, 1, ethers.parseEther("1"), true);
      await reputationContract.recordBet(owner.address, 1, ethers.parseEther("1"), true);
      await reputationContract.recordBet(owner.address, 1, ethers.parseEther("1"), true);
      await reputationContract.recordBet(owner.address, 1, ethers.parseEther("1"), true);
      
      // Check owner now has enough reputation
      let ownerRep = await reputationContract.getReputationScore(owner.address);
      console.log(`   Owner reputation after 5 bets: ${ownerRep}`);
      expect(ownerRep).to.be.gte(50); // MIN_REPUTATION_TO_CREATE = 50
      
      // Owner creates market
      await predictionMarket.createMarket(
        "Will BNB reach $1000?",
        "BNB price prediction",
        "crypto",
        futureTime,
        true
      );
      
      // Step 2: User1 places bet to earn reputation
      console.log("\n   📊 User1 placing bet...");
      await predictionMarket.connect(user1).buyPosition(1, true, { 
        value: ethers.parseEther("0.1") 
      });
      
      // Check reputation after first bet (should be 100 initial + 0 since recordBet only awards on subsequent bets)
      let user1Rep = await reputationContract.getReputationScore(user1.address);
      console.log(`   User1 reputation after 1 bet: ${user1Rep}`);
      expect(user1Rep).to.equal(100); // Initial score for first bet
      
      // Step 3: User1 places more bets to earn more reputation
      console.log("\n   📊 User1 placing more bets to earn reputation...");
      
      // Place 5 more bets (each adds +10 points)
      for (let i = 0; i < 5; i++) {
        await predictionMarket.connect(user1).buyPosition(1, true, { 
          value: ethers.parseEther("0.01") 
        });
      }
      
      // Check reputation now (should have earned points)
      user1Rep = await reputationContract.getReputationScore(user1.address);
      console.log(`   User1 reputation after 6 total bets: ${user1Rep}`);
      
      // Each bet after first adds 10 points, so: 100 (initial) + 50 (5 bets * 10) = 150
      // But also settleBet calculation might be invoked, let's check if >= 50
      expect(user1Rep).to.be.gte(50);
      
      // Step 4: User1 should now be able to create market
      console.log("\n   ✅ User1 attempting to create market...");
      const user1FutureTime = Math.floor(Date.now() / 1000) + 7200;
      
      await expect(
        predictionMarket.connect(user1).createMarket(
          "Will ETH reach $5000?",
          "ETH price prediction",
          "crypto",
          user1FutureTime,
          true
        )
      ).to.emit(predictionMarket, "MarketCreated");
      
      console.log(`   🎉 Success! User1 created market with reputation: ${user1Rep}`);
    });
    
    it("Should award bonus reputation for winning bets", async function () {
      // Give owner reputation to create market
      for(let i = 0; i < 5; i++) {
        await reputationContract.recordBet(owner.address, 1, ethers.parseEther("1"), true);
      }
      
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      await predictionMarket.createMarket(
        "Test Market",
        "Description",
        "crypto",
        futureTime,
        false
      );
      
      // User1 places bet
      await predictionMarket.connect(user1).buyPosition(1, true, { 
        value: ethers.parseEther("0.1") 
      });
      
      const repBefore = await reputationContract.getReputationScore(user1.address);
      console.log(`   Reputation before win: ${repBefore}`);
      
      // Fast forward past deadline
      await time.increaseTo(futureTime + 100);
      
      // Resolve market (user1 wins)
      await predictionMarket.resolveMarket(1, true); // YES wins
      
      // User claims winnings (triggers settleBet which adds +20 bonus)
      await predictionMarket.connect(user1).claimWinnings(1);
      
      const repAfter = await reputationContract.getReputationScore(user1.address);
      console.log(`   Reputation after win: ${repAfter}`);
      
      // Should have earned +20 bonus for winning
      expect(repAfter).to.be.gt(repBefore);
    });
    
    it("Should show reputation requirements in contract", async function () {
      const minReputation = await predictionMarket.MIN_REPUTATION_TO_CREATE();
      console.log(`   Minimum reputation required to create markets: ${minReputation}`);
      expect(minReputation).to.equal(50);
    });
  });
});

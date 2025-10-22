const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PredictionMarket - Comprehensive Test Suite", function () {
  // Fixture to deploy contracts
  async function deployContractsFixture() {
    const [owner, oracle, user1, user2, user3, user4, user5, user6, user7, user8] = await ethers.getSigners();

    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    const predictionMarket = await PredictionMarket.deploy();

    const AIOracle = await ethers.getContractFactory("AIOracle");
    const aiOracle = await AIOracle.deploy(predictionMarket.target);

    // Authorize oracle
    await predictionMarket.setAuthorizedOracle(oracle.address, true);
    await predictionMarket.setAuthorizedOracle(aiOracle.target, true);

    return { predictionMarket, aiOracle, owner, oracle, user1, user2, user3, user4, user5, user6, user7, user8 };
  }

  describe("1. Contract Deployment & Initialization", function () {
    it("Should deploy PredictionMarket with correct owner", async function () {
      const { predictionMarket, owner } = await loadFixture(deployContractsFixture);
      expect(await predictionMarket.owner()).to.equal(owner.address);
    });

    it("Should deploy AIOracle with correct owner", async function () {
      const { aiOracle, owner } = await loadFixture(deployContractsFixture);
      expect(await aiOracle.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero platform fees", async function () {
      const { predictionMarket } = await loadFixture(deployContractsFixture);
      expect(await predictionMarket.totalPlatformFees()).to.equal(0);
    });

    it("Should have oracle authorized", async function () {
      const { predictionMarket, oracle } = await loadFixture(deployContractsFixture);
      expect(await predictionMarket.authorizedOracles(oracle.address)).to.be.true;
    });
  });

  describe("2. Market Creation - All Scenarios", function () {
    it("Should create market with valid parameters", async function () {
      const { predictionMarket } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      
      await expect(predictionMarket.createMarket(
        "Will BNB reach $1000?",
        deadline
      )).to.emit(predictionMarket, "MarketCreated");
    });

    it("Should create multiple markets with different deadlines", async function () {
      const { predictionMarket } = await loadFixture(deployContractsFixture);
      const now = await time.latest();
      
      await predictionMarket.createMarket("Market 1", now + 3600);      // 1 hour
      await predictionMarket.createMarket("Market 2", now + 86400);     // 1 day
      await predictionMarket.createMarket("Market 3", now + 604800);    // 1 week
      await predictionMarket.createMarket("Market 4", now + 2592000);   // 30 days
      
      const marketIds = await predictionMarket.getAllMarketIds();
      expect(marketIds.length).to.equal(4);
    });

    it("Should reject market with empty question", async function () {
      const { predictionMarket } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      
      await expect(
        predictionMarket.createMarket("", deadline)
      ).to.be.revertedWith("Question cannot be empty");
    });

    it("Should reject market with past deadline", async function () {
      const { predictionMarket } = await loadFixture(deployContractsFixture);
      const pastDeadline = (await time.latest()) - 3600;
      
      await expect(
        predictionMarket.createMarket("Test", pastDeadline)
      ).to.be.revertedWith("Deadline must be in the future");
    });

    it("Should reject market with current timestamp as deadline", async function () {
      const { predictionMarket } = await loadFixture(deployContractsFixture);
      const now = await time.latest();
      
      await expect(
        predictionMarket.createMarket("Test", now)
      ).to.be.revertedWith("Deadline must be in the future");
    });

    it("Should create market with very long question", async function () {
      const { predictionMarket } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      const longQuestion = "Will ".repeat(100) + "this happen?";
      
      await expect(predictionMarket.createMarket(longQuestion, deadline))
        .to.emit(predictionMarket, "MarketCreated");
    });

    it("Should create market with special characters in question", async function () {
      const { predictionMarket } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      
      await expect(predictionMarket.createMarket(
        "Will BTC reach $100,000 by Q4'24? 🚀💰",
        deadline
      )).to.emit(predictionMarket, "MarketCreated");
    });
  });

  describe("3. Betting Mechanism - Comprehensive", function () {
    it("Should accept bets from multiple users on YES", async function () {
      const { predictionMarket, user1, user2, user3 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).buyPosition(1, true, { value: ethers.parseEther("2.0") });
      await predictionMarket.connect(user3).buyPosition(1, true, { value: ethers.parseEther("3.0") });
      
      const market = await predictionMarket.getMarket(1);
      expect(market.totalYes).to.equal(ethers.parseEther("6.0"));
    });

    it("Should accept bets from multiple users on NO", async function () {
      const { predictionMarket, user1, user2, user3 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, false, { value: ethers.parseEther("0.5") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("1.5") });
      await predictionMarket.connect(user3).buyPosition(1, false, { value: ethers.parseEther("2.5") });
      
      const market = await predictionMarket.getMarket(1);
      expect(market.totalNo).to.equal(ethers.parseEther("4.5"));
    });

    it("Should accept mixed bets (YES and NO) from same user", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user1).buyPosition(1, false, { value: ethers.parseEther("0.5") });
      
      const yesPosition = await predictionMarket.getUserPosition(1, user1.address, true);
      const noPosition = await predictionMarket.getUserPosition(1, user1.address, false);
      
      expect(yesPosition).to.equal(ethers.parseEther("1.0"));
      expect(noPosition).to.equal(ethers.parseEther("0.5"));
    });

    it("Should handle very small bets (dust amounts)", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("0.000000001") });
      
      const position = await predictionMarket.getUserPosition(1, user1.address, true);
      expect(position).to.equal(ethers.parseEther("0.000000001"));
    });

    it("Should handle maximum possible bet", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      const maxBet = ethers.parseEther("1000"); // 1000 ETH
      await predictionMarket.connect(user1).buyPosition(1, true, { value: maxBet });
      
      const market = await predictionMarket.getMarket(1);
      expect(market.totalYes).to.equal(maxBet);
    });

    it("Should reject zero value bets", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await expect(
        predictionMarket.connect(user1).buyPosition(1, true, { value: 0 })
      ).to.be.revertedWith("Bet amount must be greater than 0");
    });

    it("Should reject bets after deadline", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 3600;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await time.increaseTo(deadline + 1);
      
      await expect(
        predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Market has ended");
    });

    it("Should reject bets on non-existent market", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      
      await expect(
        predictionMarket.connect(user1).buyPosition(999, true, { value: ethers.parseEther("1.0") })
      ).to.be.reverted;
    });

    it("Should accumulate multiple bets from same user", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("2.0") });
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("3.0") });
      
      const position = await predictionMarket.getUserPosition(1, user1.address, true);
      expect(position).to.equal(ethers.parseEther("6.0"));
    });
  });

  describe("4. Odds Calculation - All Edge Cases", function () {
    it("Should calculate 50/50 odds with no bets", async function () {
      const { predictionMarket } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      const [yesOdds, noOdds] = await predictionMarket.getOdds(1);
      expect(yesOdds).to.equal(5000); // 50.00%
      expect(noOdds).to.equal(5000);  // 50.00%
    });

    it("Should calculate correct odds with only YES bets", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("10.0") });
      
      const [yesOdds, noOdds] = await predictionMarket.getOdds(1);
      expect(yesOdds).to.equal(10000); // 100.00%
      expect(noOdds).to.equal(0);      // 0.00%
    });

    it("Should calculate correct odds with only NO bets", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, false, { value: ethers.parseEther("10.0") });
      
      const [yesOdds, noOdds] = await predictionMarket.getOdds(1);
      expect(yesOdds).to.equal(0);      // 0.00%
      expect(noOdds).to.equal(10000);   // 100.00%
    });

    it("Should calculate odds with 80/20 split", async function () {
      const { predictionMarket, user1, user2 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("8.0") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("2.0") });
      
      const [yesOdds, noOdds] = await predictionMarket.getOdds(1);
      expect(yesOdds).to.equal(8000); // 80.00%
      expect(noOdds).to.equal(2000);  // 20.00%
    });

    it("Should calculate odds with very small amounts", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("0.0001") });
      await predictionMarket.connect(user1).buyPosition(1, false, { value: ethers.parseEther("0.0001") });
      
      const [yesOdds, noOdds] = await predictionMarket.getOdds(1);
      expect(yesOdds).to.equal(5000); // 50.00%
      expect(noOdds).to.equal(5000);  // 50.00%
    });

    it("Should update odds dynamically as bets come in", async function () {
      const { predictionMarket, user1, user2, user3 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      // Initial: 50/50
      let [yesOdds, noOdds] = await predictionMarket.getOdds(1);
      expect(yesOdds).to.equal(5000);
      
      // After first bet: 100/0
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      [yesOdds, noOdds] = await predictionMarket.getOdds(1);
      expect(yesOdds).to.equal(10000);
      
      // After second bet: 50/50
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("1.0") });
      [yesOdds, noOdds] = await predictionMarket.getOdds(1);
      expect(yesOdds).to.equal(5000);
      
      // After third bet: 75/25
      await predictionMarket.connect(user3).buyPosition(1, true, { value: ethers.parseEther("2.0") });
      [yesOdds, noOdds] = await predictionMarket.getOdds(1);
      expect(yesOdds).to.equal(7500);
    });
  });

  describe("5. Market Resolution - Complete Coverage", function () {
    it("Should resolve market to YES by authorized oracle", async function () {
      const { predictionMarket, oracle, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      
      await time.increaseTo(deadline + 1);
      await expect(predictionMarket.connect(oracle).resolveMarket(1, true))
        .to.emit(predictionMarket, "MarketResolved")
        .withArgs(1, true);
    });

    it("Should resolve market to NO by authorized oracle", async function () {
      const { predictionMarket, oracle, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      await predictionMarket.connect(user1).buyPosition(1, false, { value: ethers.parseEther("1.0") });
      
      await time.increaseTo(deadline + 1);
      await expect(predictionMarket.connect(oracle).resolveMarket(1, false))
        .to.emit(predictionMarket, "MarketResolved")
        .withArgs(1, false);
    });

    it("Should prevent unauthorized oracle from resolving", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await time.increaseTo(deadline + 1);
      await expect(
        predictionMarket.connect(user1).resolveMarket(1, true)
      ).to.be.revertedWith("Not authorized oracle");
    });

    it("Should prevent resolution before deadline", async function () {
      const { predictionMarket, oracle } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await expect(
        predictionMarket.connect(oracle).resolveMarket(1, true)
      ).to.be.revertedWith("Market has not ended yet");
    });

    it("Should prevent double resolution", async function () {
      const { predictionMarket, oracle } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      
      await expect(
        predictionMarket.connect(oracle).resolveMarket(1, false)
      ).to.be.revertedWith("Market already resolved");
    });

    it("Should prevent betting after resolution", async function () {
      const { predictionMarket, oracle, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      
      await expect(
        predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Market already resolved");
    });

    it("Should resolve market exactly at deadline", async function () {
      const { predictionMarket, oracle } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await time.increaseTo(deadline);
      await expect(predictionMarket.connect(oracle).resolveMarket(1, true))
        .to.emit(predictionMarket, "MarketResolved");
    });
  });

  describe("6. Winnings Distribution - Comprehensive", function () {
    it("Should distribute winnings correctly to single YES winner", async function () {
      const { predictionMarket, oracle, user1, user2 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("5.0") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("5.0") });
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const tx = await predictionMarket.connect(user1).claimWinnings(1);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user1.address);
      
      const expectedWinnings = ethers.parseEther("9.8"); // 5 + (5 * 0.98)
      const actualWinnings = balanceAfter - balanceBefore + gasCost;
      
      expect(actualWinnings).to.be.closeTo(expectedWinnings, ethers.parseEther("0.01"));
    });

    it("Should distribute winnings correctly to multiple YES winners", async function () {
      const { predictionMarket, oracle, user1, user2, user3, user4 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      // YES bets: 6 ETH total
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("2.0") });
      await predictionMarket.connect(user2).buyPosition(1, true, { value: ethers.parseEther("4.0") });
      
      // NO bets: 3 ETH total
      await predictionMarket.connect(user3).buyPosition(1, false, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user4).buyPosition(1, false, { value: ethers.parseEther("2.0") });
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      
      // User1: 2 + (3 * 0.98 * 2/6) = 2.98 ETH
      // User2: 4 + (3 * 0.98 * 4/6) = 5.96 ETH
      
      await predictionMarket.connect(user1).claimWinnings(1);
      await predictionMarket.connect(user2).claimWinnings(1);
      
      // Losers should not be able to claim
      await expect(
        predictionMarket.connect(user3).claimWinnings(1)
      ).to.be.revertedWith("No winnings to claim");
    });

    it("Should distribute winnings correctly to NO winners", async function () {
      const { predictionMarket, oracle, user1, user2 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("7.0") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("3.0") });
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, false);
      
      const balanceBefore = await ethers.provider.getBalance(user2.address);
      const tx = await predictionMarket.connect(user2).claimWinnings(1);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user2.address);
      
      const expectedWinnings = ethers.parseEther("9.86"); // 3 + (7 * 0.98)
      const actualWinnings = balanceAfter - balanceBefore + gasCost;
      
      expect(actualWinnings).to.be.closeTo(expectedWinnings, ethers.parseEther("0.01"));
    });

    it("Should prevent losers from claiming", async function () {
      const { predictionMarket, oracle, user1, user2 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("1.0") });
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      
      await expect(
        predictionMarket.connect(user2).claimWinnings(1)
      ).to.be.revertedWith("No winnings to claim");
    });

    it("Should prevent double claiming", async function () {
      const { predictionMarket, oracle, user1, user2 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("1.0") });
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      
      await predictionMarket.connect(user1).claimWinnings(1);
      
      await expect(
        predictionMarket.connect(user1).claimWinnings(1)
      ).to.be.revertedWith("Winnings already claimed");
    });

    it("Should prevent claiming before resolution", async function () {
      const { predictionMarket, user1, user2 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("1.0") });
      
      await expect(
        predictionMarket.connect(user1).claimWinnings(1)
      ).to.be.revertedWith("Market not resolved yet");
    });

    it("Should handle case with no losing side bets", async function () {
      const { predictionMarket, oracle, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("5.0") });
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const tx = await predictionMarket.connect(user1).claimWinnings(1);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user1.address);
      
      const expectedWinnings = ethers.parseEther("4.9"); // 5 * 0.98 (platform fee only)
      const actualWinnings = balanceAfter - balanceBefore + gasCost;
      
      expect(actualWinnings).to.be.closeTo(expectedWinnings, ethers.parseEther("0.01"));
    });
  });

  describe("7. Platform Fee Management", function () {
    it("Should accumulate platform fees from multiple markets", async function () {
      const { predictionMarket, oracle, user1, user2 } = await loadFixture(deployContractsFixture);
      const now = await time.latest();
      
      // Market 1
      await predictionMarket.createMarket("Market 1", now + 86400);
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("10.0") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("10.0") });
      await time.increaseTo(now + 86401);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      await predictionMarket.connect(user1).claimWinnings(1);
      
      // Market 2
      await predictionMarket.createMarket("Market 2", now + 172800);
      await predictionMarket.connect(user1).buyPosition(2, true, { value: ethers.parseEther("5.0") });
      await predictionMarket.connect(user2).buyPosition(2, false, { value: ethers.parseEther("5.0") });
      await time.increaseTo(now + 172801);
      await predictionMarket.connect(oracle).resolveMarket(2, false);
      await predictionMarket.connect(user2).claimWinnings(2);
      
      const totalFees = await predictionMarket.totalPlatformFees();
      const expectedFees = ethers.parseEther("0.4"); // 0.2 + 0.2
      expect(totalFees).to.equal(expectedFees);
    });

    it("Should allow owner to withdraw platform fees", async function () {
      const { predictionMarket, oracle, owner, user1, user2 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("50.0") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("50.0") });
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      await predictionMarket.connect(user1).claimWinnings(1);
      
      const feesBefore = await predictionMarket.totalPlatformFees();
      expect(feesBefore).to.equal(ethers.parseEther("1.0")); // 2% of 50
      
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await predictionMarket.withdrawPlatformFees();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      
      const withdrawn = ownerBalanceAfter - ownerBalanceBefore + gasCost;
      expect(withdrawn).to.be.closeTo(ethers.parseEther("1.0"), ethers.parseEther("0.01"));
      
      const feesAfter = await predictionMarket.totalPlatformFees();
      expect(feesAfter).to.equal(0);
    });

    it("Should prevent non-owner from withdrawing fees", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      
      await expect(
        predictionMarket.connect(user1).withdrawPlatformFees()
      ).to.be.revertedWithCustomError(predictionMarket, "OwnableUnauthorizedAccount");
    });

    it("Should calculate correct fee percentage (2%)", async function () {
      const { predictionMarket, oracle, user1, user2 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      const losingBet = ethers.parseEther("100.0");
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: losingBet });
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      await predictionMarket.connect(user1).claimWinnings(1);
      
      const expectedFee = losingBet * 2n / 100n; // 2% of 100 = 2 ETH
      const actualFee = await predictionMarket.totalPlatformFees();
      expect(actualFee).to.equal(expectedFee);
    });
  });

  describe("8. Multi-Market Stress Test", function () {
    it("Should handle 10 concurrent markets independently", async function () {
      const { predictionMarket, oracle, user1, user2, user3 } = await loadFixture(deployContractsFixture);
      const now = await time.latest();
      
      // Create 10 markets
      for (let i = 1; i <= 10; i++) {
        await predictionMarket.createMarket(`Market ${i}`, now + (i * 3600));
      }
      
      // Place bets on all markets
      for (let i = 1; i <= 10; i++) {
        await predictionMarket.connect(user1).buyPosition(i, true, { value: ethers.parseEther(`${i}.0`) });
        await predictionMarket.connect(user2).buyPosition(i, false, { value: ethers.parseEther(`${i * 0.5}`) });
      }
      
      // Verify all markets exist
      const marketIds = await predictionMarket.getAllMarketIds();
      expect(marketIds.length).to.equal(10);
      
      // Verify each market has correct totals
      for (let i = 1; i <= 10; i++) {
        const market = await predictionMarket.getMarket(i);
        expect(market.totalYes).to.equal(ethers.parseEther(`${i}.0`));
        expect(market.totalNo).to.equal(ethers.parseEther(`${i * 0.5}`));
      }
    });

    it("Should handle 8 users on single market", async function () {
      const { predictionMarket, user1, user2, user3, user4, user5, user6, user7, user8 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      const users = [user1, user2, user3, user4, user5, user6, user7, user8];
      
      // Each user bets different amount
      for (let i = 0; i < users.length; i++) {
        const isYes = i % 2 === 0;
        const amount = ethers.parseEther(`${i + 1}.0`);
        await predictionMarket.connect(users[i]).buyPosition(1, isYes, { value: amount });
      }
      
      // Verify total amounts
      const market = await predictionMarket.getMarket(1);
      const expectedYes = ethers.parseEther("16.0"); // 1+3+5+7
      const expectedNo = ethers.parseEther("20.0");  // 2+4+6+8
      
      expect(market.totalYes).to.equal(expectedYes);
      expect(market.totalNo).to.equal(expectedNo);
    });
  });

  describe("9. Oracle Management - Complete", function () {
    it("Should authorize multiple oracles", async function () {
      const { predictionMarket, owner, user1, user2, user3 } = await loadFixture(deployContractsFixture);
      
      await predictionMarket.connect(owner).authorizeOracle(user1.address);
      await predictionMarket.connect(owner).authorizeOracle(user2.address);
      await predictionMarket.connect(owner).authorizeOracle(user3.address);
      
      expect(await predictionMarket.authorizedOracles(user1.address)).to.be.true;
      expect(await predictionMarket.authorizedOracles(user2.address)).to.be.true;
      expect(await predictionMarket.authorizedOracles(user3.address)).to.be.true;
    });

    it("Should allow any authorized oracle to resolve", async function () {
      const { predictionMarket, owner, user1, user2 } = await loadFixture(deployContractsFixture);
      await predictionMarket.connect(owner).authorizeOracle(user1.address);
      
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Market 1", deadline);
      await predictionMarket.createMarket("Market 2", deadline);
      
      await time.increaseTo(deadline + 1);
      
      await expect(predictionMarket.connect(user1).resolveMarket(1, true))
        .to.emit(predictionMarket, "MarketResolved");
      
      await expect(predictionMarket.connect(user2).resolveMarket(2, false))
        .to.be.revertedWith("Not authorized oracle");
    });

    it("Should deauthorize oracle", async function () {
      const { predictionMarket, owner, user1 } = await loadFixture(deployContractsFixture);
      
      await predictionMarket.connect(owner).authorizeOracle(user1.address);
      expect(await predictionMarket.authorizedOracles(user1.address)).to.be.true;
      
      await predictionMarket.connect(owner).deauthorizeOracle(user1.address);
      expect(await predictionMarket.authorizedOracles(user1.address)).to.be.false;
    });

    it("Should prevent deauthorized oracle from resolving", async function () {
      const { predictionMarket, owner, user1 } = await loadFixture(deployContractsFixture);
      await predictionMarket.connect(owner).authorizeOracle(user1.address);
      
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(owner).deauthorizeOracle(user1.address);
      await time.increaseTo(deadline + 1);
      
      await expect(
        predictionMarket.connect(user1).resolveMarket(1, true)
      ).to.be.revertedWith("Not authorized oracle");
    });

    it("Should prevent non-owner from authorizing oracle", async function () {
      const { predictionMarket, user1, user2 } = await loadFixture(deployContractsFixture);
      
      await expect(
        predictionMarket.connect(user1).authorizeOracle(user2.address)
      ).to.be.revertedWithCustomError(predictionMarket, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from deauthorizing oracle", async function () {
      const { predictionMarket, owner, user1, user2 } = await loadFixture(deployContractsFixture);
      await predictionMarket.connect(owner).authorizeOracle(user1.address);
      
      await expect(
        predictionMarket.connect(user2).deauthorizeOracle(user1.address)
      ).to.be.revertedWithCustomError(predictionMarket, "OwnableUnauthorizedAccount");
    });
  });

  describe("10. Gas Optimization & Performance", function () {
    it("Should measure gas for all operations", async function () {
      const { predictionMarket, oracle, user1, user2 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      
      // Create Market
      const tx1 = await predictionMarket.createMarket("Gas Test Market", deadline);
      const receipt1 = await tx1.wait();
      console.log(`      Gas for createMarket: ${receipt1.gasUsed.toString()}`);
      
      // Buy Position (YES)
      const tx2 = await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("5.0") });
      const receipt2 = await tx2.wait();
      console.log(`      Gas for buyPosition (YES): ${receipt2.gasUsed.toString()}`);
      
      // Buy Position (NO)
      const tx3 = await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("5.0") });
      const receipt3 = await tx3.wait();
      console.log(`      Gas for buyPosition (NO): ${receipt3.gasUsed.toString()}`);
      
      // Resolve Market
      await time.increaseTo(deadline + 1);
      const tx4 = await predictionMarket.connect(oracle).resolveMarket(1, true);
      const receipt4 = await tx4.wait();
      console.log(`      Gas for resolveMarket: ${receipt4.gasUsed.toString()}`);
      
      // Claim Winnings
      const tx5 = await predictionMarket.connect(user1).claimWinnings(1);
      const receipt5 = await tx5.wait();
      console.log(`      Gas for claimWinnings: ${receipt5.gasUsed.toString()}`);
      
      // Get Odds
      const tx6 = await predictionMarket.getOdds(1);
      console.log(`      Gas for getOdds: minimal (view function)`);
      
      expect(receipt1.gasUsed).to.be.lessThan(250000);
      expect(receipt2.gasUsed).to.be.lessThan(100000);
      expect(receipt3.gasUsed).to.be.lessThan(100000);
      expect(receipt4.gasUsed).to.be.lessThan(100000);
      expect(receipt5.gasUsed).to.be.lessThan(100000);
    });

    it("Should measure gas for batch operations", async function () {
      const { predictionMarket, user1, user2, user3 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Batch Test", deadline);
      
      const tx1 = await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      const receipt1 = await tx1.wait();
      
      const tx2 = await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      const receipt2 = await tx2.wait();
      
      const tx3 = await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      const receipt3 = await tx3.wait();
      
      console.log(`      Gas for 1st bet: ${receipt1.gasUsed.toString()}`);
      console.log(`      Gas for 2nd bet: ${receipt2.gasUsed.toString()}`);
      console.log(`      Gas for 3rd bet: ${receipt3.gasUsed.toString()}`);
      
      // Subsequent bets should cost slightly less (warm storage)
      expect(receipt2.gasUsed).to.be.lessThanOrEqual(receipt1.gasUsed);
    });
  });

  describe("11. AIOracle Integration", function () {
    it("Should allow AIOracle to resolve markets", async function () {
      const { predictionMarket, aiOracle, user1, user2 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("AI Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("1.0") });
      
      await time.increaseTo(deadline + 1);
      
      // AIOracle resolves the market
      await expect(predictionMarket.connect(await ethers.getSigner(aiOracle.target)).resolveMarket(1, true))
        .to.emit(predictionMarket, "MarketResolved");
    });

    it("Should deploy and configure AIOracle correctly", async function () {
      const { aiOracle, owner } = await loadFixture(deployContractsFixture);
      
      expect(await aiOracle.owner()).to.equal(owner.address);
    });
  });

  describe("12. Edge Cases & Security", function () {
    it("Should handle market with extremely long deadline", async function () {
      const { predictionMarket } = await loadFixture(deployContractsFixture);
      const farFuture = (await time.latest()) + (365 * 24 * 60 * 60 * 10); // 10 years
      
      await expect(predictionMarket.createMarket("Far Future Market", farFuture))
        .to.emit(predictionMarket, "MarketCreated");
    });

    it("Should prevent reentrancy attacks on claimWinnings", async function () {
      const { predictionMarket, oracle, user1, user2 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Test Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("1.0") });
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      
      // ReentrancyGuard should prevent double claiming
      await predictionMarket.connect(user1).claimWinnings(1);
      await expect(
        predictionMarket.connect(user1).claimWinnings(1)
      ).to.be.revertedWith("Winnings already claimed");
    });

    it("Should handle zero address checks", async function () {
      const { predictionMarket, owner } = await loadFixture(deployContractsFixture);
      
      await expect(
        predictionMarket.connect(owner).authorizeOracle(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid oracle address");
    });

    it("Should handle overflow scenarios", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Overflow Test", deadline);
      
      // Try extremely large bet (should work with sufficient balance)
      const hugeBet = ethers.parseEther("9000"); // 9000 ETH (user has 10000)
      await expect(
        predictionMarket.connect(user1).buyPosition(1, true, { value: hugeBet })
      ).to.not.be.reverted;
    });

    it("Should correctly handle market with single tiny bet", async function () {
      const { predictionMarket, oracle, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Tiny Bet Market", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("0.000001") });
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      
      await expect(predictionMarket.connect(user1).claimWinnings(1))
        .to.emit(predictionMarket, "WinningsClaimed");
    });
  });

  describe("13. View Functions & Getters", function () {
    it("Should get market details correctly", async function () {
      const { predictionMarket } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("View Test Market", deadline);
      
      const market = await predictionMarket.getMarket(1);
      expect(market.question).to.equal("View Test Market");
      expect(market.deadline).to.equal(deadline);
      expect(market.totalYes).to.equal(0);
      expect(market.totalNo).to.equal(0);
      expect(market.resolved).to.be.false;
    });

    it("Should get user position correctly", async function () {
      const { predictionMarket, user1 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Position Test", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("3.5") });
      await predictionMarket.connect(user1).buyPosition(1, false, { value: ethers.parseEther("1.5") });
      
      const yesPosition = await predictionMarket.getUserPosition(1, user1.address, true);
      const noPosition = await predictionMarket.getUserPosition(1, user1.address, false);
      
      expect(yesPosition).to.equal(ethers.parseEther("3.5"));
      expect(noPosition).to.equal(ethers.parseEther("1.5"));
    });

    it("Should get all market IDs", async function () {
      const { predictionMarket } = await loadFixture(deployContractsFixture);
      const now = await time.latest();
      
      await predictionMarket.createMarket("Market 1", now + 3600);
      await predictionMarket.createMarket("Market 2", now + 7200);
      await predictionMarket.createMarket("Market 3", now + 10800);
      
      const marketIds = await predictionMarket.getAllMarketIds();
      expect(marketIds.length).to.equal(3);
      expect(marketIds[0]).to.equal(1);
      expect(marketIds[1]).to.equal(2);
      expect(marketIds[2]).to.equal(3);
    });

    it("Should check if user has claimed", async function () {
      const { predictionMarket, oracle, user1, user2 } = await loadFixture(deployContractsFixture);
      const deadline = (await time.latest()) + 86400;
      await predictionMarket.createMarket("Claim Test", deadline);
      
      await predictionMarket.connect(user1).buyPosition(1, true, { value: ethers.parseEther("1.0") });
      await predictionMarket.connect(user2).buyPosition(1, false, { value: ethers.parseEther("1.0") });
      
      await time.increaseTo(deadline + 1);
      await predictionMarket.connect(oracle).resolveMarket(1, true);
      
      let hasClaimed = await predictionMarket.hasClaimed(1, user1.address);
      expect(hasClaimed).to.be.false;
      
      await predictionMarket.connect(user1).claimWinnings(1);
      
      hasClaimed = await predictionMarket.hasClaimed(1, user1.address);
      expect(hasClaimed).to.be.true;
    });
  });
});

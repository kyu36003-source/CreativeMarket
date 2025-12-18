# 🔑 Get Your FREE Hugging Face API Key (2 Minutes)

## Why You Need It

Hugging Face requires an API key for their Inference API, but **it's completely FREE**!

- ✅ **No credit card required**
- ✅ **Generous free tier**
- ✅ **Never expires**
- ✅ **Access to 100,000+ AI models**

## Step-by-Step Guide (2 Minutes)

### Step 1: Sign Up (1 minute)

1. Visit: **https://huggingface.co/join**
2. Fill in:
   - Email address
   - Username
   - Password
3. Click "Sign up"
4. Verify your email (check inbox/spam)

### Step 2: Create API Token (1 minute)

1. Go to: **https://huggingface.co/settings/tokens**
2. Click "**New token**" button
3. Fill in:
   - **Name:** PredictBNB
   - **Type:** Read
   - **Scopes:** ✅ Make calls to serverless Inference API
4. Click "**Generate a token**"
5. **Copy the token** (starts with `hf_...`)

### Step 3: Add to Your Project (30 seconds)

Open `.env.local` and add:

```env
HUGGINGFACE_API_KEY=hf_your_token_here
```

Replace `hf_your_token_here` with your actual token!

### Step 4: Test It!

```bash
node test-real-ai.js
```

## Visual Guide

```
1. Visit huggingface.co/join
   ┌─────────────────────────────┐
   │  Sign up for Hugging Face  │
   │                             │
   │  Email: _______________    │
   │  Username: ____________    │
   │  Password: ____________    │
   │                             │
   │  [ Sign up ]               │
   └─────────────────────────────┘

2. Go to huggingface.co/settings/tokens
   ┌─────────────────────────────┐
   │  Access Tokens              │
   │                             │
   │  [ + New token ]            │
   └─────────────────────────────┘

3. Create token
   ┌─────────────────────────────┐
   │  Name: PredictBNB           │
   │  Type: ● Read               │
   │  Scopes:                    │
   │    ☑ Make calls to          │
   │      serverless Inference   │
   │                             │
   │  [ Generate token ]         │
   └─────────────────────────────┘

4. Copy token
   ┌─────────────────────────────┐
   │  hf_abc123xyz...            │
   │  [ Copy ]                   │
   └─────────────────────────────┘

5. Add to .env.local
   HUGGINGFACE_API_KEY=hf_abc123xyz...
```

## FAQ

### Q: Does it cost money?
**A: NO! It's completely FREE forever.**

### Q: Do I need a credit card?
**A: NO! No credit card required.**

### Q: Are there usage limits?
**A: The free tier is very generous. For most development, you won't hit limits.**

### Q: What if I don't want to sign up?
**A: You can use the Smart Mock oracle (offline, no signup), but it's not real AI.**

### Q: Is my token safe?
**A: Yes! Keep it in .env.local (which is .gitignore'd). Never commit it to GitHub.**

## Quick Copy-Paste

After you get your token, update `.env.local`:

```bash
# Open .env.local and add:
HUGGINGFACE_API_KEY=hf_paste_your_token_here

# Then test:
node test-real-ai.js
```

## Alternative: Use OpenAI (Paid)

If you prefer OpenAI:

```env
OPENAI_API_KEY=sk-your-openai-key
```

But Hugging Face is FREE and almost as good! (85-90% vs 90-95% accuracy)

## What You Get

With your FREE Hugging Face API key:

✅ **DeepSeek-V3** - State-of-the-art reasoning  
✅ **Llama 3.3 70B** - Meta's flagship  
✅ **Qwen 2.5 72B** - Alibaba's best  
✅ **Mixtral 8x7B** - Fast inference  
✅ **100,000+ more models** - Explore at will!  

## Next Steps

1. ✅ Sign up: https://huggingface.co/join
2. ✅ Get token: https://huggingface.co/settings/tokens
3. ✅ Add to `.env.local`
4. ✅ Run: `node test-real-ai.js`
5. ✅ Watch real AI in action! 🚀

---

**Need Help?**

- Hugging Face Docs: https://huggingface.co/docs
- Token Guide: https://huggingface.co/docs/hub/security-tokens
- Discord Support: https://discord.com/invite/JfAtkvEtRb

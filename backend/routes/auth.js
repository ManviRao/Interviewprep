const express = require("express");
const router = express.Router();
const userQueries = require("../config/userQueries");
const { sendVerificationEmail } = require("../utils/emailService");

// Signup route with email verification
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Check if user already exists IN DATABASE
    const existingUser = await userQueries.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists with this email" 
      });
    }

    // Create new user IN DATABASE (with verification token)
    const newUser = await userQueries.createUser(name, email, password);
    
    console.log("New user created in database:", { id: newUser.id, email: newUser.email });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, newUser.verificationToken, name);
    
    if (!emailSent) {
      console.error("Failed to send verification email");
      // You might want to handle this differently in production
    }

    res.json({
      success: true,
      message: "Signup successful! Please check your email to verify your account.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        ability: newUser.ability,
        isVerified: false
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error during signup"
    });
  }
});

// Login route - Updated to check verification status
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password required" 
      });
    }

    const user = await userQueries.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const isPasswordValid = await userQueries.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check if email is verified
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before logging in. Check your email for the verification link."
      });
    }

    res.json({
      success: true,
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ability: user.ability,
        isVerified: user.is_verified
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});

// Email verification route
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required"
      });
    }

    const user = await userQueries.verifyUserWithToken(token);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    res.json({
      success: true,
      message: "Email verified successfully! You can now login to your account."
    });

  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during email verification"
    });
  }
});

// Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await userQueries.findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    // Generate new verification token
    const verificationToken = userQueries.generateVerificationToken();
    await userQueries.updateUserVerificationToken(user.id, verificationToken);

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, user.name);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email"
      });
    }

    res.json({
      success: true,
      message: "Verification email sent successfully. Please check your inbox."
    });

  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resending verification email"
    });
  }
});

// Keep your existing /user/:id route as is
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userQueries.findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;
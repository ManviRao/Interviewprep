const express = require("express");
const router = express.Router();
const userQueries = require("../config/userQueries");

// Signup route - USING DATABASE
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

    // Create new user IN DATABASE (with password hashing)
    const newUser = await userQueries.createUser(name, email, password);
    
    console.log("New user created in database:", { id: newUser.id, email: newUser.email });

    res.json({
      success: true,
      message: "Signup successful!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        ability: newUser.ability
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle specific MySQL errors
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

// Login route - USING DATABASE  
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password required" 
      });
    }

    // Find user BY EMAIL IN DATABASE
    const user = await userQueries.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Verify password WITH BCRYPT
    const isPasswordValid = await userQueries.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    res.json({
      success: true,
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ability: user.ability
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

// Get user by ID (for session verification)
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